<script setup>
import { ref, reactive } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { message } from 'ant-design-vue'
import {
    ApiOutlined,
    PlayCircleOutlined,
    StopOutlined,
    ReloadOutlined
} from '@ant-design/icons-vue'

// SSH 连接配置
const formRef = ref()
const sshConfig = reactive({
    sshHost: '127.0.0.1',
    sshPort: 22,
    sshUser: 'root',
    sshPassword: '123456',
    localPort: 9000,
    remoteHost: 'localhost',
    remotePort: 9000,
})

// 状态管理
const isConnected = ref(false)
const tunnelStatus = ref('')
const activeTunnels = ref([])
const testResult = ref('')
const loading = reactive({
    test: false,
    start: false,
    stop: false,
    refresh: false
})

// 测试 SSH 连接
const testConnection = async () => {
    try {
        loading.test = true
        testResult.value = '测试中...'
        const res = await invoke('test_ssh_connection', {
            sshHost: sshConfig.sshHost,
            sshPort: sshConfig.sshPort,
            sshUser: sshConfig.sshUser,
            sshPassword: sshConfig.sshPassword,
        })
        testResult.value = res
        message.success('SSH 连接测试成功')
    } catch (error) {
        const errorMsg = extractErrorMessage(error)
        testResult.value = `测试失败: ${errorMsg}`
        message.error(`SSH 连接测试失败: ${errorMsg}`)
    } finally {
        loading.test = false
    }
}

// 启动 SSH 隧道
const startTunnel = async () => {
    try {
        loading.start = true
        tunnelStatus.value = '启动中...'

        // 先检查是否已有相同隧道，如果有则先停止
        const tunnelId = `${sshConfig.localPort}-${sshConfig.remoteHost}`
        console.log('尝试启动隧道，ID:', tunnelId)

        // 先尝试停止可能存在的隧道
        try {
            await invoke('stop_ssh_tunnel', { tunnel_id: tunnelId })
            console.log('已停止现有隧道')
        } catch (e) {
            console.log('没有现有隧道需要停止:', e)
        }

        const res = await invoke('start_ssh_tunnel', {
            sshHost: sshConfig.sshHost,
            sshPort: sshConfig.sshPort,
            sshUser: sshConfig.sshUser,
            sshPassword: sshConfig.sshPassword,
            localPort: sshConfig.localPort,
            remoteHost: sshConfig.remoteHost,
            remotePort: sshConfig.remotePort,
        })

        console.log('隧道启动成功:', res)
        tunnelStatus.value = `隧道已启动: ${res.localAddress} -> ${res.remoteAddress}`
        isConnected.value = true
        await listTunnels()
        message.success('SSH 隧道启动成功')
    } catch (error) {
        console.error('隧道启动失败:', error)
        const errorMsg = extractErrorMessage(error)
        tunnelStatus.value = `启动失败: ${errorMsg}`
        message.error(`SSH 隧道启动失败: ${errorMsg}`)
    } finally {
        loading.start = false
    }
}

// 停止 SSH 隧道
const stopTunnel = async () => {
    try {
        loading.stop = true
        const tunnelId = `${sshConfig.localPort}-${sshConfig.remoteHost}`
        console.log('尝试停止隧道，ID:', tunnelId)

        // 先获取当前活跃的隧道列表
        const activeTunnels = await invoke('list_ssh_tunnels')
        console.log('当前活跃隧道:', activeTunnels)

        if (!activeTunnels.includes(tunnelId)) {
            console.log('隧道不存在，可能已经停止')
            tunnelStatus.value = '隧道不存在或已停止'
            isConnected.value = false
            message.warning('隧道不存在或已停止')
            return
        }

        const res = await invoke('stop_ssh_tunnel', { tunnel_id: tunnelId })
        console.log('隧道停止成功:', res)
        tunnelStatus.value = res
        isConnected.value = false
        await listTunnels()
        message.success('SSH 隧道已停止')
    } catch (error) {
        console.error('隧道停止失败:', error)
        const errorMsg = extractErrorMessage(error)
        tunnelStatus.value = `停止失败: ${errorMsg}`
        message.error(`SSH 隧道停止失败: ${errorMsg}`)
    } finally {
        loading.stop = false
    }
}

// 列出活跃隧道
const listTunnels = async () => {
    try {
        loading.refresh = true
        const tunnels = await invoke('list_ssh_tunnels')
        activeTunnels.value = tunnels
    } catch (error) {
        console.error('获取隧道列表失败:', error)
        message.error('获取隧道列表失败')
    } finally {
        loading.refresh = false
    }
}

