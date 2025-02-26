import { getPoint } from './funcs/baseFun'
import Base from './base'

export default class extends Base {
    constructor() {
        super(...arguments)
        this.points = {}
    }

    createPoint = (options, layerId) => {
        // 拿到source
        let { longitude, latitude, id = this.guid() } = options
        let datasource = this.layers[layerId]
        if (!datasource) {
            return { code: 1, msg: '图层不存在，请先创建图层' }
        }
        const obj = {
            position: this.geoToPro([longitude, latitude]),
            ...options
        }
        datasource.entities.add(getPoint.apply(this, obj))
        this.points[layerId] ? this.points[layerId].push(options) : (this.points[layerId] = [options])
        return { code: 0, data: id }
    }

    createLine = ({ data, style = {}, layerId, goView }) => {
        const layer = this.layers[layerId]
        if (!layer) {
            return { code: 1, msg: '图层不存在，请先创建图层' }
        }
        const id = this.guid()
        const source = layer.getSource()
        const geometry = new LineString(data.map((i) => this.geoToPro(i)))
        const feature = new Feature({
            id,
            geometry,
        })
        const { width = 4, color = '#00ff00' } = style
        feature.setStyle(
            new Style({
                stroke: new Stroke({
                    width: width,
                    color: color,
                }),
            })
        )
        source.addFeature(feature)
        goView && this.basemap.getView().fit(geometry.getExtent())
    }
}
