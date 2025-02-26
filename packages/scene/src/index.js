import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js'

import Shape from './shape.js'

const mouseTypes = ['click', 'mousemove']
const selefFunType = ['animationFinish']

const pointer = new THREE.Vector2()
let raycaster = new THREE.Raycaster()
let clock = new THREE.Clock()

export default class Scene extends Shape {
    constructor({ dom, lightIntensity, skybox }) {
        super({ dom, lightIntensity, skybox })
        this.active = true
        this.mouseEvents = {}
        this.updateCamera = undefined
        this.mixers = []
        this.gltfLoader = new GLTFLoader()

        // 用作含有动画的多边形
        this.animateMeshs = []

        // 动画结束的回调函数
        this.animationFinish = []

        // 骨骼动画
        this.actions = {}

        // 路径动画
        this.animateWays = []
        this.resizeFunc = () => this.onWindowResize()
        window.addEventListener('resize', this.resizeFunc)

        // 更新回调函数 animate中循环调用
        this.callbacks = []

        // 添加overlay
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(this.dom.clientWidth, this.dom.clientHeight)
        this.labelRenderer.domElement.style.position = 'absolute'
        this.labelRenderer.domElement.style.top = '0px'
        // this.labelRenderer.domElement.style.touchAction = 'none'
        this.labelRenderer.domElement.style.pointerEvents = 'none'
        this.dom.appendChild(this.labelRenderer.domElement)

        // 循环渲染
        this.animate()
    }

    onWindowResize() {
        if (!this.dom) {
            return
        }
        const { clientWidth, clientHeight } = this.dom
        this.camera.aspect = clientWidth / clientHeight
        // 更新相机投影矩阵
        this.camera.updateProjectionMatrix()
        // 更新设置渲染器渲染范围
        this.renderer.setSize(clientWidth, clientHeight)
        // 更新overlay
        this.labelRenderer.setSize(clientWidth, clientHeight)
    }

    addGltf({ url, goView, animate, noAdd, id }) {
        return new Promise((resolve) => {
            this.gltfLoader.load(url, (gltf) => {
                const group = gltf.scene
                if (noAdd) {
                    resolve(gltf)
                    return
                }
                this.add(group)
                // 加上阴影
                group.traverse((object) => {
                    object.isMesh && (object.castShadow = true)
                })
                if (goView) {
                    const radius = this.getRadiusByGroup(group)
                    this.goView(group.position, radius * 2)
                }
                let action
                if (animate) {
                    const { num } = animate
                    // 骨骼
                    const skeleton = new THREE.SkeletonHelper(group)
                    skeleton.visible = false
                    this.add(skeleton)
                    // 动画
                    const animations = gltf.animations
                    const mixer = new THREE.AnimationMixer(group)
                    // 进行哪个动作由函数传入
                    action = mixer.clipAction(animations[num || 0])
                    action.play()
                    this.mixers.push(mixer)
                }
                id = id || this.guid()
                resolve({ gltf, id, action })
            })
        })
    }

    addObj({ url, mtlUrl, goView, animate, noAdd, depthTest, zIndex }) {
        return new Promise((resolve) => {
            // 先加载材质
            const mtlLoader = new MTLLoader()
            mtlLoader.load(mtlUrl, (materials) => {
                materials.preload()
                if (depthTest !== undefined) {
                    for (const key in materials.materials) {
                        materials.materials[key].transparent = true
                        materials.materials[key].depthTest = depthTest
                    }
                }
                materials.depthTest = depthTest
                const objLoader = new OBJLoader()
                objLoader.setMaterials(materials)
                objLoader.load(url, (object) => {
                    zIndex && (object.renderOrder = zIndex)
                    if (noAdd) {
                        resolve(object)
                        return
                    }
                    this.add(object)
                    if (goView) {
                        const radius = this.getRadiusByGroup(object)
                        this.goView(object.position, radius * 2)
                    }
                    if (animate) {
                        const { num } = animate
                        const mixer = new THREE.AnimationMixer(object)
                        const action = mixer.clipAction(object.animations[num || 0])
                        action.play()
                        this.mixers.push(mixer)
                    }
                    // 旋转至y轴向上
                    object.rotateX(-Math.PI / 2)
                    resolve(object)
                })
            })
        })
    }

