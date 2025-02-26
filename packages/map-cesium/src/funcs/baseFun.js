import * as turf from '@turf/turf'
import { Math as CesiumMath, Cartographic } from 'cesium'

/**
 * 计算多点长度
 * @param {Array} points Cartesian3 笛卡尔坐标集合
 * @returns { Array, Number } {每段的长度及中点， 总长度}
 */
export const lineLength = (points) => {
    if (points.length < 2) {
        return { lengthArr: [], length: 0 }
    }
    const lengthArr = []
    const lineArr = []
    for (let i = 0; i < points.length; i++) {
        const start = Cartographic.fromCartesian(points[i])
        const end =
            i === points.length - 1 ? Cartographic.fromCartesian(points[0]) : Cartographic.fromCartesian(points[i + 1])
        const coorStart = [CesiumMath.toDegrees(start.longitude), CesiumMath.toDegrees(start.latitude)]
        const coorEnd = [CesiumMath.toDegrees(end.longitude), CesiumMath.toDegrees(end.latitude)]
        const pointStart = turf.point(coorStart)
        const pointEnd = turf.point(coorEnd)
        const length = turf.distance(pointStart, pointEnd) * 1000
        const center = turf.midpoint(pointStart, pointEnd).geometry.coordinates
        lengthArr.push({ length, center })
        lineArr.push(coorStart)
    }
    const line = turf.lineString(lineArr)
    const length = turf.length(line) * 1000
    return { lengthArr, length }
}

/**
 * 计算多点面积
 * @param {Array} points Cartesian3 笛卡尔坐标集合
 * @returns { Number, Object } {面积， 中心点}
 */
export const polygonArea = (points) => {
    if (points.length < 3) {
        return { area: 0, center: undefined }
    }
    const pointArr = []
    points.concat([points[0]]).forEach((item) => {
        const coor = Cartographic.fromCartesian(item)
        pointArr.push([CesiumMath.toDegrees(coor.longitude), CesiumMath.toDegrees(coor.latitude)])
    })
    const polygon = turf.polygon([pointArr])
    const area = turf.area(polygon)
    const center = turf.centerOfMass(polygon).geometry.coordinates
    return { area, center }
}

/**
 * 计算矩形面积
 * @param {Array} points Cartesian3 笛卡尔坐标集合
 */
export const rectArea = (points) => {
    const [start, end] = points.map((item) => {
        const res = Cartographic.fromCartesian(item)
        return [CesiumMath.toDegrees(res.longitude), CesiumMath.toDegrees(res.latitude)]
    })
    const rectPoints = [start, [start[0], end[1]], end, [end[0], start[1]], start]
    const polygon = turf.polygon([rectPoints])
    const area = turf.area(polygon)
    const Epoints = turf.explode(polygon)
    const center = turf.centerOfMass(polygon).geometry.coordinates
    return { area, center, points: Epoints.features.map((feature) => feature.geometry.coordinates) }
}

// 格式化面积
export const formatArea = (area) => {
    let output
    if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + ' km\xB2'
    } else {
        output = Math.round(area * 100) / 100 + ' m\xB2'
    }
    return output
}

// 格式化长度
export const formatLength = (length) => {
    let output
    if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + ' km'
    } else {
        output = Math.round(length * 100) / 100 + ' m'
    }
    return output
}

// 根据样式获取一个entity点
export const getPoint = function({
    img, imgMovement, imageScale = 0.5, fill, strokeColor, strokeWidth, radius, text: textTemp, showLevel, clampToGround, fontColor,
    fontOutlineColor, properties, id, font, position
}) {
    if (img instanceof Function) {
        img = img()
    }
    let lastTime = 0, isAdd = true, tipHeight = 1
    const entity = new Cesium.Entity({
        id: id || new Date().getTime(),
        description: properties || {},
        position: showLevel ? new Cesium.CallbackProperty(() => {
            // 通过设置该实体位置到地球中心达到隐藏目的
            const zoom = this.basemap.heightToZoom()
            if (typeof showLevel === 'function') {
                return showLevel(zoom) ? position : originPosition
            }
            return zoom > showLevel ? position : originPosition
        }, false) : position,
        billboard: img ? {
            image: img,
            scale: imageScale,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: img ? Cesium.Cartesian2(0, -72) : undefined,
            heightReference: clampToGround ? Cesium.HeightReference.CLAMP_TO_GROUND : null,
            eyeOffset: imgMovement ? new Cesium.CallbackProperty((time) => {
                let x = 0, y = 0, z = -2
                try {
                    const { pitch } = this.basemap.camera
                    const sphere = new Cesium.BoundingSphere()
                    const state = this.basemap._dataSourceDisplay.getBoundingSphere(
                        entity,
                        false,
                        sphere
                    )
                    if (state === Cesium.BoundingSphereState.DONE) {
                        // x² / a² + y² / b² = 1
                        const pitchRatio = Math.sqrt(1 - Math.pow(Math.abs(pitch) * 2 / Math.PI, 2))
                        y = sphere.radius * 2 * pitchRatio
                    }
                } catch {
                    y = 0
                }
                // 根据相机高度计算跳的高度
                // const height = map.camera.positionCartographic.height
                // const heightSeg = 0.1997 * Math.pow(height, 0.5804)
                // 根据视野相机(平方)距离计算跳的高度
                const viewPosition = this.basemap.camera.position
                const distance = Math.pow(viewPosition.x - position.x, 2) +
                    Math.pow(viewPosition.y - position.y, 2) +
                    Math.pow(viewPosition.z - position.z, 2)
                const heightSeg = 0.0146 * Math.pow(distance, 0.32)
                if (time.secondsOfDay - lastTime > 0.15) {
                    lastTime = time.secondsOfDay
                    if (isAdd) {
                        tipHeight += 1
                        if (tipHeight > 5) {
                            isAdd = false
                        }
                    } else {
                        tipHeight -= 1
                        if (tipHeight <= 0) {
                            isAdd = true
                        }
                    }
                }
                return new Cesium.Cartesian3(x, y + tipHeight * heightSeg, z)
            }, false) : undefined
        } : undefined,
        point: img ? undefined : {
            pixelSize: radius,
            color: Cesium.Color.fromCssColorString(fill),
            outlineColor: Cesium.Color.fromCssColorString(strokeColor),
            outlineWidth: strokeWidth,
            heightReference: clampToGround ? Cesium.HeightReference.CLAMP_TO_GROUND : null
        },
        label: textTemp ? {
            show: textTemp instanceof Object ? new Cesium.CallbackProperty(() => {
                const zoom = this.basemap.heightToZoom()
                return zoom > textTemp.showLevel
            }, false) : true,
            text: textTemp instanceof Object ? textTemp.val : textTemp,
            font: font || '14px sans-serif',
            fillColor: Cesium.Color.fromCssColorString(fontColor || 'rgba(122,122,255,1)'),
            outlineColor: Cesium.Color.fromCssColorString(fontOutlineColor || 'rgba(255, 255, 255,1)'),
            outlineWidth: 1,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: (img) ? new Cesium.Cartesian2(0, -48) : undefined,
            heightReference: clampToGround ? Cesium.HeightReference.CLAMP_TO_GROUND : null
        } : undefined
    })
    return entity
}