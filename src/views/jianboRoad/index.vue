<script setup lang="jsx">
import { request } from '@/common/request'
import { guid } from '@/common/tool'
import { ref, getCurrentInstance, onBeforeUnmount } from 'vue'
import dayjs from 'dayjs'
import Location from './location.vue'
import { message } from 'ant-design-vue'

const worker = new Worker(new URL('./worker.js', import.meta.url), {
    type: 'module'
})

onBeforeUnmount(() => {
    worker.terminate()
})

const proxy = getCurrentInstance().proxy

const token = '837eaaf3b54a3ce33c70a084d752fb7d'
const roadUrl = 'https://restapi.amap.com/v3/direction/driving'
const poiUrl = 'https://restapi.amap.com/v5/place/polygon'

const getPoiLocation = async (val) => {
    const data = await request({
        url: poiUrl,
        method: 'GET',
        params: {
            key: token,
            polygon: '114.55980216317404, 37.706039671381404|122.91056889533985, 34.641522613434546',
            keywords: val,
            page_size: 1,
            page_num: 1,
        }
    })
    if (data.status === '1' && data.pois.length > 0) {
        const [longitude, latitude] = data.pois[0].location.split(',')
        return { longitude, latitude }
    }
    return null
}

const getRoadLocation = async ({ start, end, wayPoints }) => {
    const data = await request({
        url: roadUrl,
        method: 'GET',
        params: {
            key: token,
            origin: `${start.longitude},${start.latitude}`,
            destination: `${end.longitude},${end.latitude}`,
            waypoints: wayPoints.map(item => `${item.longitude},${item.latitude}`).join(';'),
        }
    })
    if (data.status === '1' && data.route.paths.length > 0) {
        const { steps } = data.route.paths[0]
        return steps.reduce((prev, cur) => {
            const { polyline } = cur
            const arr = polyline.split(';').map((coorStr) => {
                return coorStr.split(',')
            })
            return [...prev, ...arr.filter(item => item[0] && item[1])]
        }, [])
    }
    return null
}


const activeKey = ref('1')

// 文本内容
const originText = ref('')
const handlePaste = () => {
    const arr = originText.value.trim().split('\n')
    poiList.value = arr.map(item => {
        const data = item.split('\t')
        const pointNames = (data[5] || '').split(',')
        return {
            id: guid(),
            time: dayjs(data[0]),
            carName: data[1],
            unitId: data[2],
            startName: data[3],
            wayName: pointNames,
            endName: data[4],
            wayPoints: new Array(pointNames.length).fill({}),
            start: {},
            end: {},
        }
    })
    activeKey.value = '2'
}
// const importFromExcel = () => {
//     activeKey.value = '2'
// }

// poi坐标
const loadingCoor = ref(false)
const poiList = ref([])
const poiColumns = [
    {
        title: '日期',
        dataIndex: 'time',
        key: 'time',
        align: 'center',
        width: 180,
        customRender: ({ record }) => {
            return <a-date-picker show-time v-model:value={record.time}/>
        }
    },
    {
        title: '车牌',
        dataIndex: 'carName',
        key: 'carName',
        align: 'center',
        width: 180,
    },
    {
        title: '单位',
        dataIndex: 'unitId',
        key: 'unitId',
        align: 'center',
        width: 180,
        customRender: ({ text, record }) => {
            const loading = ref(false)
            return <a-tooltip title="重新生成路线">
                <a-button
                    loading={loading.value}
                    onClick={async () => {
                        loading.value = true
                        const { start, end, wayPoints } = record
                        if (!start.longitude || !start.latitude || !end.longitude || !end.latitude) {
                            return
                        }
                        const data = await getRoadLocation({ start, end, wayPoints })
                        loading.value = false
                        record.result = data
                    }}
                >{text}</a-button>
            </a-tooltip>
        }
    },
    {
        title: '起点名字',
        dataIndex: 'startName',
        key: 'startName',
        align: 'center',
        width: 320,
        customRender: ({ record }) => {
            return <a-input-search
                v-model:value={record.startName}
                onSearch={() => {
                    getPoiLocation(record.startName).then(coordinate => {
                        record.start = coordinate
                    })
                }}
            />
        }
    },
    {
        title: '途经点',
        dataIndex: 'wayName',
        key: 'wayName',
        align: 'center',
        width: 320,
        customRender: ({ record }) => {
            return record.wayName.map((_, idx) => {
                return <a-input-search
                    v-model:value={record.wayName[idx]}
                    onSearch={() => {
                        getPoiLocation(record.wayName[idx]).then(coordinate => {
                            record.wayPoints[idx] = coordinate
                        })
                    }}
                />
            })
        }
    },
    {
        title: '终点名字',
        dataIndex: 'endName',
        key: 'endName',
        align: 'center',
        width: 320,
        customRender: ({ record }) => {
            return <a-input-search
                v-model:value={record.endName}
                onSearch={() => {
                    getPoiLocation(record.endName).then(coordinate => {
                        record.end = coordinate
                    })
                }}
            />
        }
    },
    {
        title: '起点',
        dataIndex: 'start',
        key: 'start',
        align: 'center',
        width: 300,
        fixed: 'right',
        customRender: ({ text, record }) => {
            const { longitude, latitude } = text
            return <a-button
                onClick={() => {
                    proxy.$refs.locationRef.show(text, (coordinate) => {
                        record.start = coordinate
                    })
                }}
            >{longitude && latitude ? `${longitude}, ${latitude}` : '无'}</a-button>
        }
    },
    {
        title: '途径点坐标',
        dataIndex: 'wayPoints',
        key: 'wayPoints',
        align: 'center',
        width: 300,
        fixed: 'right',
        customRender: ({ text, record }) => {
            return record.wayPoints.map((_, idx) => {
                const { longitude, latitude } = record.wayPoints[idx] || {}
                return <a-button
                    block
                    onClick={() => {
                        proxy.$refs.locationRef.show(record.wayPoints[idx], (coordinate) => {
                            record.wayPoints[idx] = coordinate
                        })
                    }}
                >{longitude && latitude ? `${longitude}, ${latitude}` : '无'}</a-button>
            })
        }
    },
    {
        title: '终点',
        dataIndex: 'end',
        key: 'end',
        align: 'center',
        width: 300,
        fixed: 'right',
        customRender: ({ text, record }) => {
            const { longitude, latitude } = text
            return <a-button
                onClick={() => {
                    proxy.$refs.locationRef.show(text, (coordinate) => {
                        record.end = coordinate
                    })
                }}
            >{longitude && latitude ? `${longitude}, ${latitude}` : '无'}</a-button>
        }
    },
    {
        title: '操作',
        dataIndex: 'result',
        key: 'result',
        align: 'center',
        width: 120,
        fixed: 'right',
        customRender: ({ text }) => {
            return <a-button
                disabled={!text}
                onClick={() => {
                    proxy.$refs.locationRef.showRoute(text)
                }}
            >查看路线</a-button>
        }
    }
]

