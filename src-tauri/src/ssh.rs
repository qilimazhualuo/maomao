// SSH 功能模块
// 这是一个学习 SSH 功能实现的起点

// 首先，我们需要了解 SSH 的基本概念：
// 1. SSH (Secure Shell) 是一种网络协议，用于安全地远程登录和执行命令
// 2. SSH 隧道可以将本地端口转发到远程服务器
// 3. SSH 连接需要认证（用户名/密码或密钥）

// 让我们从最基础的开始学习...

use serde::{Deserialize, Serialize};
use ssh2::Session;
use std::{net::TcpStream, time::Duration};

// 定义 SSH 连接参数结构体
#[derive(Debug, Serialize, Deserialize)]
pub struct SshConnectionParams {
    #[serde(rename = "sshHost")]
    pub ssh_host: String,
    #[serde(rename = "sshPort")]
    pub ssh_port: u16,
    #[serde(rename = "sshUser")]
    pub ssh_user: String,
    #[serde(rename = "sshPassword")]
    pub ssh_password: String,
    #[serde(rename = "localPort")]
    pub local_port: Option<u16>,
    #[serde(rename = "remoteHost")]
    pub remote_host: Option<String>,
    #[serde(rename = "remotePort")]
    pub remote_port: Option<u16>,
}

#[tauri::command]
pub fn test_ssh_connection(params: SshConnectionParams) -> String {
    println!(
        "测试 SSH 连接: {}@{}:{}",
        params.ssh_host, params.ssh_port, params.ssh_user
    );

    // 构建连接地址
    let addr = format!("{}:{}", params.ssh_host, params.ssh_port);
    let tcp_stream =
        match TcpStream::connect_timeout(&addr.parse().unwrap(), Duration::from_secs(30)) {
            Ok(stream) => stream,
            Err(e) => {
                return format!("连接失败: {}", e.to_string());
            }
        };

    let tcp_stream = Session::new().unwrap();
    tcp_stream.auth_methods(&params.ssh_user).unwrap();

    // 测试ip账号密码等是否正确

    format!(
        "正在测试连接到 {}@{}:{}",
        params.ssh_host, params.ssh_port, params.ssh_user
    )
}
