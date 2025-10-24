use once_cell::sync::Lazy;
use serde::Serialize;
// use ssh_rs;
use std::collections::HashMap;
use std::sync::Arc;
use thiserror::Error;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::Mutex;

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

impl SshError {
    pub fn to_user_message(&self) -> String {
        match self {
            SshError::ConnectionError(msg) => format!("SSH连接失败: {}", msg),
            SshError::AuthError(msg) => format!("SSH认证失败: {}", msg),
            SshError::BindError(msg) => msg.clone(),
            SshError::ChannelError(msg) => format!("通道创建失败: {}", msg),
            SshError::ForwardError(msg) => format!("数据转发失败: {}", msg),
        }
    }
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

                    // 使用 russh 处理连接
                    tokio::spawn(async move {
                        if let Err(e) = handle_connection_russh(
                            ssh_host,
                            ssh_port,
                            ssh_user,
                            ssh_password,
                            remote_host,
                            remote_port,
                            local_stream,
                        )
                        .await
                        {
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

async fn handle_connection_russh(
    ssh_host: String,
    ssh_port: u16,
    ssh_user: String,
    ssh_password: String,
    remote_host: String,
    remote_port: u16,
    local_stream: TcpStream,
) -> Result<(), SshError> {
    eprintln!("开始处理 SSH 连接...");

    // 获取本地端口
    let local_port = local_stream
        .local_addr()
        .map_err(|e| SshError::ConnectionError(format!("获取本地地址失败: {}", e)))?
        .port();

    // 使用系统 SSH 客户端进行端口转发
    let mut child = tokio::process::Command::new("ssh")
        .args(&[
            "-L",
            &format!("{}:{}:{}", local_port, remote_host, remote_port),
            "-p",
            &ssh_port.to_string(),
            "-o",
            "StrictHostKeyChecking=no",
            "-o",
            "UserKnownHostsFile=/dev/null",
            "-o",
            "LogLevel=ERROR",
            "-o",
            "PasswordAuthentication=yes",
            "-N", // 不执行远程命令，只做端口转发
            &format!("{}@{}", ssh_user, ssh_host),
        ])
        .spawn()
        .map_err(|e| SshError::ConnectionError(format!("启动SSH命令失败: {}", e)))?;

    eprintln!(
        "SSH 端口转发已启动: {} -> {}:{}",
        local_port, remote_host, remote_port
    );

    // 等待 SSH 进程完成
    let status = child
        .wait()
        .await
        .map_err(|e| SshError::ConnectionError(format!("SSH进程执行失败: {}", e)))?;

    if !status.success() {
        return Err(SshError::ConnectionError("SSH端口转发失败".to_string()));
    }

    eprintln!("SSH 端口转发完成");
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
    // 使用系统 SSH 客户端进行连接测试
    let output = tokio::process::Command::new("ssh")
        .args(&[
            "-p",
            &ssh_port.to_string(),
            "-o",
            "ConnectTimeout=10",
            "-o",
            "StrictHostKeyChecking=no",
            "-o",
            "UserKnownHostsFile=/dev/null",
            "-o",
            "LogLevel=ERROR",
            "-o",
            "PasswordAuthentication=yes",
            &format!("{}@{}", ssh_user, ssh_host),
            "echo 'SSH连接测试成功'",
        ])
        .output()
        .await
        .map_err(|e| SshError::ConnectionError(format!("SSH命令执行失败: {}", e)))?;

    if output.status.success() {
        Ok("SSH连接测试成功".to_string())
    } else {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        Err(SshError::ConnectionError(format!(
            "SSH连接测试失败: {}",
            error_msg
        )))
    }
}
