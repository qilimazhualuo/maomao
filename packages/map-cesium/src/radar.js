import {
    CustomDataSource,
    Cartesian3,
    CallbackProperty,
    Plane,
    Cartesian2,
    ImageMaterialProperty,
    Color,
    Transforms,
    HeadingPitchRoll,
    Math as CesiumMath
} from 'cesium'
import * as turf from '@turf/turf'
import ScanRadarPrimitive from './primitives/scanRadar/index'
import customRadar from './primitives/customRadar'
import Overlay from './overlay'

export default class extends Overlay {
    constructor() {
        super(...arguments)
        this._radars = {}
    }

    radar1({ position, radius, isFly, layerId }) {
        layerId = layerId || this.guid()
        function drawCanvas() {
            let canvas = document.createElement('canvas')
            canvas.width = 300
            canvas.height = 300
            let context = canvas.getContext('2d')
            // context.fillStyle = 'blue'
            // context.fillRect(0, 0, 300, 300)
            let grd = context.createLinearGradient(0, 0, canvas.width, 0)
            grd.addColorStop(0, 'rgba(0,255,0,0.2)')
            grd.addColorStop(1, 'rgba(0,255,0,1)')
            context.fillStyle = grd
            context.beginPath()
            context.moveTo(150, 150)
            context.arc(150, 150, 140, (-90 / 180) * CesiumMath.PI, (0 / 180) * CesiumMath.PI) //context.arc(x,y,r,sAngle,eAngle,counterclockwise);
            context.fill()
            return canvas
        }
        const datasource = new CustomDataSource(layerId)
        let rotate = 0
        datasource.entities.add({
            position: Cartesian3.fromDegrees(...position),
            plane: {
                plane: new CallbackProperty(() => {
                    rotate += 0.015
                    const x = Math.cos(rotate)
                    const y = Math.sin(rotate)
                    return new Plane(new Cartesian3(x, y, 0), 0.0)
                }, false),
                dimensions: new Cartesian2(radius * 2, radius * 2),
                material: new ImageMaterialProperty({
                    image: drawCanvas(),
                    transparent: true
                })
            },
            ellipsoid: {
                radii: new Cartesian3(radius, radius, radius),
                material: Color.RED.withAlpha(0.2),
                outline: true,
                outlineColor: Color.BLACK.withAlpha(0.5)
            }
        })
        this.basemap.dataSources.add(datasource)
        isFly && this.basemap.flyTo(datasource.entities)
        this._radars[layerId] = { datasource }
        return layerId
    }

    radar2({ position, radius, height = 500000, isFly, layerId }) {
        layerId = layerId || this.guid()
        const datasource = new CustomDataSource(layerId)
        function drawCanvas() {
            let canvas = document.createElement('canvas')
            canvas.width = 300
            canvas.height = 300
            let context = canvas.getContext('2d')
            let grd = context.createRadialGradient(150, 150, 0, 150, 150, 140)
            grd.addColorStop(0, 'rgba(0,255,0,1)')
            grd.addColorStop(1, 'rgba(0,255,0,0.2)')
            context.fillStyle = grd
            context.beginPath()
            context.arc(150, 150, 140, 0, 2 * CesiumMath.PI)
            context.fill()
            return canvas
        }
        datasource.entities.add({
            position: Cartesian3.fromDegrees(...position, height / 2),
            cylinder: {
                bottomRadius: radius,
                topRadius: 0,
                length: height,
                material: Color.RED.withAlpha(0.2)
            }
        })
        const positionTemp = JSON.parse(JSON.stringify(position))
        let diff = height / 500
        let planeHeight = height
        datasource.entities.add({
            position: new CallbackProperty(() => {
                positionTemp[2] = planeHeight
                return Cartesian3.fromDegrees(...positionTemp)
            }, false),
            plane: {
                plane: new Plane(new Cartesian3(0, 0, -1), 0),
                dimensions: new CallbackProperty(() => {
                    planeHeight -= diff
                    if (planeHeight <= diff || planeHeight > height) {
                        diff = -diff
                    }
                    const width = ((height - planeHeight) / height) * radius || 1
                    return new Cartesian2(width * 2, width * 2)
                }, false),
                material: new ImageMaterialProperty({
                    image: drawCanvas(),
                    transparent: true
                })
            }
        })
        this.basemap.dataSources.add(datasource)
        isFly && this.basemap.flyTo(datasource.entities)
        this._radars[layerId] = { datasource }
        return layerId
    }

