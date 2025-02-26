<script setup lang="jsx">
import { ref, watch } from 'vue'

const props = defineProps({
    map: {
        type: Object,
        default: () => ({}),
    },
})

const options = [
    { label: '一型雷达', value: 'radar1', params: ['radius'] },
    { label: '二型雷达', value: 'radar2', params: ['radius', 'height'] },
    { label: '三型雷达', value: 'radar3', params: ['radius', 'height'] },
    {
        label: '扫描雷达',
        value: 'radar4',
        params: ['radius', 'angleVert', 'angleHori', 'heading']
    },
    { label: '五型雷达', value: 'radar5', params: ['radius', 'height', 'direction'] },
    { label: '六型雷达', value: 'customRadar', params: ['radius', 'height', 'angleVert', 'angleHori', 'heading'] },
]
// 当前选中
const activeChooseRader = ref()

const radarFormState = ref({
    radius: 200,
    height: 200,
    angleVert: 30,
    angleHori: 30,
    heading: 0,
    direction: 0
})
const radarMap = ref({
    longitude: '经度',
    latitude: '纬度',
    radius: '半径',
    height: '高度',
    angleVert: '垂直角度',
    angleHori: '水平角度',
    heading: '方向',
    direction: '方向'
})
const placeholder = (field) => {
    return `请输入${radarMap.value[field] || ''}`
}
const rules = {
    longitude: [{ required: true, message: placeholder('longitude') }],
    latitude: [{ required: true, message: placeholder('latitude') }],
    radius: [{ required: true, message: placeholder('radius') }],
    height: [{ required: true, message: placeholder('height') }],
    angleVert: [{ required: true, message: placeholder('angleVert') }],
    angleHori: [{ required: true, message: placeholder('angleHori') }],
    heading: [{ required: true, message: placeholder('heading') }],
    direction: [{ required: true, message: placeholder('direction') }],
}

const setCoors = ({ coordinate }) => {
    const [lng, lat] = coordinate
    radarFormState.value.longitude = lng
    radarFormState.value.latitude = lat
}

props.map.addEvent('click', setCoors)

const columns = [
    {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        align: 'center',
        customRender: ({ text }) => {
            const item = options.find((i) => i.value === text)
            return <a-tag>{ item.label }</a-tag>
        }
    },
    {
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        align: 'center',
        customRender: ({ text, record }) => {
            return (
                <a-space>
                    <a-button
                        style="margin-right: 12px;"
                        size="small"
                        onClick={() => {
                            const { longitude, latitude, radius } = record
                            props.map.setCenter([longitude, latitude], radius * 1.2)
                        }}
                    >
                        定位
                    </a-button>
                    <a-button
                        size="small"
                        onClick={() => {
                            dataSource.value = dataSource.value.filter((i) => i.id !== text)
                        }}
                    >
                        删除
                    </a-button>
                </a-space>
            )
        },
    },
]

const dataSource = ref([])

const finish = (values) => {
    if (!activeChooseRader.value.value) {
        return
    }
    const { value } = activeChooseRader.value
    dataSource.value = dataSource.value.concat({
        ...values,
        type: value,
        id: new Date().getTime()
    })
}

watch(
    () => dataSource.value,
    (val, oldVal) => {
        // 新增
        val.forEach((item) => {
            if (oldVal.findIndex((i) => i.id === item.id) === -1) {
                const { type, longitude, latitude, id } = item
                props.map[type]({ position: [longitude, latitude], layerId: id, ...item })
            }
        })
        // 删除
        oldVal.forEach((item) => {
            if (val.findIndex((i) => i.id === item.id) === -1) {
                const { id } = item
                props.map.removeRadar(id)
            }
        })
    }
)
</script>

<template>
    <a-alert message="点击地图可拾取坐标" type="info" class="mb-2" />
    <a-form ref="formRef" :rules="rules" :model="radarFormState" @finish="finish" class="raderForm">
        <a-form-item label="雷达类型" :labelCol="{ span: 8 }" :wrapperCol="{ span: 16 }">
            <a-select v-model:value="activeChooseRader" label-in-value :options="options" />
        </a-form-item>
        <a-form-item label="经度" name="longitude" :labelCol="{ span: 8 }" :wrapperCol="{ span: 16 }">
            <a-input-number style="width: 100%" v-model:value="radarFormState.longitude" />
        </a-form-item>
        <a-form-item label="纬度" name="latitude" :labelCol="{ span: 8 }" :wrapperCol="{ span: 16 }">
            <a-input-number style="width: 100%" v-model:value="radarFormState.latitude" />
        </a-form-item>
        <a-form-item
            v-for="item in activeChooseRader?.option?.params"
            :key="item"
            :name="item"
            :label="radarMap[item]"
            :labelCol="{ span: 8 }"
            :wrapperCol="{ span: 16 }"
        >
            <a-input-number style="width: 100%" v-model:value="radarFormState[item]" />
        </a-form-item>
        <a-form-item style="text-align: right">
            <a-button type="primary" block html-type="submit" style="width: 100%; margin-top: 12px">创建雷达</a-button>
        </a-form-item>
    </a-form>
    <a-table :columns="columns" :dataSource="dataSource" :pagination="false" :scroll="{ y: 250 }" size="small" />
</template>

<style lang="less"></style>
