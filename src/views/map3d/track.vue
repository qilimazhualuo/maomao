<script setup lang="jsx">
import { ref, getCurrentInstance, watch, inject } from 'vue'
import * as turf from '@turf/turf'
import { CaretRightOutlined, PauseOutlined, FastBackwardOutlined, FastForwardOutlined } from '@ant-design/icons-vue'
import { Cartesian3, ShadowMode, JulianDate } from 'cesium'

const props = defineProps({
    setTrack: {
        type: Function,
        default: () => {},
    },
    delTrack: {
        type: Function,
        default: () => {},
    },
})

const { proxy } = getCurrentInstance()

const mapObj = inject('mapObj')

const equipData = [
    { label: '苏-35', value: '/map3d/su-57.glb' }
]

const rules = {
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    model: [{ required: true, message: '请选择模型', trigger: 'change' }],
    points: [{ required: true, message: '请选择轨迹', trigger: 'change' }]
}

const formData = ref({})

const startDraw = () => {
    if (formData.value.points) {
        mapObj.map.clearMeature()
        formData.value.points = undefined
        return
    }
    mapObj.map.draw('LineString', {}, true).then(({ geojson }) => {
        formData.value.points = geojson.features[0].geometry.coordinates.map(([longitude, latitude, height]) => {
            return { longitude, latitude, height: height + 100, speed: 100 }
        })
        proxy.$refs.formRef.clearValidate()
    })
}

const save = () => {
    mapObj.map.clearMeature()
    const { points, model, name } = formData.value
    data.value = [...data.value, { points, model, name, id: mapObj.map.guid() }]
    formData.value = {}
}

// 轨迹
// 起始时间
const startTime = new Date('2021-07-01T07:22:14.000+0000').toISOString()
const createFly = ({ points, model, id }) => {
    let temp
    const data = points.reduce((prev, { longitude, latitude, height, speed }, i, arr) => {
        // 每隔一百米增加一秒
        // 计算和上一个点得距离
        let time, timeStr
        if (!i) {
            time = startTime
            temp = startTime
            timeStr = new Date(startTime).getTime()
        } else {
            let { longitude, latitude } = arr[i - 1]
            let { longitude: longitude2, latitude: latitude2 } = arr[i]
            const distance = turf.distance(turf.point([longitude, latitude]), turf.point([longitude2, latitude2]), {
                units: 'kilometers'
            })
            time = new Date(new Date(temp).getTime() + ((distance * 1000) / speed) * 1000).toISOString()
            temp = new Date(time).toISOString()
            timeStr = new Date(time).getTime()
        }
        prev.push([longitude, latitude, height, time, speed, timeStr])
        return prev
    }, [])
    const dom = proxy.$refs.overlayRef.cloneNode(true)
    dom.setAttribute('isOk', true)
    dom.style.display = 'block'
    const heightDom = dom.getElementsByClassName('height')[0]
    const lngDom = dom.getElementsByClassName('lng')[0]
    const latDom = dom.getElementsByClassName('lat')[0]
    const speedDom = dom.getElementsByClassName('speed')[0]
    const titleDom = dom.getElementsByClassName('overlay-title')[0]
    const modalItem = equipData.find((item) => item.value === model)
    titleDom.innerHTML = modalItem.label
    let timeTemp
    mapObj.map.addTrack({
        moveCallback: (poi, time) => {
            // 不能执行太快
            if (!timeTemp) {
                timeTemp = time.clone()
            } else {
                const diff = Math.abs(JulianDate.secondsDifference(time, timeTemp))
                if (diff < 0.5) {
                    return
                }
                timeTemp = time.clone()
            }
            // 在这里更新overlay的值
            // poi 是ces3格式
            const [lng, lat, height] = mapObj.map.proToGeo(poi)
            props.updateTrack instanceof Function && props.updateTrack(id, [lng, lat, height], true)
            const lngRes = lng.toFixed(6)
            const latRes = lat.toFixed(6)
            const heightRes = height.toFixed(2)
            // 根据时间计算速度
            lngRes !== lngDom.html && (lngDom.innerHTML = lngRes)
            latRes !== latDom.html && (latDom.innerHTML = latRes)
            heightRes !== heightDom.html && (heightDom.innerHTML = heightRes)
            // 根据时间计算速度
            const curTimeVal = JulianDate.toDate(time).getTime()
            const item = data.find((item) => {
                return item[5] > curTimeVal
            })
            if (!item) {
                return
            }
            const speed = `${item[4]}m/s`
            speedDom.innerHTML !== speed && (speedDom.innerHTML = speed)
        },
        id,
        speed: 1,
        pointsArr: data,
        moveStyle: [
            {
                model: model,
                minimumPixelSize: 128, // 最小像素大小
                maximumScale: 500, // 模型的最大比例尺大小。 minimumPixelSize的上限
                incrementallyLoadTextures: true, // 加载模型后纹理是否可以继续流入
                runAnimations: true, // 是否应启动模型中指定的glTF动画
                clampAnimations: true, // 指定glTF动画是否应在没有关键帧的持续时间内保持最后一个姿势
                eyeOffset: new Cartesian3(0, 0, -1), //设置模型的可见度
                shadows: ShadowMode.ENABLED,
                stayHorizontal: true,
                rollWidth: 10,
                pitchWidth: 1,
                wave: { color: '135, 208, 104' }
            },
            {
                overlay: { dom }
            }
        ],
        lineStyle: {
            color: 'rgba(250, 173, 20, 1)',
            width: 4
        },
        callback: () => {}
    })
}

