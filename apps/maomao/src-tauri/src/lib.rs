// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// 执行http请求参数与axios保持一致 并将结果返回
#[tauri::command]
fn http_request(url: String, method: String, data: String) -> String {
    let client = reqwest::Client::new();
    let resp = client
        .request(match method.to_lowercase().as_str() {
            "get" => reqwest::Method::GET,
            "post" => reqwest::Method::POST,
            "put" => reqwest::Method::PUT,
            "delete" => reqwest::Method::DELETE,
        })
        .url(url)
        .body(data)
        .send();
    match resp {
        Ok(resp) => {
            let text = resp.text();
            match text {
                Ok(text) => text,
                Err(_) => "".to_string(),
            }
        }
        Err(_) => "".to_string(),
        _ => "".to_string(),
    }
}



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
