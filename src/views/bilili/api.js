import { request } from '@/common/request.js'
import { useTokenStore } from './store.js'

const loginApiBase = 'https://passport.bilibili.com'
const apiBase = 'https://api.live.bilibili.com'

// TODO 登录失效

// 获取登二维码
export const getQrcode = () => {
    return request({
        url: `https://passport.bilibili.com/x/passport-login/web/qrcode/generate`,
    })
}

// 轮询登录状态
export const getLoginStatus = (params) => {
    return request({
        url: `https://passport.bilibili.com/x/passport-login/web/qrcode/poll`,
        method: 'get',
        params
    })
}

// 获取用户信息
export const getUserInfo = () => {
    return request({
        url: `https://api.live.bilibili.com/xlive/web-ucenter/user/get_user_info`,
        headers: {
            cookie: useTokenStore().getCookie()
        }
    })
}

// 获取用户收藏夹
export const getCollection = () => {
    const token = useTokenStore().getToken()
    if (!token || !token.DedeUserID) {
        return Promise.reject('未登录!')
    }
    return request({
        url: `https://api.bilibili.com/x/v3/fav/folder/created/list-all`,
        params: {
            up_mid: token.DedeUserID,
            web_location: 333.1387
        },
        headers: {
            cookie: useTokenStore().getCookie()
        }
    })
}

// 获取收藏夹列表
export const getCollectionList = (params) => {
    const token = useTokenStore().getToken()
    if (!token || !token.DedeUserID) {
        return Promise.reject('未登录!')
    }
    return request({
        url: `https://api.bilibili.com/x/v3/fav/resource/list`,
        params: Object.assign(
            { platform: 'web', order: 'mtime', type: 0, tid: 0, web_location: 333.1387 },
            params
        ),
        headers: {
            cookie: useTokenStore().getCookie()
        }
    })
}

// 获取b站封面
export const getBiliImage = (url) => {
    return request({
        url,
        headers: {
            cookie: useTokenStore().getCookie()
        }
    })
}

// 获取视频详细信息
// export const getVideoBaseInfo = (params) => {
//     return request({
//         url: `https://api.bilibili.com/x/player/wbi/v2`,
//         params,
//         headers: {
//             cookie: useTokenStore().getCookie()
//         }
//     })
// }
export const getVideoBaseInfo = (params) => {
    return request({
        url: `https://www.bilibili.com/video/${params.bvid}`,
        params: { spm_id_from: '333.1007.tianma.1-1-1.click', vd_source: params.vd_source },
        headers: {
            cookie: useTokenStore().getCookie()
        }
    })
}

// 获取视频流信息
export const getVideoInfo = (params) => {
    return request({
        url: `https://api.bilibili.com/x/player/wbi/playurl`,
        params,
        headers: {
            cookie: useTokenStore().getCookie()
        }
    })
}