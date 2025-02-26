import { Overlay } from './funcs/overlay'
import { Ellipsoid, EllipsoidalOccluder, SceneTransforms } from 'cesium'
import Clip from './clip'

export default class extends Clip {
    constructor() {
        super(...arguments)
        this.overlays = []
    }

    _initOverlay() {
        this.overlayContent = document.createElement('div')
        this.overlayContent.style.position = 'absolute'
        this.overlayContent.style.width = '100%'
        this.overlayContent.style.height = '100%'
        this.overlayContent.style.top = 0
        this.overlayContent.style.left = 0
        this.container.insertBefore(this.overlayContent, this.container.children[0])
        this.basemap.scene.preRender.addEventListener(() => {
            if (this.overlays.length === 0) {
                return
            }
            this.overlays.forEach((item) => {
                const { dom, position, allWaysShow } = item
                let poi
                if (position && position.getValue instanceof Function) {
                    poi = position.getValue(this.basemap.clock.currentTime)
                } else {
                    poi = position
                }
                if (poi) {
                    // 首先判断是否在地球正面
                    const ellipsoid = Ellipsoid.WGS84
                    const occluder = new EllipsoidalOccluder(ellipsoid, this.basemap.camera.position)
                    const visible = occluder.isPointVisible(poi)
                    if (visible || allWaysShow) {
                        const screenPosition = SceneTransforms.worldToDrawingBufferCoordinates(this.basemap.scene, poi)
                        // 这里对比屏幕坐标的整数位，防止频繁更新卡顿
                        const shouldUpdate =
                            screenPosition &&
                            (!item.prePosition ||
                                parseInt(screenPosition.x) !== parseInt(item.prePosition.x) ||
                                parseInt(screenPosition.y) !== parseInt(item.prePosition.y))
                        if (shouldUpdate) {
                            item.prePosition = screenPosition
                            dom.style.display = 'block'
                            dom.style.transform = `translate(${screenPosition.x / this.resolutionScale}px, ${screenPosition.y / this.resolutionScale}px)`
                        }
                    } else {
                        if (dom.style.display === 'block') {
                            dom.style.display = 'none'
                        }
                    }
                } else {
                    if (dom.style.display === 'block') {
                        dom.style.display = 'none'
                    }
                }
            })
        })
    }

    addOverlay({ dom, position, allWaysShow }) {
        dom = dom instanceof HTMLElement ? dom : document.getElementById(dom)
        const overlay = new Overlay({ dom, position, content: this.overlayContent, allWaysShow })
        this.overlays.push(overlay)
        return overlay
    }

    setOverlayPosition(overlay, position) {
        overlay.setPosition(position)
    }

    removeOverlay(overlay) {
        const index = this.overlays.indexOf(overlay)
        if (index > -1) {
            const { dom } = this.overlays[index]
            this.overlayContent.removeChild(dom)
            this.overlays.splice(index, 1)
            return true
        }
        return false
    }
}
