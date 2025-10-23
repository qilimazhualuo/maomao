use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use ssh2::Session;
use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::TcpStream as StdTcpStream;
use std::sync::Arc;
use thiserror::Error;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::Mutex;
use tokio::task;

#[derive(Debug, Error, Serialize)]
pub enum SshError {
    #[error("SSH连接失败: {0}")]
    ConnectionError(String),

    #[error("SSH认证失败: {0}")]
    AuthError(String),

    #[error("端口绑定失败: {0}")]
    BindError(String),

    #[error("通道创建失败: {0}")]
    ChannelError(String),

    #[error("数据转发失败: {0}")]
    ForwardError(String),
}

#[derive(Debug, Deserialize, Clone)]
pub struct SshTunnelConfig {
    #[serde(rename = "sshHost")]
    pub ssh_host: String,
    #[serde(rename = "sshPort")]
    pub ssh_port: u16,
    #[serde(rename = "sshUser")]
    pub ssh_user: String,
    #[serde(rename = "sshPassword")]
    pub ssh_password: String,
    #[serde(rename = "localPort")]
    pub local_port: u16,
    #[serde(rename = "remoteHost")]
    pub remote_host: String,
    #[serde(rename = "remotePort")]
    pub remote_port: u16,
}

#[derive(Debug, Serialize)]
pub struct SshTunnelStatus {
    #[serde(rename = "localAddress")]
    pub local_address: String,
    #[serde(rename = "remoteAddress")]
    pub remote_address: String,
    pub status: String,
}

// 全局存储活跃的隧道
type TunnelId = String;
type TunnelHandle = tokio::task::JoinHandle<()>;

static ACTIVE_TUNNELS: Lazy<Arc<Mutex<HashMap<TunnelId, TunnelHandle>>>> =
    Lazy::new(|| Arc::new(Mutex::new(HashMap::new())));

#[tauri::command]
pub async fn start_ssh_tunnel(
    ssh_host: String,
    ssh_port: u16,
    ssh_user: String,
    ssh_password: String,
    local_port: u16,
    remote_host: String,
    remote_port: u16,
) -> Result<SshTunnelStatus, SshError> {
    let tunnel_id = format!("{}-{}", local_port, remote_host);

    // 检查是否已经存在相同的隧道
    {
        let tunnels = ACTIVE_TUNNELS.lock().await;
        if tunnels.contains_key(&tunnel_id) {
            return Err(SshError::BindError("隧道已存在".to_string()));
        }
    }

    // 启动本地端口监听
    let local_addr = format!("127.0.0.1:{}", local_port);
    let listener = TcpListener::bind(&local_addr)
        .await
        .map_err(|e| SshError::BindError(format!("绑定端口失败: {}", e)))?;

    let remote_addr = format!("{}:{}", remote_host, remote_port);

    // 在后台任务中处理连接
    let tunnel_handle = tokio::spawn(async move {
        loop {
            match listener.accept().await {
                Ok((local_stream, _)) => {
                    let ssh_host = ssh_host.clone();
                    let ssh_port = ssh_port;
                    let ssh_user = ssh_user.clone();
                    let ssh_password = ssh_password.clone();
                    let remote_host = remote_host.clone();
                    let remote_port = remote_port;

                    // 使用阻塞任务处理 SSH 连接
                    tokio::task::spawn_blocking(move || {
                        if let Err(e) = handle_connection_blocking(
                            ssh_host,
                            ssh_port,
                            ssh_user,
                            ssh_password,
                            remote_host,
                            remote_port,
                            local_stream,
                        ) {
                            eprintln!("连接处理失败: {}", e);
                        }
                    });
                }
                Err(e) => {
                    eprintln!("接受连接失败: {}", e);
                    break;
                }
            }
        }
    });

    // 存储隧道句柄
    {
        let mut tunnels = ACTIVE_TUNNELS.lock().await;
        tunnels.insert(tunnel_id.clone(), tunnel_handle);
    }

    Ok(SshTunnelStatus {
        local_address: local_addr,
        remote_address: remote_addr,
        status: "运行中".to_string(),
    })
}

