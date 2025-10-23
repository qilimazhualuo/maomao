<script setup>
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'

// SSH 连接配置
const sshConfig = ref({
    sshHost: 'your-server.com',
    sshPort: 22,
    sshUser: 'username',
    sshPassword: 'password',
    localPort: 8080,
    remoteHost: 'localhost',
    remotePort: 3000
})

// 状态管理
const isConnected = ref(false)
const tunnelStatus = ref('')
const activeTunnels = ref([])
const testResult = ref('')

// 测试 SSH 连接
const testConnection = async () => {
    try {
        testResult.value = '测试中...'
        const result = await invoke('test_ssh_connection', {
            sshHost: sshConfig.value.sshHost,
            sshPort: sshConfig.value.sshPort,
            sshUser: sshConfig.value.sshUser,
            sshPassword: sshConfig.value.sshPassword
        })
        testResult.value = result
    } catch (error) {
        testResult.value = `测试失败: ${error}`
    }
}

// 启动 SSH 隧道
const startTunnel = async () => {
    try {
        tunnelStatus.value = '启动中...'
        const result = await invoke('start_ssh_tunnel', {
            sshHost: sshConfig.value.sshHost,
            sshPort: sshConfig.value.sshPort,
            sshUser: sshConfig.value.sshUser,
            sshPassword: sshConfig.value.sshPassword,
            localPort: sshConfig.value.localPort,
            remoteHost: sshConfig.value.remoteHost,
            remotePort: sshConfig.value.remotePort
        })
        tunnelStatus.value = `隧道已启动: ${result.localAddress} -> ${result.remoteAddress}`
        isConnected.value = true
        await listTunnels()
    } catch (error) {
        tunnelStatus.value = `启动失败: ${error}`
    }
}

// 停止 SSH 隧道
const stopTunnel = async () => {
    try {
        const tunnelId = `${sshConfig.value.localPort}-${sshConfig.value.remoteHost}`
        const result = await invoke('stop_ssh_tunnel', { tunnel_id: tunnelId })
        tunnelStatus.value = result
        isConnected.value = false
        await listTunnels()
    } catch (error) {
        tunnelStatus.value = `停止失败: ${error}`
    }
}

// 列出活跃隧道
const listTunnels = async () => {
    try {
        const tunnels = await invoke('list_ssh_tunnels')
        activeTunnels.value = tunnels
    } catch (error) {
        console.error('获取隧道列表失败:', error)
    }
}

// 页面加载时获取隧道列表
listTunnels()
</script>

<template>
    <div class="ssh-tunnel-container">
        <h2>SSH 端口转发</h2>

        <!-- SSH 连接配置 -->
        <div class="config-section">
            <h3>SSH 连接配置</h3>
            <div class="form-group">
                <label>SSH 主机:</label>
                <input v-model="sshConfig.sshHost" placeholder="your-server.com" />
            </div>
            <div class="form-group">
                <label>SSH 端口:</label>
                <input v-model.number="sshConfig.sshPort" type="number" placeholder="22" />
            </div>
            <div class="form-group">
                <label>用户名:</label>
                <input v-model="sshConfig.sshUser" placeholder="username" />
            </div>
            <div class="form-group">
                <label>密码:</label>
                <input v-model="sshConfig.sshPassword" type="password" placeholder="password" />
            </div>

            <div class="form-group">
                <label>本地端口:</label>
                <input v-model.number="sshConfig.localPort" type="number" placeholder="8080" />
            </div>
            <div class="form-group">
                <label>远程主机:</label>
                <input v-model="sshConfig.remoteHost" placeholder="localhost" />
            </div>
            <div class="form-group">
                <label>远程端口:</label>
                <input v-model.number="sshConfig.remotePort" type="number" placeholder="3000" />
            </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-section">
            <button @click="testConnection" class="btn btn-test">测试连接</button>
            <button @click="startTunnel" :disabled="isConnected" class="btn btn-start">启动隧道</button>
            <button @click="stopTunnel" :disabled="!isConnected" class="btn btn-stop">停止隧道</button>
            <button @click="listTunnels" class="btn btn-refresh">刷新列表</button>
        </div>

        <!-- 状态显示 -->
        <div class="status-section">
            <h3>状态信息</h3>
            <div class="status-item">
                <strong>连接测试:</strong>
                <span :class="testResult.includes('成功') ? 'success' : 'error'">
                    {{ testResult || '未测试' }}
                </span>
            </div>
            <div class="status-item">
                <strong>隧道状态:</strong>
                <span :class="isConnected ? 'success' : 'error'">
                    {{ tunnelStatus || '未启动' }}
                </span>
            </div>
            <div class="status-item">
                <strong>活跃隧道:</strong>
                <span v-if="activeTunnels.length > 0">
                    {{ activeTunnels.join(', ') }}
                </span>
                <span v-else class="error">无</span>
            </div>
        </div>

        <!-- 使用说明 -->
        <div class="help-section">
            <h3>使用说明</h3>
            <ol>
                <li>填写 SSH 服务器信息（主机、端口、用户名、密码）</li>
                <li>设置本地端口和远程主机端口</li>
                <li>点击"测试连接"验证 SSH 连接</li>
                <li>点击"启动隧道"开始端口转发</li>
                <li>现在可以通过 <code>localhost:本地端口</code> 访问远程服务</li>
            </ol>
        </div>
    </div>
</template>

<style lang="less" scoped>
.ssh-tunnel-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.config-section {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.form-group {
    display: flex;
    align-items: center;
    margin-bottom: 15px;

    label {
        width: 120px;
        font-weight: bold;
    }

    input {
        flex: 1;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
}

.action-section {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &.btn-test {
        background: #17a2b8;
        color: white;
    }

    &.btn-start {
        background: #28a745;
        color: white;
    }

    &.btn-stop {
        background: #dc3545;
        color: white;
    }

    &.btn-refresh {
        background: #6c757d;
        color: white;
    }
}

.status-section {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.status-item {
    margin-bottom: 10px;

    .success {
        color: #28a745;
        font-weight: bold;
    }

    .error {
        color: #dc3545;
        font-weight: bold;
    }
}

.help-section {
    background: #e9ecef;
    padding: 20px;
    border-radius: 8px;

    ol {
        margin: 0;
        padding-left: 20px;
    }

    code {
        background: #f8f9fa;
        padding: 2px 4px;
        border-radius: 3px;
        font-family: monospace;
    }
}
</style>