    // 从group获取所有mesh
    getAllMeshs(group) {
        const meshs = []
        group.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                meshs.push(object)
            }
        })
        return meshs
    }

    // group参数也可以是mesh
    changeStyle({ group, color, opacity, depthTest }) {
        const changeMetraial = (mesh) => {
            // 避免该材质与其他人公用引起同步修改
            if (mesh.material instanceof Array) {
                const materials = mesh.material.map(i => i.clone())
                materials.forEach((material) => {
                    if (depthTest !== undefined) {
                        material.depthTest = depthTest
                    }
                    if (typeof opacity === 'number') {
                        material.transparent = true
                        material.opacity = opacity
                    }
                    if (color) {
                        material.color = color
                    }
                })
                mesh.material = materials
            } else {
                const material = mesh.material.clone()
                if (depthTest !== undefined) {
                    material.depthTest = depthTest
                }
                if (typeof opacity === 'number') {
                    material.transparent = true
                    material.opacity = opacity
                }
                if (color) {
                    material.color = color
                }
                mesh.material = material
            }
        }
        if (group.isMesh) {
            changeMetraial(group)
        } else if (group.isGroup) {
            group.children.forEach((mesh) => {
                mesh.isMesh && (mesh.castShadow = true)
                if (mesh.isMesh) {
                    changeMetraial(mesh)
                } else if (mesh.isGroup) {
                    this.changeStyle({ group: mesh, color, opacity, depthTest })
                }
            })
        } else if (group instanceof Array) {
            group.forEach((mesh) => {
                this.changeStyle({ group: mesh, color, opacity, depthTest })
            })
        }
    }

    remove(mesh) {
        mesh.geometry.dispose()
        mesh.material.dispose()
        this.scene.remove(mesh)
        const idx = this.animateMeshs.indexOf(mesh)
        if (idx !== -1) {
            this.animateMeshs.splice(idx, 1)
        }
    }

    getRadiusByGroup(group) {
        const box = new THREE.Box3().setFromObject(group)
        const { min, max } = box
        const diffX = max.x - min.x
        const diffY = max.y - min.y
        const diffZ = max.z - min.z
        const radius = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2) + Math.pow(diffZ, 2))
        return radius
    }

    // group参数也可以是mesh
    goView(position, offset) {
        this.updateCamera = makeCamAni(position, offset, 40, this.camera, this.controls)
    }

    resetControl(position) {
        this.controls.target.set(position || { x: 0, y: 0, z: 0 })
    }

    // 路径动画 group参数也可以是mesh
    animateMeshByWays({ id, mesh, ways, showWay, speend, closed = true, loop = true, endCallback }) {
        id = id || this.guid()
        const curve = new THREE.CatmullRomCurve3(
            ways.map(i => new THREE.Vector3(i.x, i.y, i.z)),
            closed, // 曲线是否闭合
            'catmullrom', // 曲线类型
            0 // 曲线张力 弯曲程度
        )
        let line, color
        if (showWay) {
            const { depthTest = true, transparent = false, zIndex, width } = showWay
            color = showWay.color || 0x0000ff
            const points = curve.getPoints(ways.length * 5)
            line = new THREE[closed ? 'LineLoop' : 'Line'](
                new THREE.BufferGeometry().setFromPoints(points),
                new THREE.LineBasicMaterial({
                    color,
                    depthTest,
                    transparent,
                    linewidth: width
                })
            )
            zIndex && (line.renderOrder = zIndex)
            this.add(line)
        }
        this.animateWays.push({
            originPoision: JSON.parse(JSON.stringify(mesh.position)),
            mesh,
            curve,
            line,
            lineColor: color,
            speend,
            progress: 0,
            id,
            stop: false,
            closed,
            loop,
            endCallback
        })
        return { id }
    }

    // 更新路径动画
    updateAnimateWays({ id, ways, showWay, speed, stop, closed, loop, endCallback }) {
        const config = this.animateWays.find(i => i.id === id)
        if (!config) {
            return
        }
        let { originPoision, mesh, line, lineColor, closed: closedTemp } = config
        if (closed !== undefined) {
            closedTemp = closed
            config.closed = closed
        }
        loop !== undefined && (config.loop = loop)
        endCallback instanceof Function && (config.endCallback = endCallback)
        speed !== undefined && (config.speed = speed)
        // stop !== undefined && (config.stop = stop)
        if (ways) {
            // 更新曲线及显示的线
            const curve = new THREE.CatmullRomCurve3(
                ways.map(i => new THREE.Vector3(i.x, i.y, i.z)),
                closedTemp, // 曲线是否闭合
                'catmullrom', // 曲线类型
                0 // 曲线张力 弯曲程度
            )
            config.curve = curve
            if (line && showWay) {
                this.remove(line)
                const points = curve.getPoints(ways.length * 5)
                const { depthTest = true, transparent = false, zIndex, width, color = lineColor } = showWay
                line = new THREE[closedTemp ? 'LineLoop' : 'Line'](
                    new THREE.BufferGeometry().setFromPoints(points),
                    new THREE.LineBasicMaterial({
                        color,
                        depthTest,
                        transparent,
                        linewidth: width
                    })
                )
                zIndex && (line.renderOrder = zIndex)
                this.add(line)
                config.line = line
                config.lineColor = lineColor
            }
        }
        if (stop !== undefined) {
            if (stop instanceof Object) {
                const { action, backToOrigin, hiddenWay, resetProgress } = stop
                config.stop = !action
                resetProgress && (config.progress = 0)
                if (action === false) {
                    hiddenWay && (line.visible = false)
                    backToOrigin && mesh.position.set(originPoision.x, originPoision.y, originPoision.z)
                } else {
                    line && (line.visible = true)
                }
            } else {
                config.stop = stop
            }
        }
    }

    removeAnimateWays(id) {
        const idx = this.animateWays.findIndex(i => i.id === id)
        if (idx !== -1) {
            const { line, mesh, originPoision } = this.animateWays[idx]
            // 删除线 恢复模型原始位置
            this.remove(line)
            mesh.position.set(originPoision.x, originPoision.y, originPoision.z)
        }
    }

    // group参数也可以是mesh
    updateMesh(group, goView, ways) {
        if (ways) {
            group.targetWays = ways
        }
        this.animateMeshs.push(group)
        if (goView) {
            const radius = this.getRadiusByGroup(group)
            const position = {
                x: group.targetX || group.position.x,
                y: group.targetY || group.position.y,
                z: group.targetZ || group.position.z
            }
            this.goView(position, radius)
        }
    }

    /**
     * 添加事件
     * @param {String} type 事件类型 html标签事件名称相同
     * @param {Function} cb 事件回调函数
     * @param {String} id 事件id 用于取消事件 可不传 同返回id
     * @param {Array[]THREE.Mesh} meshs 点击作用于的多边形 可不传（不传时默认为场景内所有多边形）
     * @returns {String} id 事件id
     */
    on({ type, cb, id, meshs }) {
        if (selefFunType.includes(type) && typeof cb === 'function') {
            if (type === 'animationFinish') {
                this.animationFinish.push(cb)
            }
        }
        if (!mouseTypes.includes(type) || typeof cb !== 'function') {
            return
        }
        id = id || this.guid()
        let clickObj
        if (type === 'click') {
            // 点击事件特殊处理 其他的暂时不写
            clickObj = {
                x: 0,
                y: 0,
                type: 'click',
                event: [
                    (event) => {
                        this.x = event.clientX
                        this.y = event.clientY
                    },
                    (event) => {
                        if (this.x !== event.clientX || this.y !== event.clientY) {
                            return
                        }
                        // 如果没有传需要查询点击的多边形集那就获取当前场景所有的多边形网格
                        let meshsTemp = meshs
                        if (!meshsTemp) {
                            meshsTemp = []
                            this.scene.traverse((object) => {
                                if (object instanceof THREE.Mesh || object instanceof THREE.Sprite) {
                                    if (!object._isVrPlane) {
                                        meshsTemp.push(object)
                                    }
                                }
                            })
                        }
                        const rect = this.dom.getBoundingClientRect()
                        const { clientWidth, clientHeight } = this.dom
                        pointer.x = ((event.clientX - rect.left) / clientWidth) * 2 - 1
                        pointer.y = -((event.clientY - rect.top) / clientHeight) * 2 + 1
                        raycaster.setFromCamera(pointer, this.camera)
                        const intersects = raycaster.intersectObjects(meshsTemp, true)
                        if (intersects.length > 0) {
                            cb({
                                mesh: intersects[0].object,
                                meshs: intersects.map(i => i.object),
                                position: intersects[0].object.position,
                                targetPosition: intersects[0].point
                            })
                        }
                    }
                ]
            }
            this.mouseEvents[id] = clickObj
            this.dom.addEventListener('mousedown', clickObj.event[0])
            this.dom.addEventListener('mouseup', clickObj.event[1])
            return id
        }
        clickObj = {
            type,
            event: [(event) => {
                const rect = this.dom.getBoundingClientRect()
                const { clientWidth, clientHeight } = this.dom
                pointer.x = ((event.clientX - rect.left) / clientWidth) * 2 - 1
                pointer.y = -((event.clientY - rect.top) / clientHeight) * 2 + 1
                raycaster.setFromCamera(pointer, this.camera)
                // 如果没有传需要查询点击的多边形集那就获取当前场景所有的多边形网格
                let meshsTemp = meshs
                if (!meshsTemp) {
                    meshsTemp = []
                    this.scene.traverse((object) => {
                        if (object instanceof THREE.Mesh || object instanceof THREE.Sprite) {
                            if (!object._isVrPlane) {
                                meshsTemp.push(object)
                            }
                        }
                    })
                }
                const intersects = raycaster.intersectObjects(meshsTemp, true)
                if (intersects.length > 0 && meshs) {
                    cb({
                        mesh: intersects[0].object,
                        meshs: intersects.map(i => i.object),
                        position: intersects[0].object.position
                    })
                    return
                }
                if (intersects.length > 0) {
                    cb({
                        mesh: intersects[0].object,
                        meshs: intersects.map(i => i.object),
                        position: intersects[0].object.position
                    })
                } else {
                    cb({
                        mesh: null,
                        meshs: [],
                        position: null
                    })
                }
            }]
        }
        this.mouseEvents[id] = clickObj
        this.dom.addEventListener(type, clickObj.event[0])
        return id
    }

    // 解除鼠标事件
    un(id) {
        const clickObj = this.mouseEvents[id]
        if (!clickObj) {
            return
        }
        if (clickObj.type === 'click') {
            this.dom.removeEventListener('mousedown', clickObj.event[0])
            this.dom.removeEventListener('mouseup', clickObj.event[1])
            return
        }
        this.dom.removeEventListener(clickObj.type, clickObj.event[0])
    }

    updateCam() {
        const { idx, arrs } = this.updateCamera
        const { target, position } = arrs[idx]
        if (target.x !== position.x || target.y !== position.y || target.z !== position.z) {
            // 摄像机位置和视野中心相同的话就控制不了了 不允许这样设置
            this.camera.position.x = position.x
            this.camera.position.y = position.y
            this.camera.position.z = position.z
            this.controls.target.set(target.x, target.y, target.z)
        }
        this.updateCamera.idx += 1
        this.updateCamera.idx === arrs.length && (this.updateCamera = undefined)
    }

    dispose() {
        this.active = false
        this.scene.traverse((child) => {
            if (child.material) {
                if (child.material instanceof Array) {
                    child.material.forEach((material) => {
                        material.dispose()
                    })
                } else {
                    child.material.dispose()
                }
            }
            if (child.geometry) {
                child.geometry.dispose()
            }
            child.dispose && child.dispose()
            child = null
        })
        this.renderer.forceContextLoss()
        this.renderer.dispose()
        this.scene.clear()
        this.dom.removeChild(this.labelRenderer.domElement)
        this.flows = []
        this.scene = null
        this.camera = null
        this.controls = null
        this.renderer.domElement = null
        this.renderer = null
        this.sceneDomElement = null
        this.mixers = []
        this.animateMeshs = []
        this.animationFinish = []
        this.animateWays = []
        window.removeEventListener('resize', this.resizeFunc)
        for (const key in this.mouseEvents) {
            this.un(key)
        }
        this.dom.innerHTML = ''
        delete this
    }

    animate() {
        if (!this.active) {
            return
        }
        // TODO 适配高刷屏幕（最好高刷我也最大60帧）animate 的参数为当前时间
        requestAnimationFrame(() => this.animate())
        this.mixers.length > 0 && updateMixer(this.mixers)
        this.animateMeshs.length !== 0 && (this.animateMeshs = moveMesh(this.animateMeshs, this.animationFinish))
        this.updateCamera && this.updateCam()
        this.callbacks && this.callbacks.forEach((callback) => callback())
        this.renderer.render(this.scene, this.camera)
        this.labelRenderer.render(this.scene, this.camera)
        this.controls.update(clock.getDelta())
        this.animateWays.length > 0 && animateMesh(this.animateWays)
    }
}

