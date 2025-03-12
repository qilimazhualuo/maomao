import { invoke } from '@tauri-apps/api/core'

export const request = ({ url, method = 'get', params = {}, data = {}, headers = {}, timeout = 5000 }) => {
    console.log(data)
    return new Promise((resolve, reject) => {
        url = url.includes('http') ? url : `${baseUrl}${url}`
        invoke('http_request', { url: url, options: { method, params, body: data, headers } }).then((res) => {
            console.log('get success', res)
            resolve(res)
        }).catch((err) => {
            console.log('get error', err)
        })
    })
}