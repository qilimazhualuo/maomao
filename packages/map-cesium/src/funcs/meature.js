import {
    CustomDataSource,
    ScreenSpaceEventHandler,
    ScreenSpaceEventType,
    CallbackProperty,
    Color,
    Cartesian2,
    Cartesian3,
    clone,
    PolygonHierarchy,
    ColorMaterialProperty,
    HeightReference
} from 'cesium'
import { GeoJSON } from './geoJson'
import { lineLength, polygonArea, rectArea, formatArea, formatLength } from './baseFun'

const { fromDegrees, distance } = Cartesian3

export default class {
    constructor(params) {
        const { basemap, guid, editCallBack } = params
        this.viewer = basemap
        this.guid = guid
        this.#initEventHandler()
        this.style = {}
        this.type
        this.drawIngId
        this.editCallBack = editCallBack
        // 编辑属性
        this.isEdit = false
        // 当前编辑的节点 主要move事件使用
        this.editIdx
        // 同样贴地的图形先添加的datasource在上面
        this.dataSourceEdit = new CustomDataSource()
        this.viewer.dataSources.add(this.dataSourceEdit)
        // 绘制属性
        this.dataSource = new CustomDataSource()
        this.dataSourceTemp = new CustomDataSource()
        this.isDraw = false
        this.entityPoints = {}
        this.movePoint
        this.viewer.dataSources.add(this.dataSource)
        this.viewer.dataSources.add(this.dataSourceTemp)
    }

