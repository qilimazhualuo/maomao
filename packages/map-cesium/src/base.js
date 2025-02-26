import {
    Viewer,
    Terrain,
    CesiumTerrainProvider,
    Math as CesiumMath,
    Cartographic,
    FeatureDetection,
    ScreenSpaceEventType,
    EventHelper,
    Cartesian3,
} from 'cesium'
import CesiumNavigation from 'cesium-navigation-es6'
import BaseFunc from './baseFunc'

export default class Base extends BaseFunc {
    constructor({ target, center, zoom = 17, callback }) {
        super(...arguments)
        this.container = target instanceof HTMLElement ? target : document.querySelector(target)
        this.basemap = new Viewer(this.container, {
            animation: false,
            // 没有默认影响时允许加载默认影像图
            baseLayerPicker: false,
            fullscreenButton: false,
            vrButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            sceneModePicker: false,
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: false,
            sceneMode: 3,
            imageryProvider: false,
            contextOptions: {
                webgl: {
                    preserveDrawingBuffer: true, // 允许读取canvas内容 打印使用
                },
            },
        })
        // 判断是否支持图像渲染像素化处理 用于支持浏览器缩放后正常显示
        if (FeatureDetection.supportsImageRenderingPixelated()) {
            this.basemap.resolutionScale = window.devicePixelRatio
        }
        this.resolutionScale = window.devicePixelRatio
        // 地形
        this.basemap.scene.setTerrain(new Terrain(CesiumTerrainProvider.fromUrl('/terrain/')))
        // 开启深度检测
        this.basemap.scene.globe.depthTestAgainstTerrain = true
        // 设置相机最大高度
        this.basemap.scene.screenSpaceCameraController.maximumZoomDistance = 8000000
        // 去掉默认的双击事件
        this.basemap.cesiumWidget.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
        // 限制相机视野角度
        this.basemap.scene.preRender.addEventListener(() => {
            if (this.basemap.trackedEntity) {
                return
            }
            if (this.basemap.camera.pitch > -0.34) {
                this.basemap.camera.setView({
                    orientation: {
                        heading: this.basemap.camera.heading,
                        pitch: -0.34,
                        roll: this.basemap.camera.roll,
                    },
                })
            }
        })
        // 处理罗盘
        const zoomHeight = this.zoomToHeight(zoom)
        this.navigation = new CesiumNavigation(this.basemap, {
            defaultResetView: new Cartographic(
                CesiumMath.toRadians(center[0]),
                CesiumMath.toRadians(center[1]),
                center[2] || zoomHeight
            ),
            orientation: {
                heading: CesiumMath.toRadians(0),
                pitch: CesiumMath.toRadians(-66.6402342251215),
                roll: CesiumMath.toRadians(360),
            },
            duration: 3,
            enableCompass: true,
            enableZoomControls: true,
            enableDistanceLegend: true,
            enableCompassOuterRing: true,
            resetTooltip: '重置视图',
            zoomInTooltip: '放大',
            zoomOutTooltip: '缩小',
        })
        setTimeout(() => {
            center && this.setCenter(center)
            callback instanceof Function && callback()
        }, 200)
        // 旋转地球
        // const helper = new EventHelper()
        // helper.add(this.basemap.scene.globe.tileLoadProgressEvent, (e) => {
        //     // 地球加载完成
        //     if (e === 0) {
        //         helper.removeAll()
        //         // 旋转次数 用来控制停止
        //         this.basemap.clock.shouldAnimate = true
        //         this.basemap.scene.globe.enableLighting = true
        //         const angle = CesiumMath.toRadians(Math.PI * 0.2)
        //         let rotate_num = 2
        //         const rotate = () => {
        //             this.basemap.scene.camera.rotate(Cartesian3.UNIT_Z, angle)
        //             rotate_num++
        //             if (rotate_num > 512) {
        //                 this.basemap.clock.shouldAnimate = false
        //                 this.basemap.clock.onTick.removeEventListener(rotate)
        //                 // 设置视野中心
        //                 center && this.setCenter(center)
        //                 callback instanceof Function && callback()
        //             }
        //         }
        //         this.basemap.clock.onTick.addEventListener(rotate)
        //     }
        // })
        this._initOverlay()
        // this._initModal()
    }

    /**
     * 设置中心点
     * @param {Array} positions 中心点或者范围
     * @param {Object} fitOption 移动参数
     */
    setCenter(positions, fitOption = { maxZoom: 17 }, isGeo = true) {
        if (typeof positions[0] === 'number') {
            const zoomHeight = this.zoomToHeight(fitOption.maxZoom)
            this.basemap.camera.flyTo({
                destination: isGeo ? Cartesian3.fromDegrees(positions[0], positions[1], positions[3] || zoomHeight) : positions,
                duration: fitOption.duration ? fitOption.duration / 1000 : undefined, // 这里不赋值默认要cesium自己计算
            })
        } else {
            const carts = isGeo ? Cartesian3.fromDegreesArray(positions.reduce((prev, cur) => {
                const [long, lat, height = zoomHeight] = cur
                return [...prev, long, lat, height]
            }, [])) : positions
            this.basemap.camera.flyTo({
                destination: Rectangle.fromCartesianArray(carts),
                duration: fitOption.duration,
            })
        }
    }
}