fn handle_connection_blocking(
    ssh_host: String,
    ssh_port: u16,
    ssh_user: String,
    ssh_password: String,
    remote_host: String,
    remote_port: u16,
    local_stream: TcpStream,
) -> Result<(), SshError> {
    // 建立 SSH 连接
    let ssh_addr = format!("{}:{}", ssh_host, ssh_port);
    let tcp = StdTcpStream::connect(&ssh_addr)
        .map_err(|e| SshError::ConnectionError(format!("SSH连接失败: {}", e)))?;

    let mut sess =
        Session::new().map_err(|e| SshError::ConnectionError(format!("创建SSH会话失败: {}", e)))?;

    sess.set_tcp_stream(tcp);
    sess.handshake()
        .map_err(|e| SshError::ConnectionError(format!("SSH握手失败: {}", e)))?;

    sess.userauth_password(&ssh_user, &ssh_password)
        .map_err(|e| SshError::AuthError(format!("SSH认证失败: {}", e)))?;

    // 创建 SSH 通道
    let mut channel = sess
        .channel_direct_tcpip(&remote_host, remote_port, None)
        .map_err(|e| {
            let error_msg = format!("创建SSH通道失败: {}", e);
            if error_msg.contains("administratively prohibited") {
                SshError::ChannelError(format!("SSH服务器禁止端口转发。请检查服务器配置：\n1. 确保 AllowTcpForwarding yes\n2. 确保用户有端口转发权限\n3. 联系服务器管理员启用端口转发功能"))
            } else {
                SshError::ChannelError(error_msg)
            }
        })?;

    // 将 tokio TcpStream 转换为标准库的 TcpStream
    let mut local_stream = local_stream
        .into_std()
        .map_err(|e| SshError::ForwardError(format!("转换流失败: {}", e)))?;

    // 双向数据转发 - 使用简单的循环
    let mut buffer = [0; 4096];
    loop {
        // 从本地读取数据并发送到远程
        match local_stream.read(&mut buffer) {
            Ok(0) => break, // 连接关闭
            Ok(n) => {
                if let Err(_) = channel.write(&buffer[..n]) {
                    break;
                }
                if let Err(_) = channel.flush() {
                    break;
                }
            }
            Err(_) => break,
        }

        // 从远程读取数据并发送到本地
        match channel.read(&mut buffer) {
            Ok(0) => break, // 连接关闭
            Ok(n) => {
                if let Err(_) = local_stream.write(&buffer[..n]) {
                    break;
                }
                if let Err(_) = local_stream.flush() {
                    break;
                }
            }
            Err(_) => break,
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn stop_ssh_tunnel(tunnel_id: String) -> Result<String, SshError> {
    let mut tunnels = ACTIVE_TUNNELS.lock().await;

    if let Some(handle) = tunnels.remove(&tunnel_id) {
        handle.abort();
        Ok(format!("隧道 {} 已停止", tunnel_id))
    } else {
        Err(SshError::BindError("隧道不存在".to_string()))
    }
}

#[tauri::command]
pub async fn list_ssh_tunnels() -> Result<Vec<String>, SshError> {
    let tunnels = ACTIVE_TUNNELS.lock().await;
    Ok(tunnels.keys().cloned().collect())
}

#[tauri::command]
pub async fn test_ssh_connection(
    ssh_host: String,
    ssh_port: u16,
    ssh_user: String,
    ssh_password: String,
) -> Result<String, SshError> {
    let result = task::spawn_blocking(move || -> Result<(), SshError> {
        let ssh_addr = format!("{}:{}", ssh_host, ssh_port);
        let tcp = StdTcpStream::connect(&ssh_addr)
            .map_err(|e| SshError::ConnectionError(format!("SSH连接失败: {}", e)))?;

        let mut sess = Session::new()
            .map_err(|e| SshError::ConnectionError(format!("创建SSH会话失败: {}", e)))?;

        sess.set_tcp_stream(tcp);
        sess.handshake()
            .map_err(|e| SshError::ConnectionError(format!("SSH握手失败: {}", e)))?;

        sess.userauth_password(&ssh_user, &ssh_password)
            .map_err(|e| SshError::AuthError(format!("SSH认证失败: {}", e)))?;

        Ok(())
    })
    .await
    .map_err(|e| SshError::ConnectionError(format!("任务执行失败: {}", e)))?;

    // 检查 SSH 连接结果
    result?;

    Ok("SSH连接测试成功".to_string())
}