// 提取错误信息的辅助函数
const extractErrorMessage = (error) => {
    if (typeof error === 'string') {
        return error
    }

    if (error && typeof error === 'object') {
        // 处理序列化的错误对象，如 {"BindError": "隧道已存在"}
        const errorObj = error
        for (const [key, value] of Object.entries(errorObj)) {
            if (typeof value === 'string') {
                return value
            }
        }

        // 如果有 message 字段
        if (errorObj.message) {
            return errorObj.message
        }

        // 如果有 error 字段
        if (errorObj.error) {
            return errorObj.error
        }
    }

    return String(error)
}

// 页面加载时获取隧道列表
listTunnels()
</script>

<template>
    <div class="ssh-tunnel-container">
        <a-typography-title :level="2">SSH 端口转发</a-typography-title>

        <!-- SSH 连接配置 -->
        <a-card title="SSH 连接配置" class="config-card">
            <a-form :model="sshConfig" layout="vertical">
                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item label="SSH 主机">
                            <a-input v-model:value="sshConfig.sshHost" placeholder="your-server.com" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item label="SSH 端口">
                            <a-input-number v-model:value="sshConfig.sshPort" :min="1" :max="65535" placeholder="22"
                                style="width: 100%" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item label="用户名">
                            <a-input v-model:value="sshConfig.sshUser" placeholder="username" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item label="密码">
                            <a-input-password v-model:value="sshConfig.sshPassword" placeholder="password" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="16">
                    <a-col :span="8">
                        <a-form-item label="本地端口">
                            <a-input-number v-model:value="sshConfig.localPort" :min="1" :max="65535" placeholder="8080"
                                style="width: 100%" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="8">
                        <a-form-item label="远程主机">
                            <a-input v-model:value="sshConfig.remoteHost" placeholder="localhost" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="8">
                        <a-form-item label="远程端口">
                            <a-input-number v-model:value="sshConfig.remotePort" :min="1" :max="65535"
                                placeholder="3000" style="width: 100%" />
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
        </a-card>

        <!-- 操作按钮 -->
        <a-card title="操作控制" class="action-card">
            <a-space wrap>
                <a-button type="primary" @click="testConnection" :loading="loading.test">
                    <template #icon>
                        <ApiOutlined />
                    </template>
                    测试连接
                </a-button>
                <a-button type="primary" @click="startTunnel" :disabled="isConnected" :loading="loading.start">
                    <template #icon>
                        <PlayCircleOutlined />
                    </template>
                    启动隧道
                </a-button>
                <a-button danger @click="stopTunnel" :disabled="!isConnected" :loading="loading.stop">
                    <template #icon>
                        <StopOutlined />
                    </template>
                    停止隧道
                </a-button>
                <a-button @click="listTunnels" :loading="loading.refresh">
                    <template #icon>
                        <ReloadOutlined />
                    </template>
                    刷新列表
                </a-button>
            </a-space>
        </a-card>

        <!-- 状态显示 -->
        <a-card title="状态信息" class="status-card">
            <a-space direction="vertical" style="width: 100%">
                <a-alert :message="`连接测试: ${testResult || '未测试'}`"
                    :type="testResult.includes('成功') ? 'success' : testResult ? 'error' : 'info'" show-icon />
                <a-alert :message="`隧道状态: ${tunnelStatus || '未启动'}`" :type="isConnected ? 'success' : 'error'"
                    show-icon />
                <div>
                    <a-typography-text strong>活跃隧道:</a-typography-text>
                    <div v-if="activeTunnels.length > 0" style="margin-top: 8px">
                        <a-tag v-for="tunnel in activeTunnels" :key="tunnel" color="blue">
                            {{ tunnel }}
                        </a-tag>
                    </div>
                    <a-typography-text v-else type="danger">无</a-typography-text>
                </div>
            </a-space>
        </a-card>

        <!-- 使用说明 -->
        <a-steps direction="vertical" size="small">
            <a-step title="配置 SSH 服务器信息" description="填写主机、端口、用户名、密码" />
            <a-step title="设置端口映射" description="配置本地端口和远程主机端口" />
            <a-step title="测试连接" description="点击测试连接验证 SSH 连接" />
            <a-step title="启动隧道" description="点击启动隧道开始端口转发" />
            <a-step title="访问服务" description="通过 localhost:本地端口 访问远程服务" />
        </a-steps>
    </div>
</template>

<style lang="less" scoped>
.ssh-tunnel-container {
    width: 100%;
    height: 100%;
    margin: 0 auto;
    padding: 24px;
    overflow-x: hidden;

}
</style>
