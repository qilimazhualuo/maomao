import Layer from './layer'
import { ScreenSpaceEventType, ScreenSpaceEventHandler, SampledPositionProperty } from 'cesium'

const mouseTypes = {
    click: ScreenSpaceEventType.LEFT_CLICK,
    doubleclick: ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
    rightclick: ScreenSpaceEventType.RIGHT_CLICK,
    mousemove: ScreenSpaceEventType.MOUSE_MOVE,
    leftup: ScreenSpaceEventType.LEFT_UP,
    leftdown: ScreenSpaceEventType.LEFT_DOWN,
}
export default class Event extends Layer {
    constructor() {
        super(...arguments)
        this._events = []
    }

    /**
     * 注册事件
     * @param {String} type 事件类型
     * @param {Function} fun 回调函数
     * @param {String} layerId 图层id 传入此参数时图层被删除后事件也会一并被删除
     */
    addEvent(type, fun, layerId) {
        if (mouseTypes[type] === undefined || typeof fun !== 'function') {
            return
        }
        const hander = new ScreenSpaceEventHandler(this.basemap.scene.canvas)
        hander.setInputAction((event) => {
            // 获取屏幕坐标（二维坐标）
            const windowPosition = event.position || event.endPosition
            // 将屏幕坐标转为三维笛卡尔坐标
            const ellipsoid = this.basemap.scene.globe.ellipsoid
            const cartesian = this.basemap.camera.pickEllipsoid(windowPosition, ellipsoid)
            // 处理鼠标交互物品
            let pickedFeature
            const feature = this.basemap.scene.pick(windowPosition)
            if (layerId) {
                const dataSources = this.basemap.dataSources.getByName(layerId)
                if (
                    feature &&
                    feature.id &&
                    dataSources &&
                    dataSources[0] &&
                    dataSources[0].entities.contains(feature.id)
                ) {
                    pickedFeature = feature.id
                    // 兼容通过设置psition为 CallbackProperty的 feature
                    let position
                    if (pickedFeature.position._value) {
                        position = pickedFeature.position._value
                    } else if (pickedFeature.position._callback) {
                        position = pickedFeature.position._callback()
                    } else if (pickedFeature.position instanceof SampledPositionProperty) {
                        position = pickedFeature.position.getValue(this.basemap.clock.currentTime)
                    }
                    position = this.proToGeo(position)
                    fun({
                        coordinate: this.proToGeo(cartesian),
                        pickedFeature,
                        feature,
                        position,
                        properties: pickedFeature.description._value,
                        windowPosition,
                    })
                }
            } else {
                feature && (pickedFeature = feature.id)
                let position, properties
                if (feature) {
                    position = pickedFeature.position
                        ? pickedFeature.position._value
                            ? this.proToGeo(pickedFeature.position._value)
                            : this.proToGeo(pickedFeature.position._callback())
                        : {}
                    properties = pickedFeature.description ? pickedFeature.description._value : {}
                }
                fun({
                    coordinate: cartesian ? this.proToGeo(cartesian || {}) : undefined,
                    pickedFeature,
                    feature,
                    position,
                    properties,
                    windowPosition,
                })
            }
        }, mouseTypes[type])
        this._events.push({ fun, type, layerId })
    }

    /**
     * 移除鼠标点击事件
     * @param {String} type 事件类型
     * @param {Function} fun 回调函数
     * @param {String} layerId 图层id
     */
    removeEvent(type, fun, layerId) {
        // 删除时必须有其中一个
        if (!type && !fun && !layerId) {
            return
        }
        const index = this._events.findIndex((i) => {
            let funMatch = true,
                typeMatch = true,
                layerIdMatch = true
            if (fun) {
                funMatch = i.fun === fun
            }
            if (type) {
                typeMatch = i.type === type
            }
            if (layerIdMatch) {
                layerIdMatch = i.layerId === layerId
            }
            return funMatch && typeMatch && layerIdMatch
        })
        if (index !== -1) {
            const { type, func } = this._events[index]
            this.this.basemap.un(type, func)
            this._events.splice(index, 1)
        }
    }
}
