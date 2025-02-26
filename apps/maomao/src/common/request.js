import { fetch } from '@tauri-apps/plugin-http'

const baseUrl = 'http://118.89.125.148:9001/api'

export const request = ({ url, method = 'get', params = {}, data = {}, headers = {}, timeout = 5000 }) => {
    return new Promise((resolve, reject) => {
        url = url.includes('http') ? url : `${baseUrl}${url}`
        for (const key in params) {
            url += `${url.includes('?') ? '&' : '?'}${key}=${params[key]}`
        }
        fetch(url, {
            timeout,
            method,
            headers: {
                'Content-Type': 'application/json, text/plain, */*',
                ...headers,
            },
            body: method === 'get' ? null : JSON.stringify(data),
        }).then(res => {
            if (res.json instanceof Function) {
                return res.json()
            } else {
                return res.text()
            }
        }).then((res) => {
            resolve(res)
        }).catch((err) => {
            reject(err)
        })
    })
}