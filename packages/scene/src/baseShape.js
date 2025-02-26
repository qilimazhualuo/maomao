import * as THREE from 'three'
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline'
import Base from './base.js'

export default class BaseShape extends Base {

    // 打组
    addGroup({ meshs, position }) {
        const group = new THREE.Group()
        meshs.forEach((mesh) => {
            group.add(mesh)
        })
        position && group.position.set(position.x, position.y, position.z);
        this.scene.add(group)
        return group
    }

    // 创建点
    addPoint({ color, img, size: scale, opacity = 1, position, zIndex, dynamicSize = true, animate = {} }) {
        const spriteMatreial = new THREE.SpriteMaterial({
            map: img ? new THREE.TextureLoader().load(img) : null,
            color: color || null,
            opacity,
            depthTest: false,
            sizeAttenuation: dynamicSize // 是否不随相机视角改变大小
        })
        const sprite = new THREE.Sprite(spriteMatreial)
        scale && sprite.scale.set(scale, scale, scale)
        position && sprite.position.set(position.x, position.y, position.z);
        this.add(sprite)
        zIndex && (sprite.renderOrder = zIndex)
        if (animate) {
            let sizeCallback
            sprite.callback = () => {
                sizeCallback && sizeCallback()
            }
            const { size } = animate
            if (size) {
                sprite.originSize = sprite.scale
                let curSize = size[0]
                const diff = (size[1] - size[0]) / (size[2] || 60)
                sizeCallback = () => {
                    if (curSize >= size[1]) {
                        curSize = size[0]
                    } else {
                        curSize += diff
                    }
                    sprite.scale.set(scale * curSize, scale * curSize, scale * curSize)
                }
            }
            this.callbacks.push(sprite.callback)
        }
        return sprite
    }

    // 创建线
    // addLine({ color, width, opacity = 1, positions, zIndex, depthTest = true, animate, img }) {
    //     const material = new THREE.LineBasicMaterial({
    //         color: color || null,
    //         opacity,
    //         linewidth: width,
    //         depthTest,
    //         transparent: true,
    //         // depthWrite: true
    //     })
    //     const geometry = new THREE.BufferGeometry().setFromPoints(positions)
    //     const line = new THREE.Line(geometry, material)
    //     if (animate) {
    //         new THREE.TextureLoader().load(img, (texture) => {
    //             texture.offset.y = 0.2
    //             material.map = texture
    //             material.needsUpdate = true
    //             let offset = 0
    //             line.callback = () => {
    //                 offset += animate
    //                 if (offset > 1 || offset < -1) {
    //                     offset = 0
    //                 }
    //                 texture.offset.x = offset
    //             }
    //             this.callbacks.push(line.callback)
    //         })
    //     }
    //     zIndex && (line.renderOrder = zIndex)
    //     this.add(line)
    //     return line
    // }

    addLine({ color, width, opacity = 1, positions, zIndex, depthTest = true, animate, img }) {
        if (positions.length <= 1) {
            return
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(positions)
        const line = new MeshLine()
        line.setGeometry(geometry)
        const length = new THREE.CatmullRomCurve3(positions).getLength()
        const material = new MeshLineMaterial({
            color: color || null,
            opacity,
            // repeat: img ? new THREE.Vector2( 1, length / width ) : undefined,
            lineWidth: width,
            depthTest,
            transparent: true,
        })
        const lineMesh = new THREE.Mesh(line, material)
        this.add(lineMesh)
        return lineMesh
    }

    addText({ id, text, color, backgroundColor, className, fontSize, position, zIndex }) {
        const div = document.createElement('div')
        id && (div.id = id)
        className && (div.className = className)
        div.textContent = text
        color && (div.style.color = color)
        fontSize && (div.style.fontSize = fontSize)
        backgroundColor && (div.style.backgroundColor = backgroundColor)
        const label = new CSS2DObject(div)
        label.position.set(position.x, position.y, position.z);
        label.layers.set(0)
        zIndex && (label.renderOrder = zIndex)
        this.add(label)
        return label
    }

    // 创建平面
    addPlane({ width, height, img, color, doubleDisplay, position, depthTest = true, zIndex, add = true }) {
        const planeGeometry = new THREE.PlaneGeometry(width, height)
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: color || null,
            side: doubleDisplay ? THREE.DoubleSide : THREE.FrontSide, // 是否双面显示
            depthTest, // 深度检测 默认true false时不会遮挡任何物体
            map: img ? new THREE.TextureLoader().load(img) : null,
            transparent: true,
        })
        const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
        position && planeMesh.position.set(position.x, position.y, position.z);
        zIndex && (planeMesh.renderOrder = zIndex)
        // 设置接受阴影
        // planeMesh.receiveShadow = true
        planeMesh.rotateX(-Math.PI / 2)
        add && this.add(planeMesh)
        return planeMesh
    }

    // 根据点数组创建曲面
    addTube({ img, animate, positions, color, radius, opacity = 1, transparent = false, zIndex, depthTest = true }) {
        const startGeometry = new THREE.SphereGeometry(radius, 20, 20)
        const startMaterial = new THREE.MeshLambertMaterial({
            color: color || 0xffffff,
            depthTest,
            transparent,
        })
        const startMesh = new THREE.Mesh(startGeometry, startMaterial)
        startMesh.position.set(positions[0].x, positions[0].y, positions[0].z)
        zIndex && (startMesh.renderOrder = zIndex - 1)
        if (positions.length < 2) {
            this.add(startMesh)
            return startMesh
        }
        const endPoint = positions[positions.length - 1]
        const endMesh = startMesh.clone()
        endMesh.position.set(endPoint.x, endPoint.y, endPoint.z)
        const linePoints = positions.map((item) => {
            return new THREE.Vector3(item.x, item.y, item.z)
        })
        const lineCurve = new THREE.CatmullRomCurve3(linePoints, false, 'catmullrom', 0.01)
        const length = lineCurve.getLength()
        const lineGeometry = new THREE.TubeGeometry(lineCurve, positions.length * 100, radius, 50, false)
        const lineMaterial = new THREE.MeshBasicMaterial({
            color: color || null,
            depthTest,
            transparent,
            opacity
            // map: img ? new THREE.TextureLoader().load(img) : null,
            // side: THREE.DoubleSide
        })
        const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial)
        if (animate) {
            new THREE.TextureLoader().load(img, (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(parseInt(length / 10 / radius), 2)
                lineMaterial.map = texture
                lineMaterial.needsUpdate = true
                let offset = 0
                lineMesh.callback = () => {
                    offset += animate
                    if (offset > 1 || offset < -1) {
                        offset = 0
                    }
                    texture.offset.x = offset
                }
                this.callbacks.push(lineMesh.callback)
            })
        }
        lineMesh.add(startMesh)
        lineMesh.add(endMesh)
        zIndex && (startMesh.renderOrder = zIndex - 1)
        zIndex && (lineMesh.renderOrder = zIndex)
        this.add(lineMesh)
        return lineMesh
    }

    // 添加overLay
    addOverLay({ dom, position, zIndex }) {
        if (dom instanceof String) {
            dom = document.getElementById(dom)
        }
        const content = document.createElement('div')
        content.style.pointerEvents = 'all'
        content.style.position = 'relative'
        content.appendChild(dom)
        const label = new CSS2DObject(content)
        label.position.set(position.x, position.y, position.z);
        label.layers.set(0)
        zIndex && (label.renderOrder = zIndex)
        this.add(label)
        return label
    }
}