// 轨迹数据
const trackColumns = [
    {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        align: 'center',
        width: 80,
        customRender: ({ text, record, index, column }) => {
            return text + (index + 1)
        }
    },
    {
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        align: 'center',
        width: 160,
        customRender: ({ text, record }) => {
            return (
                <>
                    {/* <a-button style="margin-right: 12px;" size="small"
                        onClick={() => {
                            setEditData(record)
                            data.value = data.value.filter((i) => i.id !== text)
                        }}
                    >
                        编辑
                    </a-button> */}
                    <a-button size="small"
                        onClick={() => {
                            data.value = data.value.filter((i) => i.id !== text)
                        }}
                    >
                        删除
                    </a-button>
                </>
            )
        }
    }
]
const data = ref([])
watch(
    () => data.value,
    (val, oldVal) => {
        // 新增
        val.forEach((item) => {
            if (oldVal.findIndex((i) => i.id === item.id) === -1) {
                createFly(item)
                const { longitude, latitude, height } = item.points[0]
                props.setTrack instanceof Function && props.setTrack(item.id, [longitude, latitude, height], true)
            }
        })
        // 删除
        oldVal.forEach((item) => {
            if (val.findIndex((i) => i.id === item.id) === -1) {
                const { id } = item
                mapObj.map.removeTrack(id)
                props.setTrack instanceof Function && props.delTrack(id, true)
            }
        })
    }
)

const isPlay = ref(false)
const play = () => {
    isPlay.value = !isPlay.value
    if (isPlay.value) {
        mapObj.map.playTrack()
    } else {
        mapObj.map.stopTrack()
    }
}

const backward = () => {
    const speed = mapObj.map.trackSpeed
    mapObj.map.setTrackSpeed(speed / 2)
}

const forward = () => {
    const speed = mapObj.map.trackSpeed
    mapObj.map.setTrackSpeed(speed * 2)
}
</script>

