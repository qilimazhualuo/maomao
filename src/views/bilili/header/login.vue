<script setup>
import { onUnmounted, ref, getCurrentInstance, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useTokenStore } from '../store.js'
import { request } from '@/common/request.js'
import { message } from 'ant-design-vue'
import { getQrcode, getLoginStatus, getUserInfo } from '../api.js'

const { proxy } = getCurrentInstance()

let interval, qrcode_key
const qrText = ref('')
const loginMsg = ref('')
const open = ref(false)

const { userInfo } = useTokenStore()

// 清除定时器
onUnmounted(() => {
    clearInterval(interval)
})

watch(() => open.value, () => {
    clearInterval(interval)
})

// 登录流程
const initLogin = () => {
    // 获取二维码
    loginMsg.value = '正在获取二维码...'
    clearInterval(interval)
    getQrcode().then((res) => {
        qrText.value = res.data.url
        qrcode_key = res.data.qrcode_key
        loginMsg.value = '等待扫码中...'
        interval = setInterval(() => {
            getLoginStatus({
                qrcode_key: qrcode_key,
                ts: new Date().getTime()
            }).then((res) => {
                console.log(res)
                const { code, data } = res
                if (data.code === 0) {
                    // 登录成功
                    const { refresh_token, timestamp, url } = data
                    // 从url中获取参数
                    const urlParams = new URLSearchParams(decodeURIComponent(url).replace(/^.*?\?/, ''))
                    const temp = {}
                    for (const [key, value] of urlParams) {
                        temp[key] = value
                    }
                    const { setToken, setUserInfo } = useTokenStore()
                    setToken(temp)
                    getUserInfo().then((res) => {
                        setUserInfo(res.data)
                    })
                    loginMsg.value = '登陆成功...'
                    message.success('登录成功!')
                    clearInterval(interval)
                } else {
                    loginMsg.value = data.message
                    // 二维码失效
                    if (data.code === 86038) {
                        clearInterval(interval)
                    }
                }
            })
        }, 3000)
    })
}

const login = () => {
    open.value = true
    initLogin()
}

</script>

<template>
    <div>
        <div v-if="useTokenStore().userInfo" @click.stop="login">{{ useTokenStore().userInfo.uname }}</div>
        <a-button v-else type="primary" @click.stop="login">登录</a-button>
    </div>
    <a-modal title="登录" v-model:open="open" centered>
        <a-qrcode
            :value="qrText"
            v-if="qrText"
            :status="loginMsg === '二维码已失效' ? 'expired' : 'active'"
            @refresh="initLogin"
        />
        {{ loginMsg }}
    </a-modal>
</template>

<style lang="less"></style>