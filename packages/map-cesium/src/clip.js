import {
    Transforms,
    ClippingPlane,
    CustomDataSource,
    Cartesian3,
    ClippingPlaneCollection,
    PolygonHierarchy,
    Color,
    ClassificationType
} from 'cesium'
import Event from "./event"

export default class Clip extends Event {
    constructor() {
        super(...arguments)
        this._clipLayer = new CustomDataSource('_clipLayer')
        this.basemap.dataSources.add(this._clipLayer)
        this._clips = []
    }

    /**
     * 创建裁剪区域 坐标中得高度值最好是-得，不然会束在地面上
     * @param {Array} positions 坐标点
     * @param {String} id 裁剪区域id
     * @param {Array} imgs 裁剪区域图片
     * @returns 
     */
    setClip({ positions, id = this.guid(), imgs }) {
        if (!positions || positions.length < 3) {
            return
        }
        const carts = positions.map((i) => this.geoToPro(i))
        console.log(carts)
        // 创建坐标系原点
        const transform = Transforms.eastNorthUpToFixedFrame(carts[0])
        const planes = []
        for (let i = 0; i < positions.length; i++) {
            const p1 = positions[i]
            const p2 = positions[(i + 1)]
            const plane = new ClippingPlane(new Cartesian3(1.0, 0.0, 0.0), 3000.0)
            planes.push(plane)
        }
        this.basemap.scene.globe.clippingPlanes = new ClippingPlaneCollection({
            modelMatrix: Transforms.eastNorthUpToFixedFrame(carts[0]), // 创建坐标系原点
            planes: [
                new ClippingPlane(new Cartesian3(1.0, 0.0, 0.0), 3000.0),
                new ClippingPlane(new Cartesian3(-1.0, 0.0, 0.0), 3000.0),
                new ClippingPlane(new Cartesian3(0.0, 1.0, 0.0), 3000.0),
                new ClippingPlane(new Cartesian3(0.0, -1.0, 0.0), 3000.0),
            ]
        })

        this.basemap.scene.globe.backFaceCulling = false
        this.basemap.scene.globe.showSkirts = false

        // 再cesium地球上绘制一个洞
        // const clip = this._clipLayer.entities.add({
        //     name: id,
        //     polygon: {
        //         hierarchy: new PolygonHierarchy(carts),
        //         material: Color.fromAlpha(Color.BLACK, 0.5),
        //         perPositionHeight: true,
        //         height: 1000,
        //         classificationType: ClassificationType.CESIUM_3D_TILE,
        //     }
        // })
    }
}