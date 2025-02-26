import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/addons/controls/TransformControls.js'
// import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js'
// import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
// import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'

export default class Base {
    constructor({ dom, lightIntensity = 2, skybox }) {
        this.dom = dom instanceof HTMLElement ? dom : document.getElementById(dom)
        this.scene = new THREE.Scene()
        initLight(this.scene, lightIntensity)
        this.camera = initCamera(this.scene, 0, 0, 0.1, this.dom)
        this.originFov = this.camera.getFocalLength()
        this.renderer = initRenderer(this.scene, this.camera, '#bfe3dd', this.dom)
        this.controls = this.initControls()
        this.initSkyBox(skybox)
        this.transform = undefined
    }

    add(object) {
        this.scene.add(object)
    }

    delete(object) {
        if (!object) {
            return
        }
        if (object instanceof Array) {
            object.forEach(item => {
                this.delete(item)
            })
            return
        }
        if (object.callback) {
            const idx = this.callbacks.findIndex((callback) => callback === object.callback)
            if (idx !== -1) {
                this.callbacks.splice(idx, 1)
            }
        }
        this.transform && this.transform.dispose()
        this.scene.remove(object)
    }

    // 销毁实例，删除当前场景内容，防止报错
    dispose() {
        this.renderer.clearStencil()
    }

    // 绘制天空盒
    initSkyBox(sky) {
        const loader = new THREE.TextureLoader()
        const texture = loader.load(
            sky || '/img/skyBox/skyBox_cloud.jpg',
            () => {
                const rt = new THREE.WebGLCubeRenderTarget(texture.image.height)
                rt.fromEquirectangularTexture(this.renderer, texture)
                this.scene.background = rt.texture
            }
        )
    }

    // 初始化控制器
    initControls() {
        // 轨道控制器
        const controls = new OrbitControls(this.camera, this.renderer.domElement)
        controls.target.set(0, 0.01, 0)
        controls.update()
        // 控制相机角度垂直向下最大角度45
        // controls.minPolarAngle = Math.PI / 4
        // 控制相机角度垂直最大90 最大水平
        // controls.maxPolarAngle = Math.PI / 2
        return controls
    }

    // 获取相机朝向
    getDirection() {
        const target = new THREE.Vector3()
        return this.camera.getWorldDirection(target)
    }

    // 给模型添加3d控制器
    addTransform({ mesh, callback }) {
        if (!this.transform) {
            this.transform = new TransformControls(this.camera, this.renderer.domElement)
            this.scene.add(this.transform)
            this.transform.addEventListener('change', (event) => {
                // this.controls.enabled = !event.value
                callback && callback({ position: mesh.position })
            })
            this.transform.addEventListener('dragging-changed', (event) => {
                this.controls.enabled = !event.value
            })
        }
        mesh && this.transform.attach(mesh)
        // transform.addEventListener('change', (event) => {})
        return this.transform
    }

    // 移出3d控制器
    removeTransform() {
        this.transform && this.transform.detach()
    }

    // 塞进来
    guid() {
        var S4 = () => {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
        }
        return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
    }
}

// 初始化灯光
const initLight = (scene, lightIntensity) => {
    // 环境光   环境光颜色RGB成分分别和物体材质颜色RGB成分分别相乘
    const ambient = new THREE.AmbientLight(0x404040, 2)
    scene.add(ambient) // 环境光对象添加到scene场景中

    // // 方向光 光强度设置2倍
    const directionalLight = new THREE.DirectionalLight(0xffffff, lightIntensity)
    // 设置光源位置
    directionalLight.position.set(200, 100, 100)
    scene.add(directionalLight)
    // 设置用于计算阴影的光源对象
    directionalLight.castShadow = true
    // 设置计算阴影的区域，最好刚好紧密包围在对象周围
    // 计算阴影的区域过大：模糊  过小：看不到或显示不完整
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 300
    directionalLight.shadow.camera.left = -50
    directionalLight.shadow.camera.right = 50
    directionalLight.shadow.camera.top = 200
    directionalLight.shadow.camera.bottom = -100
    directionalLight.shadow.mapSize.width = 2048 // 阴影的贴图的大小 直接关系阴影的质量
    directionalLight.shadow.mapSize.height = 2048 // 阴影的贴图的大小 直接关系阴影的质量
}

// 初始化摄像机
const initCamera = (scene, x, y, z, dom) => {
    const { clientWidth, clientHeight } = dom
    const k = clientWidth / clientHeight // 窗口宽高比
    // let s = 200 //三维场景显示范围控制系数，系数越大，显示的范围越大
    // camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000000);
    const camera = new THREE.PerspectiveCamera(45, k, 1, 200000)
    camera.position.set(x, y, z) // 设置相机位置
    camera.lookAt(scene.position) // 设置相机方向(指向的场景对象)
    camera.receiveShadow = true
    // 设置z轴朝上
    camera.up.z = 1
    camera.up.x = 0
    camera.up.y = 0
    scene.add(camera)
    return camera
}

// 初始化render
const initRenderer = (scene, camera, color, dom) => {
    const renderer = new THREE.WebGLRenderer({
        antialias: true, // 开启抗锯齿
        alpha: true // 开启背景透明
    })
    // 处理因屏幕缩放导致的场景模糊
    renderer.setPixelRatio(window.devicePixelRatio)
    const { clientWidth, clientHeight } = dom
    renderer.setSize(clientWidth, clientHeight) // 设置渲染区域尺寸
    renderer.setClearColor(color, 1) // 设置背景颜色
    renderer.shadowMap.enabled = true // 设置渲染器，允许场景中使用阴影贴图
    dom.appendChild(renderer.domElement) // 插入canvas对象
    renderer.render(scene, camera)
    return renderer
}