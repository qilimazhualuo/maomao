<script setup lang="jsx">
import { ref, getCurrentInstance, inject, watch } from 'vue'
import { notification } from 'ant-design-vue'
import * as turf from '@turf/turf'
import { Cartesian3, ShadowMode, JulianDate } from 'cesium'
import TrackForm from './form.vue'
import Tracks from './tracks.vue'

const props = defineProps({
    setTrack: {
        type: Function,
        default: () => {}
    },
    updateTrack: {
        type: Function,
        default: () => {}
    },
    delTrack: {
        type: Function,
        default: () => {}
    }
})
const { proxy } = getCurrentInstance()
const mapObj = inject('mapObj')
const dataName = '轨迹'

// 起始时间
const startTime = new Date('2021-07-01T07:22:14.000+0000').toISOString()
const data = ref([])
watch(
    () => data.value,
    (val, oldVal) => {
        // 新增
        val.forEach((item) => {
            if (oldVal.findIndex((i) => i.id === item.id) === -1) {
                createFly(item)
                const { longitude, latitude, height } = item.points[0]
                props.setTrack(item.id, [longitude, latitude, height], true)
            }
        })
        // 删除
        oldVal.forEach((item) => {
            if (val.findIndex((i) => i.id === item.id) === -1) {
                const { id } = item
                mapObj.map.removeTrack(id)
                props.delTrack(id, true)

                mapObj.map.removeTrack(id + '_temp')
                props.delTrack(id + '_temp', true)
            }
        })
    }
)

const createTrack = (points, model, formState) => {
    if (points.length === 0) {
        notification.open({
            message: '错误！',
            description: '请先绘制' + dataName + '！'
        })
        return
    }
    let temp = JSON.parse(JSON.stringify(data.value))
    temp.push({
        name: dataName,
        points,
        model,
        id: mapObj.map.guid()
    })
    data.value = temp
}

const showOverlayPopup = inject('showOverlayPopup')
const createFly = ({ points, model, id, matlabMake }) => {
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
    showOverlayPopup.value && (dom.style.display = 'block')
    const heightDom = dom.getElementsByClassName('height')[0]
    const lngDom = dom.getElementsByClassName('lng')[0]
    const latDom = dom.getElementsByClassName('lat')[0]
    const speedDom = dom.getElementsByClassName('speed')[0]
    const titleDom = dom.getElementsByClassName('overlay-title')[0]
    const modalItem = mapObj.models.find((item) => item.value === model)
    titleDom.innerHTML = modalItem?.label
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
            const [lng, lat, height] = mapObj.map.Cartesian3_to_WGS84(poi)
            props.updateTrack(id, [lng, lat, height], true)
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
                model: `/api/rfstealth/equipment/download?id=${model}`,
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
            color: matlabMake ? 'rgba(255, 85, 0, 1)' : 'rgba(250, 173, 20, 1)',
            width: 4
        },
        callback: () => {}
    })
}

// 复现数据
const setEditData = (data) => {
    proxy.$refs.trackFormRef.resetData(data)
}

const clear = () => {
    data.value = []
    mapObj.map.removeAllTracks()
}

// 复现数据
const setData = (dd) => {
    clear()
    data.value = dd.map(({ id, motionCoordinate, code, matlabPoints }, idx) => {
        // 处理matlab返回的轨迹数据
        if (matlabPoints && matlabPoints instanceof Array && matlabPoints.length) {
            createFly({
                name: dataName,
                points: matlabPoints.map(([longitude, latitude, height], idx) => {
                    return { longitude, latitude, height, speed: motionCoordinate[idx][3] }
                }),
                model: code,
                id: id + '_temp',
                matlabMake: true
            })
            const [longitude, latitude, height] = matlabPoints[0]
            props.setTrack(id + '_temp', [longitude, latitude, height], true)
        }
        return {
            name: dataName,
            points: motionCoordinate.map(([longitude, latitude, height, speed]) => ({ longitude, latitude, height, speed })),
            model: code,
            id: id,
            matlabPoints
        }
    })
}

const getData = () => {
    // 处理轨迹
    const temp = data.value.map(({ model, points, matlabPoints }) => {
        return {
            type: flag,
            code: model,
            fixedCoordinate: [],
            motionCoordinate: points.map(({ longitude, latitude, height, speed }) => [longitude, latitude, height, speed]),
            matlabPoints
        }
    })
    return temp
}

defineExpose({
    setData,
    getData,
    clear
})
</script>

<template>
    <a-collapse size="small">
        <a-collapse-panel :key="flag + '1'" :header="'创建' + dataName">
            <TrackForm
                :createTrack="createTrack"
                ref="trackFormRef"
                :flag="flag"
            />
        </a-collapse-panel>
        <a-collapse-panel :key="flag + '2'" :header="'已创建' + dataName">
            <Tracks
                v-model:dataSource="data"
                :setEditData="setEditData"
            />
        </a-collapse-panel>
    </a-collapse>
    <div ref="overlayRef" class="overlay-popup askfighter-popup" style="display: none">
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