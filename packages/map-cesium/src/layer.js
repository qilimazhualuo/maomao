import { CustomDataSource } from 'cesium'
import BaseLayer from './baseLayer'

export default class extends BaseLayer {
    constructor() {
        super(...arguments)
        this.layers = {}
    }

    createLayer = ({ opacity = 1, visible = true, id }) => {
        // 透明度设置之后实现 预计应该是监听当前datasouce的添加事件修改每个entity的透明度属性 感觉不太好搞
        id = id ? id : this.guid()
        const layer = new CustomDataSource(id)
        layer.show = visible
        this.basemap.dataSources.add(layer)
        this.layers[id] = layer
        return id
    }

    setLayerVisible = (layerId, visible) => {
        let layer = this.layers[layerId]
        if (!layer) {
            return { code: 400, msg: '图层不存在' }
        }
        layer.show = visible
        return { code: 200, msg: 'success' }
    }

    clearLayer = (layerId) => {
        let layer = this.layers[layerId]
        if (!layer) {
            return { code: 400, msg: '图层不存在' }
        }
        this.layers[layerId].entities.removeAll()
        return { code: 200, msg: 'success' }
    }
}
