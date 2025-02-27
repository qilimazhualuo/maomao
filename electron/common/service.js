import { ipcMain } from 'electron'
import axios from 'axios'

const service = axios.create({
    timeout: 1000,
})

// 拦截响应
service.interceptors.response.use(
    (response) => {
        return response.data
    },
    (error) => {
        return Promise.reject(error)
    }
)

ipcMain.handle('service', (...args) => {
    const [event, omit] = args
    return service(omit[0])
})