// 制作相机动画帧 length多少帧到达目标地点 每秒60帧这里是帧数
const makeCamAni = (target, offset, length, camera, controls) => {
    const position = JSON.parse(JSON.stringify(target))
    position.x += offset
    position.y += offset * 0.7
    const oriPoi = camera.position
    const oriTar = controls.target
    const xTarSec = (target.x - oriTar.x) / length
    const yTarSec = (target.y - oriTar.y) / length
    const zTarSec = (target.z - oriTar.z) / length
    const xPoiSec = (position.x - oriPoi.x) / length
    const yPoiSec = (position.y - oriPoi.y) / length
    const zPoiSec = (position.z - oriPoi.z) / length
    const arrs = []
    for (let i = 1; i <= length; i++) {
        arrs.push({
            position: { x: oriPoi.x + xPoiSec * i, y: oriPoi.y + yPoiSec * i, z: oriPoi.z + zPoiSec * i },
            target: { x: oriTar.x + xTarSec * i, y: oriTar.y + yTarSec * i, z: oriTar.z + zTarSec * i }
        })
    }
    return { idx: 0, arrs }
}

// 按帧移动多边形
const moveMesh = (meshs, callbacks) => {
    return meshs.filter((mesh) => {
        const { targetX, rotateDiff } = mesh
        let finish = true
        if (targetX) {
            const diff = targetX - mesh.position.x
            if (Math.abs(diff) <= 1) {
                mesh.position.x = targetX
                callbacks.forEach((fun) => {
                    setTimeout(() => {
                        fun(mesh)
                    })
                })
            } else {
                mesh.position.x += diff / Math.abs(diff)
                finish = false
            }
        }
        if (rotateDiff) {
            mesh.rotation.y += rotateDiff
            finish = false
        }
        return !finish
        // 缩放暂时不写
        // if (scale) {
        // }
    })
}

