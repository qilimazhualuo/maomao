import { UrlTemplateImageryProvider, clone } from 'cesium'
import Meature from './meature'

export default class extends Meature {
    constructor() {
        super(...arguments)
        this.maps = {}
        this.mapNow = 'default'
    }

    loadMap = (mapType = 'gaode', minimumLevel = 1, maximumLevel = 18) => {
        let imageryProvider = null
        let mapMark = ''
        switch (mapType) {
            case 'gaode':
                mapMark = 'gaode'
                imageryProvider = new UrlTemplateImageryProvider({
                    url: 'http://wprd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
                    minimumLevel,
                    maximumLevel,
                    subdomains: ['1', '2', '3', '4']
                })
                break
            case 'gaodeWild':
                mapMark = 'gaode'
                imageryProvider = new UrlTemplateImageryProvider({
                    url: 'http://wprd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}',
                    minimumLevel,
                    maximumLevel,
                    subdomains: ['1', '2', '3', '4']
                })
                break
            case 'tianditu':
                mapMark = 'tianditu'
                imageryProvider = new UrlTemplateImageryProvider({
                    url: 'http://t{s}.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}',
                    minimumLevel,
                    maximumLevel,
                    subdomains: ['1', '2', '3', '4']
                })
                break
            case 'world':
                mapMark = 'world'
                imageryProvider = new UrlTemplateImageryProvider({
                    url: 'https://iserver.supermap.io/iserver/services/map-world/rest/maps/World',
                    minimumLevel,
                    maximumLevel
                })
                break
            case 'worldNight':
                mapMark = 'worldNight'
                imageryProvider = new UrlTemplateImageryProvider({
                    url: 'https://iserver.supermap.io/iserver/services/map-world/rest/maps/World',
                    minimumLevel,
                    maximumLevel
                })
            default:
                return
        }
        const mapLayer = this.basemap.imageryLayers.addImageryProvider(imageryProvider)
        this.mapNow = mapMark
        this.maps[mapMark] = mapLayer
        return mapMark
    }

    changeMap = (mapMark) => {
        for (let key in this.maps) {
            if (mapMark === key) {
                this.maps[key].show = true
            } else {
                this.maps[key].show = false
            }
        }
    }
}