<template>
    
    <a-space direction="vertical">
        <div>
            <a-alert message="双击结束轨迹绘制" type="info" show-icon style="margin-bottom: 12px" />
            <a-form ref="formRef" :model="formData" :rules="rules" layout="vertical" @submit="save">
                <a-form-item label="名称" name="name">
                    <a-input v-model:value="formData.name"></a-input>
                </a-form-item>
                <a-form-item label="模型选择" name="model">
                    <a-select
                        v-model:value="formData.model"
                        :options="equipData"
                        style="flex: 1 1 auto; margin-right: 12px"
                    />
                </a-form-item>
                <a-form-item label="轨迹" name="points">
                    <a-button
                        :type="formData.points ? 'primary' : 'default'"
                        @click.stop="startDraw"
                    >
                        {{ formData.points ? '点击清除' : '点击开始绘制' }}
                    </a-button>
                </a-form-item>
                <a-button
                    type="primary"
                    html-type="submit"
                >
                    生成数据
                </a-button>
            </a-form>
        </div>
        <a-space>
            <a-button shape="circle" @click.stop="play">
                <template #icon>
                    <PauseOutlined v-if="isPlay"/>
                    <CaretRightOutlined v-else/>
                </template>
            </a-button>
            <a-button shape="circle" @click.stop="backward">
                <template #icon>
                    <FastBackwardOutlined />
                </template>
            </a-button>
            <a-button shape="circle" @click.stop="forward">
                <template #icon>
                    <FastForwardOutlined />
                </template>
            </a-button>
        </a-space>
    </a-space>
    <a-table
        style="margin-top: 12px;"
        :columns="trackColumns"
        :data-source="data"
        :pagination="false"
        :scroll="{ y: 250 }"
        size="small"
    />
    <div ref="overlayRef" class="overlay-popup" style="display: none">
        <div class="overlay-cornor"></div>
        <div class="overlay-name">
            <span class="overlay-title"></span>
        </div>
        <div class="overlay-content">
            <div class="overlay-content-item">
                <span class="overlay-content-item-label">速度</span>
                <span class="overlay-content-item-value speed"></span>
            </div>
            <div class="overlay-content-item">
                <span class="overlay-content-item-label">经度</span>
                <span class="overlay-content-item-value lng"></span>
            </div>
            <div class="overlay-content-item">
                <span class="overlay-content-item-label">纬度</span>
                <span class="overlay-content-item-value lat"></span>
            </div>
            <div class="overlay-content-item">
                <span class="overlay-content-item-label">高度</span>
                <span class="overlay-content-item-value height"></span>
            </div>
        </div>
    </div>
</template>

<style lang="less">
.overlay-popup {
    position: absolute;
    left: 50%;
    bottom: 49px;
    transform: translate(-50%, 0);
    min-width: 220px;
    padding: 10px;
    background-color: rgba(0, 31, 60, 0.8);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    border: 1px solid #f0f0f0;
    border-bottom-color: transparent;
    color: #fff;
    // 绘制弧线
    &:before {
        content: '';
        position: absolute;
        left: 50%;
        margin-left: auto;
        top: auto;
        bottom: -1.3px;
        transform: translate(-50%, 50%) rotate(45deg);
        width: 23px;
        height: 23px;
        background: linear-gradient(135deg, #ffffff00 0%, #ffffff00 50%, rgba(0, 31, 60, 0.8) 50%, rgba(0, 31, 60, 0.8) 100%);
        border: 1px solid #fff;
        border-radius: 0 0 8px 0;
        border-left: none;
        border-top: none;
        z-index: -1;
    }
    &:after {
        content: '';
        left: 50%;
        margin-left: auto;
        transform: translateX(-50%);
        border: none;
        top: calc(100% + 12px);
        width: 5px;
        height: 34px;
        background: linear-gradient(180deg, #fff 0%, #fff2 100%);
    }
    // 绘制底边
    .overlay-cornor {
        position: absolute;
        bottom: -2px;
        width: 100%;
        left: 0;
        height: 8px;
        &::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: -1px;
            bottom: 0px;
            width: calc(50% - 14px);
            height: 8px;
            border: 1px solid #fff;
            border-top-color: transparent;
            border-right-color: transparent;
            border-radius: 0 0 0 8px;
        }
        &::after {
            content: '';
            position: absolute;
            bottom: 0;
            right: -1px;
            bottom: 0px;
            width: calc(50% - 14px);
            height: 8px;
            border: 1px solid #fff;
            border-top-color: transparent;
            border-left-color: transparent;
            border-radius: 0 0 8px 0;
        }
    }
    .overlay-name {
        display: flex;
        justify-content: space-between;
        .overlay-title {
            text-align: center;
            font-weight: 700;
            font-size: 15px;
        }
    }
    .overlay-content {
        .overlay-content-item {
            display: flex;
            .overlay-content-item-label {
                white-space: nowrap;
                font-size: 13px;
                &::after {
                    content: ' ：';
                }
            }
            .overlay-content-item-value {
                font-size: 13px;
                white-space: nowrap;
            }
        }
    }
}
</style>