    /**
     * 编辑相关
     */
    // 鼠标事件 创建监听的handler
    #initEventHandler() {
        this.drawhHandler = new ScreenSpaceEventHandler(this.viewer.scene.canvas)
    }

    //激活编辑
    #activate() {
        // 先禁用
        this.#deactivate()
        //鼠标左键点击事件 鼠标左键点击拾取需要编辑的对象
        this.#initLeftClickEventHandler()
    }

    //禁用编辑
    #deactivate() {
        this.#unRegisterEvents()
        this.#clearAllEditVertex()
    }

    // 清除编辑图层
    #clearAllEditVertex() {
        this.dataSourceEdit.entities.removeAll()
    }

    // 左键点击拾取设置事件
    #initLeftClickEventHandler() {
        this.drawhHandler.setInputAction((e) => {
            let id = this.viewer.scene.pick(e.position)
            if (!id || !id.id) {
                return // 没有拾取到对象 直接返回 不做任何操作
            }
            // 拾取到不属于自己的entity不做处理
            if (!this.dataSource.entities.contains(id.id)) {
                return
            }
            const entity = id.id
            const properties = entity.description.getValue()
            // 拾取到对象 判断拾取到的对象类型
            if (!entity.id || !properties || !properties.type) {
                return
            }
            //重复点击同一个对象
            if (this.editEntity && this.editEntity.id === entity.id) {
                return
            }
            //拾取到新的对象
            this.type = properties.type
            this.drawIngId = entity.id
            this.isEdit = true
            this.#handleEditEntity()
        }, ScreenSpaceEventType.LEFT_CLICK)
    }

    // 处理编辑对象 - 为当前编辑的数据每个点生成一个可拖拽的点entity
    #handleEditEntity() {
        // 清空编辑图层
        this.#clearAllEditVertex()
        this.entityPoints[this.drawIngId].forEach((position, idx) => {
            // 每个绘制都绘制一个点
            this.dataSourceEdit.entities.add({
                description: { idx },
                position: new CallbackProperty(() => position, false),
                point: {
                    pixelSize: 10,
                    color: Color.RED,
                    outlineColor: Color.fromCssColorString('rgba(24, 144, 255, 1)'),
                    outlineWidth: 2,
                    disableDepthTestDistance: 50000000,
                    heightReference: HeightReference.CLAMP_TO_GROUND
                }
            })
        })
        this.#registerEvents()
    }

    // 注册事件监听
    #registerEvents() {
        if (this.isEdit) {
            // 鼠标左键落下事件 编辑时使用
            this.#initLeftDownEventHandler()
            // 鼠标左键抬起事件 当有编辑对象时
            this.#initLeftUpEventHandler()
        } else {
            // 鼠标左键点击事件 新增绘制时使用
            this.#initLeftClicnEventHandler()
        }
        // 鼠标移动事件 鼠标移动 如果有编辑对象 表示改变编辑对象的位置
        this.#initMouseMoveEventHandler()
    }

    // 取消事件监听
    #unRegisterEvents() {
        this.drawhHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOWN)
        this.drawhHandler.removeInputAction(ScreenSpaceEventType.LEFT_UP)
        this.drawhHandler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK)
        this.drawhHandler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE)
    }

    // 将屏幕坐标转为三维笛卡尔坐标
    #getCartesian3FromScreenPosition(position) {
        return this.viewer.scene.pickPosition(position)
        // const ellipsoid = this.viewer.scene.globe.ellipsoid
        // return this.viewer.camera.pickEllipsoid(position, ellipsoid)
    }

    #endEdit() {
        // 双击表示结束编辑
        this.isEdit = false
        this.type = undefined
        this.drawIngId = undefined
        this.#clearAllEditVertex()
        this.#unRegisterEvents()
        // 结束编辑重新启用拾取
        this.#initLeftClickEventHandler()
        console.log('结束编辑')
        this.editCallBack instanceof Function &&
            this.editCallBack({
                features: clone(this.dataSource.entities.values),
                geojson: new GeoJSON(this.dataSource.entities.values),
                style: this.style,
                drawType: this.type
            })
    }

    // 鼠标落下事件 LEFT_DOWN
    #initLeftDownEventHandler() {
        let time = new Date().getTime()
        let x
        let y
        this.drawhHandler.setInputAction((e) => {
            const now = new Date().getTime()
            // 300 毫秒以内的俩次点击认为是双击结束绘制
            if (now - time < 300 && x === e.position.x && y === e.position.y) {
                this.#endEdit()
                return
            }
            x = e.position.x
            y = e.position.y
            time = now
            let id = this.viewer.scene.pick(e.position)
            if (!id || !id.id) {
                return // 没有拾取到对象 直接返回 不做任何操作
            }
            // 拾取到不属于编辑图层的entity不做处理
            if (!this.dataSourceEdit.entities.contains(id.id)) {
                return
            }
            const entity = id.id
            const properties = entity.description.getValue()

            // 拾取到对象 判断拾取到的对象类型
            if (!entity.id || !properties || properties.idx === undefined) {
                return
            }
            //禁用场景的旋转移动功能 保留缩放功能
            this.viewer.scene.screenSpaceCameraController.enableRotate = false
            this.viewer.scene.screenSpaceCameraController.enableTranslate = false
            this.editIdx = properties.idx
        }, ScreenSpaceEventType.LEFT_DOWN)
    }

    // 场景鼠标左键点击绘制事件 LEFT_CLICK
    #initLeftClicnEventHandler() {
        let time = new Date().getTime()
        let x
        let y
        this.drawhHandler.setInputAction((e) => {
            const now = new Date().getTime()
            // 300 毫秒以内的俩次点击认为是双击结束绘制
            if (now - time < 300 && x === e.position.x && y === e.position.y) {
                this.#endDraw()
                return
            }
            x = e.position.x
            y = e.position.y
            time = now
            const cartesian = this.#getCartesian3FromScreenPosition(e.position)
            // 如果未点击在地球上，那么返回
            if (!cartesian) {
                // return
            }
            if (!this.isDraw) {
                // 获取当前点击的entity TODO
                return
            }
            // 保存点的位置信息
            this.entityPoints[this.drawIngId].push(cartesian)
            if (this.type === 'Point' || this.type === 'fixedCircle') {
                this.#endDraw()
            } else if (
                (this.type === 'Rect' || this.type === 'Circle') &&
                this.entityPoints[this.drawIngId].length === 2
            ) {
                this.#endDraw()
            } else if (this.type === 'LineString' || this.type === 'Polygon') {
                // 点击时给当前线段画长度
                // if (points.length > 1) {
                //     const arr = points.slice(-2)
                //     const start = arr[0]
                //     const end = arr[1]
                //     const length = distance(start, end)
                //     const center = BoundingSphere.fromPoints(arr).center
                //     createLabel({ dataSource: dataSourceTemp, movePoint: center, text: formatLength(length) })
                // }
            }
        }, ScreenSpaceEventType.LEFT_CLICK)
    }

    // 场景鼠标左键抬起事件 LEFT_UP
    #initLeftUpEventHandler() {
        this.drawhHandler.setInputAction(() => {
            this.viewer.scene.screenSpaceCameraController.enableRotate = true
            this.viewer.scene.screenSpaceCameraController.enableTranslate = true
            this.editIdx = undefined
        }, ScreenSpaceEventType.LEFT_UP)
    }

    // 场景鼠标移动事件 MOUSE_MOVE
    #initMouseMoveEventHandler() {
        this.drawhHandler.setInputAction((e) => {
            const cartesian = this.#getCartesian3FromScreenPosition(e.endPosition)
            // 编辑流程
            if (this.isEdit) {
                // 没有编辑任何点
                if (this.editIdx === undefined || this.drawIngId === undefined) {
                    return
                }
                const { x, y, z } = cartesian
                this.entityPoints[this.drawIngId][this.editIdx].x = x
                this.entityPoints[this.drawIngId][this.editIdx].y = y
                this.entityPoints[this.drawIngId][this.editIdx].z = z
                return
            }
            // 新增流程
            // 如果未点击在地球上，那么返回
            if (!cartesian) {
                return
            }
            this.movePoint = cartesian
        }, ScreenSpaceEventType.MOUSE_MOVE)
    }

    #createEntity(type, style, id) {
        const { text, pixelOffset, backgroundColor, textbackgroundColor, strokeColor, width } =
            style
        switch (type) {
            case 'Point' || 'fixedCircle':
                this.dataSource.entities.add({
                    id,
                    description: { type },
                    position: new CallbackProperty(() => {
                        return this.entityPoints[id][0]
                    }, false),
                    point: {
                        color: Color.fromCssColorString(backgroundColor || '#f6ffed'),
                        pixelSize: 5,
                        outlineColor: Color.fromCssColorString('rgba(24, 144, 255, 1)'),
                        outlineWidth: 2,
                        disableDepthTestDistance: 50000000,
                        heightReference: HeightReference.CLAMP_TO_GROUND
                    },
                    label: {
                        text,
                        font: '12px Calibri,sans-serif',
                        pixelOffset: pixelOffset
                            ? new Cartesian2(...pixelOffset)
                            : new Cartesian2(0, -12),
                        showBackground: true,
                        backgroundColor: Color.fromCssColorString(
                            textbackgroundColor || 'rgba(59,89,153)'
                        ),
                        fillColor: Color.fromCssColorString('rgba(255, 255, 255, 1)'),
                        disableDepthTestDistance: 50000000,
                        heightReference: HeightReference.CLAMP_TO_GROUND
                    }
                })
                break
            case 'Circle' || 'fixedCircle':
                const radius = new CallbackProperty(() => {
                    if (this.entityPoints[id].length === 2) {
                        return distance(this.entityPoints[id][0], this.entityPoints[id][1])
                    } else if (this.entityPoints[id].length === 1) {
                        return distance(this.entityPoints[id][0], this.movePoint)
                    }
                    return 0
                }, false)
                this.dataSource.entities.add({
                    id,
                    description: { type },
                    position: new CallbackProperty(() => {
                        if (this.entityPoints[id].length) {
                            return this.entityPoints[id][0]
                        }
                        return this.movePoint
                    }, false),
                    ellipse: {
                        semiMinorAxis: radius,
                        semiMajorAxis: radius,
                        height: 1, // 设置边框就必须有这个高度
                        outline: true,
                        outlineColor: Color.fromCssColorString(
                            strokeColor || 'rgba(24, 144, 255, 0.9)'
                        ),
                        outlineWidth: width || 2,
                        material: Color.fromCssColorString(
                            backgroundColor || 'rgba(24, 144, 255, 0.2)'
                        ),
                        disableDepthTestDistance: 50000000,
                        heightReference: HeightReference.CLAMP_TO_GROUND
                    },
                    label: {
                        text: new CallbackProperty(() => {
                            if (this.entityPoints[id].length) {
                                return formatArea(Math.PI * Math.pow(radius.getValue(), 2))
                            }
                            return '点击绘制'
                        }, false),
                        font: '12px Calibri,sans-serif',
                        showBackground: true,
                        pixelOffset: pixelOffset
                            ? new Cartesian2(...pixelOffset)
                            : new Cartesian2(0, -12),
                        backgroundColor: Color.fromCssColorString('rgba(59,89,153)'),
                        fillColor: Color.fromCssColorString('rgba(255, 255, 255, 1)'),
                        disableDepthTestDistance: 50000000,
                        heightReference: HeightReference.CLAMP_TO_GROUND
                    }
                })
                break
            case 'Rect':
                const rectRes = new CallbackProperty(() => {
                    if (this.entityPoints[id].length >= 2) {
                        return rectArea(this.entityPoints[id])
                    }
                    if (this.entityPoints[id].length && this.movePoint && this.drawIngId === id) {
                        return rectArea(this.entityPoints[id].concat(this.movePoint))
                    }
                    return {}
                }, false)
                this.dataSource.entities.add({
                    id,
                    description: { type },
                    // cesium的矩形贴地和polyline边界不符合 用多边形画吧
                    polygon: {
                        hierarchy: new CallbackProperty(() => {
                            const { points } = rectRes.getValue()
                            if (points) {
                                points.pop()
                                return new PolygonHierarchy(
                                    points.map((point) => {
                                        return fromDegrees(point[0], point[1])
                                    })
                                )
                            }
                            const fakePoint =
                                this.movePoint || new Cartesian3(-1975765, 4764519, 3739269)
                            const fakePoint2 = clone(fakePoint)
                            fakePoint2.x += 1
                            return new PolygonHierarchy([fakePoint, clone(fakePoint), fakePoint2])
                        }, false),
                        material: Color.fromCssColorString(
                            backgroundColor || 'rgba(24, 144, 255, 0.3)'
                        ),
                        disableDepthTestDistance: 50000000,
                        zIndex: 1000000,
                        heightReference: new CallbackProperty(() => {
                            return this.entityPoints[id].length > 2
                                ? HeightReference.CLAMP_TO_GROUND
                                : HeightReference.NONE
                        }, false)
                        // classificationType: ClassificationType.TERRAIN,
                    },
                    // 贴地的多边形没有边框绘制一个
                    polyline: {
                        positions: new CallbackProperty(() => {
                            const { points } = rectRes.getValue()
                            if (points) {
                                return points.map((point) => {
                                    return fromDegrees(point[0], point[1])
                                })
                            }
                            let fakePoint = this.movePoint || Cartesian3.ONE
                            return [fakePoint, fakePoint]
                        }, false),
                        material: Color.fromCssColorString(
                            strokeColor || 'rgba(24, 144, 255, 0.9)'
                        ),
                        width: width || 2,
                        disableDepthTestDistance: 50000000,
                        clampToGround: true
                    },
                    position: new CallbackProperty(() => {
                        const { center } = rectRes.getValue()
                        if (!center) {
                            return this.movePoint || Cartesian3.ZERO
                        }
                        return fromDegrees(center[0], center[1])
                    }, false),
                    label: {
                        text: new CallbackProperty(() => {
                            const { area } = rectRes.getValue()
                            if (area) {
                                return formatArea(area)
                            }
                            return '点击绘制'
                        }, false),
                        font: '12px Calibri,sans-serif',
                        showBackground: true,
                        pixelOffset: pixelOffset
                            ? new Cartesian2(...pixelOffset)
                            : new Cartesian2(0, -12),
                        backgroundColor: Color.fromCssColorString('rgba(24, 144, 255, 1)'),
                        fillColor: Color.fromCssColorString('rgba(255, 255, 255, 1)'),
                        disableDepthTestDistance: 50000000,
                        heightReference: HeightReference.CLAMP_TO_GROUND
                    }
                })
                break
            case 'Polygon':
                const result = new CallbackProperty(() => {
                    if (this.movePoint && this.drawIngId === id) {
                        return polygonArea(this.entityPoints[id].concat(this.movePoint))
                    }
                    return polygonArea(this.entityPoints[id])
                }, false)
                this.dataSource.entities.add({
                    id,
                    description: { type },
                    polygon: {
                        hierarchy: new CallbackProperty(() => {
                            if (this.entityPoints[id].length < 2) {
                                let fakePoint = new Cartesian3(-1975765, 4764519, 3739269)
                                if (this.movePoint && this.drawIngId === id) {
                                    fakePoint = clone(this.movePoint)
                                }
                                const fakePoint2 = clone(fakePoint)
                                fakePoint2.x += 1
                                return new PolygonHierarchy(
                                    this.entityPoints[id].concat(fakePoint).concat(fakePoint2)
                                )
                            }
                            if (this.isDraw && this.movePoint && this.drawIngId === id) {
                                return new PolygonHierarchy(
                                    this.entityPoints[id].concat(this.movePoint)
                                )
                            }
                            return new PolygonHierarchy(this.entityPoints[id])
                        }, false),
                        material: Color.fromCssColorString(
                            backgroundColor || 'rgba(24, 144, 255, 0.3)'
                        ),
                        disableDepthTestDistance: 50000000,
                        zIndex: 1000000,
                        heightReference: new CallbackProperty(() => {
                            return this.entityPoints[id].length > 2
                                ? HeightReference.CLAMP_TO_GROUND
                                : HeightReference.NONE
                        }, false)
                        // classificationType: ClassificationType.TERRAIN,
                    },
                    // 贴地的多边形没有边框绘制一个
                    polyline: {
                        positions: new CallbackProperty(() => {
                            let res = this.entityPoints[id]
                            if (this.isDraw && this.movePoint && this.drawIngId === id) {
                                res = this.entityPoints[id].concat(this.movePoint)
                            }
                            if (res.length < 2) {
                                let fakePoint = this.movePoint || Cartesian3.ONE
                                res = res.concat([fakePoint, fakePoint])
                            }
                            return res.concat(res[0])
                        }, false),
                        material: Color.fromCssColorString(
                            strokeColor || 'rgba(24, 144, 255, 0.9)'
                        ),
                        width: width || 2,
                        disableDepthTestDistance: 50000000,
                        clampToGround: true
                    },
                    position: new CallbackProperty(() => {
                        const { center } = result.getValue()
                        return center
                            ? fromDegrees(center[0], center[1])
                            : this.movePoint || Cartesian3.ZERO
                    }, false),
                    label: {
                        text: new CallbackProperty(() => {
                            if (this.entityPoints[id].length) {
                                const { area } = result.getValue()
                                return formatArea(area)
                            }
                            return '点击绘制'
                        }, false),
                        font: '12px Calibri,sans-serif',
                        showBackground: true,
                        pixelOffset: pixelOffset
                            ? new Cartesian2(...pixelOffset)
                            : new Cartesian2(0, -12),
                        backgroundColor: Color.fromCssColorString('rgba(24, 144, 255, 1)'),
                        fillColor: Color.fromCssColorString('rgba(255, 255, 255, 1)'),
                        disableDepthTestDistance: 50000000,
                        heightReference: HeightReference.CLAMP_TO_GROUND
                    }
                })
                break
            case 'LineString':
                const lineRes = new CallbackProperty(() => {
                    if (this.movePoint && this.drawIngId === id) {
                        return lineLength(this.entityPoints[id].concat(this.movePoint))
                    }
                    return lineLength(this.entityPoints[id])
                }, false)
                this.dataSource.entities.add({
                    id,
                    description: { type },
                    polyline: {
                        positions: new CallbackProperty(() => {
                            let res = this.entityPoints[id]
                            if (this.isDraw && this.movePoint && this.drawIngId === id) {
                                res = this.entityPoints[id].concat(this.movePoint)
                            }
                            if (res.length < 2) {
                                let fakePoint = this.movePoint || Cartesian3.ONE
                                res = res.concat([fakePoint, fakePoint])
                            }
                            return res
                        }, false),
                        material: new ColorMaterialProperty(
                            Color.fromCssColorString(strokeColor || 'rgba(24, 144, 255, 0.9)')
                        ),
                        width: width || 2,
                        disableDepthTestDistance: 50000000,
                        clampToGround: true
                    },
                    position: new CallbackProperty(() => {
                        if (this.drawIngId === id) {
                            if (this.movePoint) {
                                return (
                                    this.movePoint ||
                                    this.entityPoints[id][this.entityPoints[id].length - 1]
                                )
                            }
                        }
                        return (
                            this.entityPoints[id][this.entityPoints[id].length - 1] ||
                            Cartesian3.ZERO
                        )
                    }, false),
                    label: {
                        text: new CallbackProperty(() => {
                            if (this.entityPoints[id].length) {
                                const { length } = lineRes.getValue()
                                return formatLength(length)
                            }
                            return '点击绘制'
                        }, false),
                        font: '12px Calibri,sans-serif',
                        showBackground: true,
                        pixelOffset: pixelOffset
                            ? new Cartesian2(...pixelOffset)
                            : new Cartesian2(0, -12),
                        backgroundColor: Color.fromCssColorString('rgba(24, 144, 255, 1)'),
                        fillColor: Color.fromCssColorString('rgba(255, 255, 255, 1)'),
                        disableDepthTestDistance: 50000000,
                        heightReference: HeightReference.CLAMP_TO_GROUND
                    }
                })
                break
            default:
                return false
        }
    }

    // 结束绘制
    #endDraw() {
        this.isDraw = false
        this.movePoint = undefined
        this.drawIngId = undefined
        this.#unRegisterEvents()

        const geojson = new GeoJSON(this.dataSource.entities.values)
        this.#activate()
        this.resolve instanceof Function &&
            this.resolve({
                features: clone(this.dataSource.entities.values),
                geojson,
                style: this.style,
                drawType: this.type
            })
        this.editCallBack instanceof Function &&
            this.editCallBack({
                features: clone(this.dataSource.entities.values),
                geojson,
                style: this.style,
                drawType: this.type
            })
    }

    #pointsToCarter3(points) {
        return points.map((point) => fromDegrees(point[0], point[1], point[2]))
    }

    // 绘制
    draw(type, style, clearBeforeStart) {
        return new Promise((resolve) => {
            this.#deactivate()
            this.isEdit && this.#endEdit()
            if (this.isDraw && this.drawIngId) {
                // 上一个没画完删掉上一个
                const entity = this.dataSource.entities.getById(this.drawIngId)
                entity && this.dataSource.entities.remove(entity)
            }
            this.isDraw = true
            this.resolve = resolve
            if (clearBeforeStart) {
                this.dataSource.entities.removeAll()
                this.dataSourceTemp.entities.removeAll()
                this.entityPoints = {}
            }
            this.type = type
            this.drawIngId = this.guid()
            this.entityPoints[this.drawIngId] = []
            // 暂不考虑吧不绘制的情况
            this.#createEntity(type, style, this.drawIngId)
            this.#registerEvents()
        })
    }

    // 设置样式
    setStyle(style) {
        this.style = Object.assign(this.style, style)
    }

    // 导出geojson
    getGeojson() {
        return new GeoJSON(this.dataSource.entities.values)
    }

    // 导入geojson
    setGeojson(geojson, fitOption, style) {
        if (style) {
            this.setStyle(style)
        }
        // geojson 转换成 entityPoints
        geojson.features.forEach((feature) => {
            // 先只实现点线面 其他的不处理
            switch (feature.geometry.type) {
                case 'Point': {
                    const guid = feature.id || this.guid()
                    this.entityPoints[guid] = this.#pointsToCarter3([feature.geometry.coordinates])
                    this.#createEntity('Point', this.style, guid)
                    break
                }
                case 'LineString': {
                    const guid = feature.id || this.guid()
                    this.entityPoints[guid] = this.#pointsToCarter3(feature.geometry.coordinates)
                    this.#createEntity('LineString', this.style, guid)
                    break
                }
                case 'Polygon': {
                    feature.geometry.coordinates.forEach((coors) => {
                        const guid = feature.id || this.guid()
                        this.entityPoints[guid] = this.#pointsToCarter3(coors)
                        this.#createEntity('Polygon', this.style, guid)
                    })
                    break
                }
                default:
                    return false
            }
        })
        this.#activate()
    }

    // 停止绘制
    stopDraw() {
        this.isDraw = false
        this.movePoint = undefined
        this.drawIngId = undefined
        this.#unRegisterEvents()
        this.#activate()
    }

    // 清除
    clear() {
        // 去除绘制的数据
        this.isDraw = false
        this.movePoint = undefined
        this.drawIngId = undefined
        // 去除编辑的数据
        this.isEdit = false
        this.editId = undefined
        this.editIdx = undefined
        this.#unRegisterEvents()
        this.dataSource.entities.removeAll()
        this.dataSourceTemp.entities.removeAll()
        this.dataSourceEdit.entities.removeAll()
        // 删除所有数据
        this.entityPoints = {}
    }

    // 销毁 - 删除所有图层就好了
    destory() {
        this.viewer.dataSources.remove(this.dataSource, true)
        this.viewer.dataSources.remove(this.dataSourceTemp, true)
        this.viewer.dataSources.remove(this.dataSourceEdit, true)
        delete this
    }
}
