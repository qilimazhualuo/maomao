import { Cartographic, Math as CesiumMath, clone } from 'cesium'
const { fromCartesian } = Cartographic

// 用于cesium导出geojson数据
export function GeoJSON(entities) {
    this.type = 'FeatureCollection'
    const features = []
    clone(entities).forEach((entity) => {
        if (entity.point) {
            features.push(new Point(entity))
        }
        if (entity.polyline) {
            features.push(new LineString(entity))
        }
        if (entity.polygon) {
            features.push(new Polygon(entity))
        }
        if (entity.rectangle) {
            features.push(new Rectangle(entity))
        }
        if (entity.ellipse) {
            features.push(new Circle(entity))
        }
    })
    this.features = features
}

function Point(entity) {
    this.type = 'Feature'
    this.properties = entity.description || null
    const position = trans43(entity.position.getValue())
    this.geometry = new Geometry('Point', position)
}

function LineString(entity) {
    // 判断多条线还是一条线 指定type
    this.type = 'Feature'
    this.properties = entity.description || null
    const positions = entity.polyline.positions.getValue().map((i) => trans43(i))
    this.geometry = new Geometry('LineString', positions)
}

function Polygon(entity) {
    // 根据数量判断 类型
    this.type = 'Feature'
    this.properties = entity.description || null
    const positions = entity.polygon.hierarchy.getValue().positions.map((i) => trans43(i))
    this.geometry = new Geometry('Polygon', [positions.concat([positions[0]])])
}

function Rectangle(entity) {
    this.type = 'Feature'
    this.properties = entity.description || null
    const { east, west, south, north } = entity.rectangle.coordinates.getValue()
    const e = CesiumMath.toDegrees(east)
    const w = CesiumMath.toDegrees(west)
    const s = CesiumMath.toDegrees(south)
    const n = CesiumMath.toDegrees(north)
    const positions = [
        [w, s],
        [e, s],
        [e, n],
        [w, n],
        [w, s]
    ]
    this.geometry = new Geometry('Polygon', [positions])
}

// 圆同ol 不创建点位数据 保持23维一致
function Circle(entity) {
    this.type = 'GeometryCollection'
    this.properties = entity.description || null
    this.geometry = []
}

function Geometry(type, coordinates) {
    this.type = type
    this.coordinates = coordinates
}

function trans43(aa) {
    const point = fromCartesian(aa)
    return [
        CesiumMath.toDegrees(point.longitude),
        CesiumMath.toDegrees(point.latitude),
        point.height
    ]
}
