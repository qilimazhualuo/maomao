import {
    Viewer,
    Terrain,
    CesiumTerrainProvider,
    EventHelper,
    Math as CesiumMath,
    Cartesian3,
    Cartographic,
} from 'cesium'

export default class {
    constructor() {}
    guid = () => {
        var S4 = () => {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
        }
        return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4()
    }
    changeCoordinate = (type) => {
        if (this.coordinateType.indexOf(type) === -1) {
            return
        }
        this.coordinate = type
    }

    // 坐标转换 4326转笛卡尔
    geoToPro = (geo) => {
        return Cartesian3.fromDegrees(...geo)
    }

    // 坐标转换 笛卡尔转4326
    proToGeo = (pro) => {
        let res = [0, -90]
        const point = Cartographic.fromCartesian(pro)
        res = point ? [CesiumMath.toDegrees(point.longitude), CesiumMath.toDegrees(point.latitude), point.height] : res
        return res
    }

    // 地图层级对应的高度
    zoomToHeight = (zoom) => {
        let heightArr = [
            11900000, 11900000, 11900000, 11900000, 6100000, 2600000, 1280000, 640000, 380000, 250600, 139780, 67985,
            26000, 13200, 6400, 2600, 1300, 660, 300, 100,
        ]
        return heightArr[zoom]
    }

    // 高度转对应层级
    heightToZoom = () => {
        let height = Math.ceil(this.basemap.camera.positionCartographic.height)
        let A = 40487.57
        let B = 0.00007096758
        let C = 91610.74
        let D = -40467.74
        return Math.round(D + (A - D) / (1 + Math.pow(height / C, B)))
    }
}
