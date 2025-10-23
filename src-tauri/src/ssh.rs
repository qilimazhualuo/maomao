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
#[serde(rename_all = "camelCase")]
pub struct SshTunnelConfig {
    pub ssh_host: String,
    pub ssh_port: u16,
    pub ssh_user: String,
    pub ssh_password: String,
    pub local_port: u16,
    pub remote_host: String,
    pub remote_port: u16,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SshTunnelStatus {
    pub local_address: String,
    pub remote_address: String,
    pub status: String,
}

// 全局存储活跃的隧道
type TunnelId = String;
type TunnelHandle = tokio::task::JoinHandle<()>;

static ACTIVE_TUNNELS: Lazy<Arc<Mutex<HashMap<TunnelId, TunnelHandle>>>> =
    Lazy::new(|| Arc::new(Mutex::new(HashMap::new())));

#[tauri::command]
pub async fn start_ssh_tunnel(config: SshTunnelConfig) -> Result<SshTunnelStatus, SshError> {
    let tunnel_id = format!("{}-{}", config.local_port, config.remote_host);

    // 检查是否已经存在相同的隧道
    {
        let tunnels = ACTIVE_TUNNELS.lock().await;
        if tunnels.contains_key(&tunnel_id) {
            return Err(SshError::BindError("隧道已存在".to_string()));
        }
    }

    // 启动本地端口监听
    let local_addr = format!("127.0.0.1:{}", config.local_port);
    let listener = TcpListener::bind(&local_addr)
        .await
        .map_err(|e| SshError::BindError(format!("绑定端口失败: {}", e)))?;

    let remote_addr = format!("{}:{}", config.remote_host, config.remote_port);

    // 在后台任务中处理连接
    let tunnel_handle = tokio::spawn(async move {
        loop {
            match listener.accept().await {
                Ok((local_stream, _)) => {
                    let ssh_config = config.clone();

                    // 使用阻塞任务处理 SSH 连接
                    tokio::task::spawn_blocking(move || {
                        if let Err(e) = handle_connection_blocking(ssh_config, local_stream) {
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
    config: SshTunnelConfig,
    local_stream: TcpStream,
) -> Result<(), SshError> {
    // 建立 SSH 连接
    let ssh_addr = format!("{}:{}", config.ssh_host, config.ssh_port);
    let tcp = StdTcpStream::connect(&ssh_addr)
        .map_err(|e| SshError::ConnectionError(format!("SSH连接失败: {}", e)))?;

    let mut sess =
        Session::new().map_err(|e| SshError::ConnectionError(format!("创建SSH会话失败: {}", e)))?;

    sess.set_tcp_stream(tcp);
    sess.handshake()
        .map_err(|e| SshError::ConnectionError(format!("SSH握手失败: {}", e)))?;

    sess.userauth_password(&config.ssh_user, &config.ssh_password)
        .map_err(|e| SshError::AuthError(format!("SSH认证失败: {}", e)))?;

    // 创建 SSH 通道
    let mut channel = sess
        .channel_direct_tcpip(&config.remote_host, config.remote_port, None)
        .map_err(|e| SshError::ChannelError(format!("创建SSH通道失败: {}", e)))?;

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