// 生成poi坐标
const generateCoor = async () => {
    loadingCoor.value = true
    for (const item of poiList.value) {
        const startCoor = await getPoiLocation(item.startName)
        const endCoor = await getPoiLocation(item.endName)
        startCoor && (item.start = startCoor)
        endCoor && (item.end = endCoor)
        for (const idx in item.wayName) {
            const wayCoor = await getPoiLocation(item.wayName[idx])
            wayCoor && (item.wayPoints[idx] = wayCoor)
        }
    }
    loadingCoor.value = false
}

// 生成路线坐标
const loadingRoute = ref(false)
const generateRoute = async () => {
    loadingRoute.value = true
    for (const item of poiList.value) {
        const { start, end, wayPoints } = item
        if (!start.longitude || !start.latitude || !end.longitude || !end.latitude) {
            continue
        }
        const data = await getRoadLocation({ start, end, wayPoints })
        item.result = data
    }
    loadingRoute.value = false
}

// 生成结果
const loadingResult = ref(false)
const generateResult = () => {
    loadingResult.value = true
    worker.postMessage({ poiList: JSON.parse(JSON.stringify(poiList.value)) })
    worker.onmessage = (e) => {
        const resultText = e.data
        const blob = new Blob([resultText], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'result.sql'
        link.click()
        URL.revokeObjectURL(url)
        loadingResult.value = false
        message.success('生成成功, 请查看下载文件')
    }
}

</script>

<template>
    <a-tabs v-model:activeKey="activeKey" class="p-2">
        <a-tab-pane key="1" tab="粘贴excel内容">
            <a-form>
                <a-form-item label="原始内容">
                    <a-textarea v-model:value="originText" placeholder="请粘贴excel内容 不要手写" />
                </a-form-item>
            </a-form>
            <!-- <a-button @click.stop="importFromExcel">从excel导入</a-button> -->
            <a-button @click.stop="handlePaste">处理粘贴内容</a-button>
        </a-tab-pane>
        <a-tab-pane key="2" tab="生成poi坐标">
            <a-space>
                <a-button @click.stop="generateCoor" :loading="loadingCoor">查询poi坐标</a-button>
                <a-button @click.stop="generateRoute" :loading="loadingRoute">查询路线坐标</a-button>
                <a-button @click.stop="generateResult" :loading="loadingResult">生成sql</a-button>
            </a-space>
            <a-table
                :columns="poiColumns"
                :data-source="poiList"
                :pagination="false"
                :scroll="{ x: true }"
            />
        </a-tab-pane>
        <!-- <a-tab-pane key="3" tab="生成sql">
            <a-form>
                <a-form-item label="结果">
                    <a-textarea v-model:value="resultText" />
                </a-form-item>
            </a-form>
        </a-tab-pane> -->
    </a-tabs>
    <Location ref="locationRef" />
</template>

<style lang="less">

</style>