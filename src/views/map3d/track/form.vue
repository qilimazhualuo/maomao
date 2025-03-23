<script setup lang="jsx">
import Meature from '@/components/Meature.vue'

const props = defineProps({
    createTrack: {
        type: Function,
        default: () => {}
    },
    equipData: {
        type: Array,
        default: () => []
    },
    flag: {
        type: String,
        default: ''
    }
})

const { proxy } = getCurrentInstance()
const mapObj = inject('mapObj')

onMounted(() => {
    document.addEventListener('keydown', (e) => {
        if (e.keyCode === 27) {
            proxy.$refs.measureRef.stop()
        }
    })
})

// 这里需要从 api.js的接口获取
const model = ref('')
const disabled = ref(true)
watch(
    () => model.value,
    (val, oldVal) => {
        disabled.value = val? false: true
    }
)

const pointsData = ref([])
const pointscolumns = [
    {
        title: '经度',
        dataIndex: 'longitude',
        key: 'longitude'
    },
    {
        title: '纬度',
        dataIndex: 'latitude',
        key: 'latitude'
    },
    {
        title: '高度m',
        dataIndex: 'height',
        key: 'height',
        customRender: ({ text, record, index, column }) => {
            return <a-input-number step={0.01} v-model:value={pointsData.value[index][column.dataIndex]} />
        }
    },
    {
        title: '速度m/s',
        dataIndex: 'speed',
        key: 'speed',
        customRender: ({ text, record, index, column }) => {
            return <a-input-number step={1} v-model:value={pointsData.value[index][column.dataIndex]} />
        }
    }
]

const setModalOpen = inject('setModalOpen')
const start = () => {
    setModalOpen(false)
}

const finish = ({ geojson }) => {
    setModalOpen(true)
    pointsData.value = geojson.features[0].geometry.coordinates.map(([longitude, latitude, height]) => ({
        longitude,
        latitude,
        height: height + 10000,
        speed: 700
    }))
}

const createFly = () => {
    props.createTrack(pointsData.value, model.value)
    pointsData.value = []
    proxy.$refs.measureRef.clear()
}

defineExpose({
    resetData: (data) => {
        proxy.$refs.measureRef.clear()
        pointsData.value = JSON.parse(JSON.stringify(data.points))
        model.value = data.model
        proxy.$refs.measureRef.setGeojson({
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: data.points.map((i) => [i.longitude, i.latitude, i.height])
                    }
                }
            ]
        })
    }
})
</script>

<template>
    <a-row :gutter="[8, 16]">
        <a-col :span="24">
            <a-alert message="双击结束轨迹绘制" type="info" show-icon style="margin-bottom: 12px" />
            <div style="display: flex; align-items: center">
                <span>模型选择：</span>
                <a-select
                    v-model:value="model"
                    :options="equipData.filter((i) => i.type === flag)"
                    :fieldNames="{ label: 'code', value: 'id' }"
                    style="flex: 1 1 auto; margin-right: 12px"
                />
                <a-space :size="0">
                    <Meature
                        ref="measureRef"
                        :used="disabled"
                        :mapObj="mapObj"
                        :params="{ LineString: {} }"
                        @drawEnd="finish"
                        @drawStart="start"
                        clearBeforeStart
                    />
                </a-space>
                <a-button
                    type="primary"
                    @click.stop="createFly"
                    style="display: flex; align-items: center; justify-content: center; margin-left: 12px"
                >
                    生成数据
                </a-button>
            </div>
        </a-col>
        <a-col :span="24">
            <a-table
                :columns="pointscolumns"
                :dataSource="pointsData"
                :pagination="false"
                :scroll="{ y: 152 }"
                size="small"
            />
        </a-col>
    </a-row>
</template>