import * as THREE from 'three'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import fontjson from 'three/examples/fonts/gentilis_regular.typeface.json'
import BaseShape from './baseShape.js'

const fontLoader = new FontLoader()
const font = fontLoader.parse(fontjson)
export default class Shape extends BaseShape {
    constructor({ dom, lightIntensity, skybox }) {
        super({ dom, lightIntensity, skybox })
    }

    /**
     * 添加圆锥
     * @param {Number} radius 半径
     * @param {Number} height 高
     * @param {Number} radialSegments 侧面分段
     * @param {Number} heightSegments 高度分段
     * @param {Boolean} openEnded 是否封闭
     * @param {String} color 颜色
     * @param {Number} zIndex 层级
     * @returns Three.ConeGeometry
     */
    addCone({ radius, height, radialSegments, heightSegments, openEnded, color, zIndex, position, rotation }) {
        const geometry = new THREE.ConeGeometry(radius, height, radialSegments, heightSegments, openEnded)
        const material = new THREE.MeshLambertMaterial({ color })
        const mesh = new THREE.Mesh(geometry, material)
        if (zIndex) {
            mesh.renderOrder = zIndex
        }
        if (position) {
            mesh.position.x = position.x
            mesh.position.y = position.y
            mesh.position.z = position.z
        }
        if (rotation) {
            rotation.x && (mesh.rotation.x = rotation.x)
            rotation.y && (mesh.rotation.y = rotation.y)
            rotation.z && (mesh.rotation.z = rotation.z)
        }
        this.add(mesh)
        return mesh
    }

    /**
     * 添加文字
     * @param {String} text 文字
     * @param {String} color 颜色
     * @param {Number} size 大小
     * @param {Number} height 高度
     * @param {Object} position 位置
     * @returns 
     */
    addMeshText({ text, color, size, height, position }) {
        const textxGeometry = new TextGeometry(text, {
            font,
            size,
            height,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.008,
            bevelSegments: 1
        })
        const material = new THREE.MeshLambertMaterial({ color })
        const mesh = new THREE.Mesh(textxGeometry, material)
        position && mesh.position.set(position.x, position.y, position.z)
        mesh.rotation.y = Math.PI / 2
        // 把mesh的轴心放在物体中心
        this.add(mesh)
        return mesh
    }

    /**
     * 创建盒子
     * @param {Number} width 宽
     * @param {Number} height 高
     * @param {Number} depth 深度
     * @param {String} color 颜色
     * @param {Object} position 位置
     * @param {Number} zIndex 层级
     * @returns 
     */
    addBox({ width, height, depth, color, position, zIndex }) {
        const boxGeometry = new THREE.BoxGeometry(width, height, depth)
        const boxMaterial = new THREE.MeshPhongMaterial({
            color: color,
            side: THREE.DoubleSide,
            // depthWrite: false // 深层检楋
        })
        const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
        position && mesh.position.set(position.x, position.y, position.z)
        if (zIndex) {
            mesh.renderOrder = zIndex
        }
        // 设置接受阿尔法
        mesh.receiveShadow = true
        this.add(mesh)
        return mesh
    }

    /**
     * 创建平面
     * @returns
     */
    addPlane({ width, height, color, position, zIndex }) {
        const planeGeometry = new THREE.PlaneGeometry(width, height)
        const planeMaterial = new THREE.MeshLambertMaterial({
            color: color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        })
        const mesh = new THREE.Mesh(planeGeometry, planeMaterial)
        position && mesh.position.set(position.x, position.y, position.z)
        if (zIndex) {
            mesh.renderOrder = zIndex
        }
        this.add(mesh)
        return mesh
    }
}