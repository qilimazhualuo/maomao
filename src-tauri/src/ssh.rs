use serde::{Deserialize, Serialize};

// 定义 SSH 连接参数结构体
#[derive(Debug, Serialize, Deserialize)]
pub struct SshConnectionParams {
    pub host: String,
    pub port: u16,
    pub user: String,
    pub password: String,
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
        params.host, params.port, params.user
    );

    // 构建连接地址
    let addr = format!("{}:{}", params.host, params.port);

    // 测试ip账号密码等是否正确

    format!("正在测试连接到 {}", addr)
}
