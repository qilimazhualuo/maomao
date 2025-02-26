export class Overlay {
    constructor({ dom, position, content, allWaysShow }) {
        dom = dom instanceof HTMLElement ? dom : document.getElementById(dom)
        dom.parentElement && dom.parentElement.removeChild(dom)

        const container = document.createElement('div')
        container.style.position = 'absolute'
        container.style.top = 0
        container.style.left = 0
        container.style.zIndex = 1
        container.append(dom)
        content.append(container)

        this.dom = container
        this.position = position ? this.WGS84_to_Cartesian3(position) : null
        this.prePosition = position ? this.WGS84_to_Cartesian3(position) : null
        this.allWaysShow = allWaysShow
    }
    setPosition(position) {
        this.position = this.WGS84_to_Cartesian3(position)
        if (!position) {
            this.dom.style.display = 'none'
        } else {
            this.dom.style.display = 'block'
        }
    }
}