// 更新动画
const updateMixer = (mixers) => {
    const mixerUpdateDelta = clock.getDelta()
    mixers.forEach((mixer) => {
        mixer.update(mixerUpdateDelta)
    })
}

const animateMesh = (animations) => {
    animations.forEach((config) => {
        const { mesh, curve, speend, progress, stop, loop, endCallback } = config
        if (stop) {
            return
        }
        const length = curve.getLength()
        const diff = speend / length
        if (progress <= 1 - diff) {
            // const point = curve.getPointAt(progress)
            // const pointDir = curve.getPointAt(progress + speend)
            // if (point && pointDir) {
            //     mesh.position.set(point.x, point.y, point.z)
            //     // y轴 竖轴朝向不修改
            //     mesh.lookAt(pointDir.x, point.y, pointDir.z)
            // }
            // config.progress += speend
            // const length = curve.getLength()
            // const diff = speend / length
            const point = curve.getPointAt(progress)
            const pointDir = curve.getPointAt(progress + diff)
            if (point && pointDir) {
                mesh.position.set(point.x, point.y, point.z)
                // y轴 竖轴朝向不修改
                mesh.lookAt(pointDir.x, point.y, pointDir.z)
            }
            config.progress += diff
        } else {
            if (loop) {
                config.progress = 0
            } else {
                config.progress = 1
                config.stop = true
                endCallback && endCallback()
            }
        }
    })
}