    radar3({ position, radius, height = 100000, isFly, layerId }) {
        layerId = layerId || this.guid()
        const datasource = new CustomDataSource(layerId)
        datasource.entities.add({
            position: Cartesian3.fromDegrees(...position, height),
            orientation: Transforms.headingPitchRollQuaternion(
                Cartesian3.fromDegrees(...position, height),
                HeadingPitchRoll.fromDegrees(0, 0, 0)
            ),
            ellipsoid: {
                radii: new Cartesian3(radius, radius, radius),
                minimumClock: CesiumMath.toRadians(-90),
                maximumClock: CesiumMath.toRadians(90),
                minimumCone: CesiumMath.toRadians(90),
                maximumCone: CesiumMath.toRadians(120),
                fill: true,
                material: Color.RED.withAlpha(0.5),
                outline: true,
                outlineColor: Color.YELLOWGREEN,
                subdivisions: 256,
                stackPartitions: 64,
                slicePartitions: 64
            }
        })
        this.basemap.dataSources.add(datasource)
        isFly && this.basemap.flyTo(datasource.entities)
        this._radars[layerId] = { datasource }
        return layerId
    }

    radar4({ position, radius, angleVert = 30, angleHori = 60, heading = 60, isFly, layerId }) {
        layerId = layerId || this.guid()
        const primit = new ScanRadarPrimitive({
            position: position,
            radius: radius,
            // 垂直角度
            angleVert,
            // 水平角度
            angleHori,
            heading
        })
        this.basemap.scene.primitives.add(primit)
        isFly && this.basemap.camera.flyToBoundingSphere(primit.boundingSphere)
        this._radars[layerId] = { primit }
        return layerId
    }

    radar5({ position, radius, height = 500000, direction = 0, isConstDirection = false, isFly, layerId }) {
        layerId = layerId || this.guid()
        const datasource = new CustomDataSource(layerId)
        // 计算角度
        let directionTemp = CesiumMath.toRadians(direction)
        const getOrientation = () => {
            if (!isConstDirection) {
                directionTemp += 0.005
            }
            var center = Cartesian3.fromDegrees(...position, height)
            var heading = directionTemp
            var pitch = 0
            // 底边平行于地面
            var roll = CesiumMath.toRadians(90)
            var hpr = new HeadingPitchRoll(heading, pitch, roll)
            var orientation = Transforms.headingPitchRollQuaternion(center, hpr)
            return orientation
        }
        // 计算位置
        const getPosition = () => {
            // 观察点
            const point = turf.point(position)
            const distance = height / 1000
            const bearing = (directionTemp * Math.PI) / 180
            const target = turf.destination(point, distance, bearing)
            return Cartesian3.fromDegrees(...target.geometry.coordinates, height)
        }
        // 绘制贴图
        let ratio = 0.1
        function drawCanvas() {
            let canvas = document.createElement('canvas')
            let width = 600
            canvas.width = width
            canvas.height = width
            let context = canvas.getContext('2d')
            ratio += 0.001
            if (ratio > 0.5) {
                ratio = 0.1
            }
            context.rect(0, 0, width, width)
            context.fillStyle = 'rgba(255,0,0,0.2)'
            context.fill()
            context.beginPath()
            context.arc(width / 2, width / 2, width * ratio, 0, Math.PI * 2)
            context.strokeStyle = 'rgba(0,255,0,0.7)'
            context.stroke()
            return canvas
        }
        datasource.entities.add({
            position: new CallbackProperty(() => {
                return getPosition()
            }, false),
            orientation: new CallbackProperty(() => {
                return getOrientation()
            }, false),
            cylinder: {
                bottomRadius: radius,
                topRadius: 0,
                length: height,
                material: new ImageMaterialProperty({
                    image: new CallbackProperty(() => {
                        return drawCanvas()
                    }, false),
                    transparent: true
                })
            }
        })
        this.basemap.dataSources.add(datasource)
        isFly && this.basemap.flyTo(datasource)
        this._radars[layerId] = { datasource }
        return layerId
    }

    customRadar({ position, height, radius, angleVert, angleHori = 60, heading = 60, isFly, layerId }) {
        layerId = layerId || this.guid()
        const primit = customRadar({
            position,
            height,
            radius,
            // 垂直角度
            angleVert,
            // 水平角度
            angleHori,
            heading
        })
        this.basemap.scene.primitives.add(primit)
        isFly && this.basemap.camera.flyToBoundingSphere(primit.boundingSphere)
        this._radars[layerId] = { primit }
        return layerId
    }

    removeRadar(layerId) {
        const radar = this._radars[layerId]
        if (radar) {
            if (radar.primit) {
                this.basemap.scene.primitives.remove(radar.primit)
            } else if (radar.datasource) {
                this.basemap.dataSources.remove(radar.datasource)
            }
            delete this._radars[layerId]
        }
    }

    removeAllRadar() {
        for (let id in this._radars) {
            this.removeRadar(id)
        }
    }
}