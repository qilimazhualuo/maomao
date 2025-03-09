use reqwest::{
    self,
    header::{HeaderMap, HeaderName, HeaderValue},
    Method,
};
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use thiserror::Error;
use once_cell::sync::Lazy;

// 使用全局 HTTP 客户端（带连接池）
static CLIENT: Lazy<reqwest::Client> = Lazy::new(|| {
    reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .expect("无法创建 HTTP 客户端")
});

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpRequestOptions {
    method: String,
    #[serde(default)]
    params: Map<String, Value>,
    #[serde(default)]
    body: Option<Value>,
    #[serde(default)]
    headers: Map<String, Value>,
}

#[derive(Debug, Error, Serialize)]
pub enum ApiError {
    #[error("HTTP请求失败: {status} - {message}")]
    HttpError {
        status: u16,
        message: String,
    },

    #[error("无效的URL: {0}")]
    InvalidUrl(String),

    #[error("无效的HTTP方法: {0}")]
    InvalidMethod(String),

    #[error("查询参数错误: {0}")]
    QueryParamsError(String),

    #[error("请求头错误: {0}")]
    HeaderError(String),

    #[error("不支持的方法携带请求体: {0}")]
    BodyNotAllowed(String),

    #[error("未知错误: {0}")]
    Unknown(String),
}

// 实现 reqwest 错误到自定义错误的转换
impl From<reqwest::Error> for ApiError {
    fn from(err: reqwest::Error) -> Self {
        if err.is_status() {
            let status = err.status().unwrap_or(reqwest::StatusCode::INTERNAL_SERVER_ERROR);
            ApiError::HttpError {
                status: status.as_u16(),
                message: status.to_string(),
            }
        } else {
            ApiError::Unknown(err.to_string())
        }
    }
}

impl HttpRequestOptions {
    fn build_url(&self, base_url: &str) -> Result<String, ApiError> {
        let mut url = reqwest::Url::parse(base_url)
            .map_err(|e| ApiError::InvalidUrl(e.to_string()))?;

        // 处理查询参数
        if !self.params.is_empty() {
            let query = serde_qs::to_string(&self.params)
                .map_err(|e| ApiError::QueryParamsError(e.to_string()))?;
            url.set_query(Some(&query));
        }

        Ok(url.to_string())
    }

    fn build_headers(&self) -> Result<HeaderMap, ApiError> {
        let mut headers = HeaderMap::new();
        
        for (key, value) in &self.headers {
            let header_name = HeaderName::from_bytes(key.as_bytes())
                .map_err(|e| ApiError::HeaderError(format!("无效头名称 {}: {}", key, e)))?;
                
            let header_value = value.as_str()
                .ok_or_else(|| ApiError::HeaderError(format!("头 {} 的值不是字符串", key)))?;
                
            let header_value = HeaderValue::from_str(header_value)
                .map_err(|e| ApiError::HeaderError(format!("无效头值 {}: {}", key, e)))?;

            headers.insert(header_name, header_value);
        }

        Ok(headers)
    }

    fn get_method(&self) -> Result<Method, ApiError> {
        match self.method.to_uppercase().as_str() {
            "GET" => Ok(Method::GET),
            "POST" => Ok(Method::POST),
            "PUT" => Ok(Method::PUT),
            "DELETE" => Ok(Method::DELETE),
            "PATCH" => Ok(Method::PATCH),
            "HEAD" => Ok(Method::HEAD),
            "OPTIONS" => Ok(Method::OPTIONS),
            _ => Err(ApiError::InvalidMethod(self.method.clone())),
        }
    }
}

#[tauri::command]
pub async fn http_request(
    url: String,
    options: HttpRequestOptions,
) -> Result<String, ApiError> {
    // 构建完整 URL
    let full_url = options.build_url(&url)?;

    // 获取 HTTP 方法
    let method = options.get_method()?;

    // 构建请求
    let mut request = CLIENT
        .request(method.clone(), &full_url)
        .headers(options.build_headers()?);

    // 处理请求体
    if let Some(body) = options.body {
        if matches!(
            method,
            Method::POST | Method::PUT | Method::PATCH | Method::DELETE
        ) {
            request = request.json(&body);
        } else {
            return Err(ApiError::BodyNotAllowed(method.to_string()));
        }
    }

    // 发送请求并处理响应
    let response = request.send().await?;

    // 检查 HTTP 状态码
    let status = response.status();
    if !status.is_success() {
        let error_message = response
            .text()
            .await
            .unwrap_or_else(|_| "无法读取错误响应体".to_string());

        return Err(ApiError::HttpError {
            status: status.as_u16(),
            message: error_message,
        });
    }

    // 读取成功响应
    response
        .text()
        .await
        .map_err(|e| ApiError::Unknown(e.to_string()))
}