<script setup>
import { onMounted, reactive } from 'vue'
import { createClient } from '@clickhouse/client-web'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'

const clientData = reactive({
    ip: '10.10.70.14',
    port: 8123,
    username: 'default',
    password: 'yjczMh_Pas@Tong',
    dataId: '2e2e9a3b391514f21f211fa1246ce848',
})

let interval
const onFinish = () => {
    clearInterval(interval)
    const client = createClient({
        url: `http://${clientData.ip}:${clientData.port}`,
        username: clientData.username,
        password: clientData.password,
    })
    const updateSpecificRecord = async () => {
        const time = dayjs().format('YYYY-MM-DD HH:mm:ss')
        const updateQuery = `
            ALTER TABLE mhpis.ds_check_runtime 
            UPDATE 
                emp_id = '2e2e9a3b391514f21f211fa1246ce848',
                checkdate = '${time}',
                checktime = '${time}',
                uploadtime = '${time}',
                over_time_point_count = 0,
                over_time_point_time = '1970-01-01 08:00:00',
                over_time_alarm_id = '',
                over_speed_point_count = 0,
                over_speed_point_time = '1970-01-01 08:00:00',
                over_speed_alarm_id = '',
                over_distance_point_count = 0,
                over_distance_point_time = '1970-01-01 08:00:00',
                over_distance_alarm_id = ''
            WHERE id = '${clientData.dataId}'
        `
        client.command({
            query: updateQuery
        }).then(() => {
            message.success('更新操作完成')
        }).catch((err) => {
            message.error(err.message)
        })
    }
    updateSpecificRecord()
    interval = setInterval(updateSpecificRecord, 1000 * 60 * 3)
}

</script>

<template>
    <div class="cickhouse p-2">
        <a-form :model="clientData" ref="form" @finish="onFinish">
            <a-form-item label="ip" name="ip">
                <a-input v-model:value="clientData.ip"></a-input>
            </a-form-item>
            <a-form-item label="port" name="port">
                <a-input-number v-model:value="clientData.port"></a-input-number>
            </a-form-item>
            <a-form-item label="username" name="username">
                <a-input v-model:value="clientData.username"></a-input>
            </a-form-item>
            <a-form-item label="password" name="password">
                <a-input v-model:value="clientData.password"></a-input>
            </a-form-item>
            <a-form-item label="数据ID" name="dataId">
                <a-input v-model:value="clientData.dataId"></a-input>
            </a-form-item>
            <a-form-item>
                <a-button type="primary" html-type="submit">
                    开始更新数据
                </a-button>
                <a-button @click.stop="() => $refs.form.resetFields()">重置</a-button>
            </a-form-item>
        </a-form>
    </div>
</template>

<style lang="less">
.cickhouse {
    height: 100%;
}
</style>