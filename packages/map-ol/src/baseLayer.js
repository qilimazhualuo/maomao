import Tile from 'ol/layer/Tile'
import { XYZ } from 'ol/source'
import Meature from './meature'

export default class extends Meature {
    constructor() {
        super(...arguments)
        this.maps = {}
        this.mapNow = 'default'
    }
    loadMap = (mapType = 'gaode') => {
        let mapLayer = null
        let mapMark = ''
        switch (mapType) {
            case 'gaode':
                mapMark = 'gaode'
                mapLayer = new Tile({
                    title: 'gaode',
                    source: new XYZ({
                        url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
                    }),
                })
                break
            case 'tianditu':
                mapMark = 'tianditu'
                mapLayer = new Tile({
                    title: 'tianditu',
                    source: new XYZ({
                        url: 'http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}',
                    }),
                })
                break
            case 'world':
                mapMark = 'world'
                mapLayer = new Tile({
                    title: 'world',
                    source: new XYZ({
                        url: 'https://iserver.supermap.io/iserver/services/map-world/rest/maps/World',
                    }),
                })
                break
            case 'worldNight':
                mapMark = 'worldNight'
                mapLayer = new Tile({
                    title: 'world',
                    source: new XYZ({
                        url: 'https://iserver.supermap.io/iserver/services/map-world/rest/maps/World',
                    }),
                })
            default:
                return
        }
        this.basemap.addLayer(mapLayer)
        this.mapNow = mapMark
        this.maps[mapMark] = mapLayer
        return mapMark
    }

    changeMap = (mapMark) => {
        for (let key in this.maps) {
            if (mapMark === key) {
                this.maps[key].setVisible(true)
            } else {
                this.maps[key].setVisible(false)
            }
        }
    }
}
