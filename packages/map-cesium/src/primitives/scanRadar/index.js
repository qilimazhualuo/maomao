import {
    Pass,
    RenderState,
    WebGLConstants,
    defaultValue,
    BoundingSphere,
    Ellipsoid,
    Math as CesiumMath,
    Cartesian3,
    Matrix4,
    Matrix3,
    Transforms,
    getTimestamp,
    HeadingPitchRoll,
    OrientedBoundingBox
} from 'cesium'

import {
    createBodyGeometry,
    createFaceGeometry,
    createGridGeometry,
    createBoderGeometry,
    createVert1Geometry,
    createHori1Geometry,
    createHori2Geometry,
    createVert2Geometry
} from './createDrawCommand.js'

function updateVisibleAngle(primitive) {
    const t = Ellipsoid.WGS84.cartesianToCartographic(primitive._camPosition)
    const i = Cartesian3.magnitude(primitive._camPosition)
    const n = i - t.height
    primitive._visibleAngle = Math.acos(n / i)
}

export default class ScanRadarPrimitive {
    constructor(optinos = {}) {
        this._pass = Pass.TRANSLUCENT

        this._renderState = new RenderState()
        this._renderState.depthTest.enabled = true

        this._renderState.blending.enabled = true
        this._renderState.blending.functionSourceRgb = WebGLConstants.SRC_ALPHA
        this._renderState.blending.functionDestinationRgb = WebGLConstants.ONE_MINUS_SRC_ALPHA

        this._visibleAngle = 2 * Math.PI
        this._position = defaultValue(optinos.position, [-120.3, 40.5, 100])

        this._hStep = defaultValue(optinos.hStep, 1)
        this._vStep = defaultValue(optinos.vStep, 1)
        this._radius = defaultValue(optinos.radius, 1e6)
        // 垂直角度
        this._angleVert = defaultValue(optinos.angleVert, 30)
        // 水平角度
        this._angleHori = defaultValue(optinos.angleHori, 60)
        // 顶面颜色
        this._color = defaultValue(optinos.color, 'rgba(255,255,0,0.5)')
        // 扫描颜色
        this._scanColor = defaultValue(optinos.scanColor, 'rgba(0,110,110,0.5)')
        // 分不清
        this._scanFaceColor = defaultValue(optinos.scanFaceColor, 'rgba(0,255,110,0.5)')
        this._centerColor = defaultValue(optinos.centerColor, 'rgba(0,0,255,0.5)')
        this._borderColor = defaultValue(optinos.borderColor, 'rgba(255,0,0,1.0)')
        this._griderColor = defaultValue(optinos.griderColor, 'rgba(255,0,0,1.0)')

        this._gridFlag = defaultValue(optinos.gridFlag, true)
        this._borderFlag = defaultValue(optinos.borderFlag, true)

        this._speed = defaultValue(optinos.speed, 2)
        this._speedVert = defaultValue(optinos.speed, 2)
        this._speedHori = defaultValue(optinos.speed, 2)

        this._scanActive = defaultValue(optinos.scanActive, true)
        this._horiActive = defaultValue(optinos.horizontal, true)
        this._vertActive = defaultValue(optinos.vertical, true)

        this.scanStepVert = this._angleVert / this._speedVert
        this.scanStepHori = this._angleHori / this._speedHori

        this.scanAngleHori = 0
        this.scanAngleVert = 15

        this.scanHoriFlag = false
        this.scanVertFlag = false

        this._isGeometryCreate = false

        this.heading = defaultValue(optinos.heading, 0)
        this.pitch = defaultValue(optinos.pitch, 0)
        this.roll = defaultValue(optinos.roll, 0)
        this.scale = defaultValue(optinos.scale, 1)

        this.scanFlag = false
        this._boundingSphere = new BoundingSphere(
            Cartesian3.fromDegrees(...this._position),
            this._radius
        )

        const center = Cartesian3.fromDegrees(...this._position)
        const halfAxes = Matrix3.fromScale(Cartesian3.fromDegrees(...this._position), new Matrix3())
        this.obb = new OrientedBoundingBox(center, halfAxes)

        this._times = 0
        this.lastTime = null
    }

    get radius() {
        return this._radius
    }

    get centerColor() {
        return this._centerColor
    }

    get color() {
        return this._color
    }

    get boundingSphere() {
        return this._boundingSphere
    }

    updateModelMatrix(pos) {
        const hpr = new HeadingPitchRoll(
            CesiumMath.toRadians(this.heading),
            CesiumMath.toRadians(this.pitch),
            CesiumMath.toRadians(this.roll)
        )
        const rotation = Matrix3.fromHeadingPitchRoll(hpr, new Matrix3())
        const scale = Matrix3.fromScale(new Cartesian3(this.scale, this.scale, this.scale))

        this._commonModelMatrix = Matrix4.multiplyByMatrix3(
            Transforms.eastNorthUpToFixedFrame(pos),
            Matrix3.multiply(rotation, scale, new Matrix3()),
            new Matrix4()
        )

        const p = getTimestamp()

        if (this.scanFlag) {
            this.scanAngleVert += ((p - this.lastTime) * this.scanStepVert) / 1e3

            if (this.scanAngleVert > this._angleVert) {
                this.scanAngleVert = this._angleVert
                this.scanStepVert *= -1
                this._times += 1
                if (this._times === 2) {
                    this._times = 0
                    this.scanFlag = !this.scanFlag
                }
            }

            if (this.scanAngleVert < 0) {
                this.scanAngleVert = 0
                this.scanStepVert *= -1
            }
        } else {
            this.scanAngleHori += ((p - this.lastTime) * this.scanStepHori) / 1e3

            if (this.scanAngleHori > this._angleHori / 2) {
                this.scanAngleHori = this._angleHori / 2
                this.scanStepHori *= -1
                this._times += 1
                if (this._times === 2) {
                    this._times = 0
                    this.scanFlag = !this.scanFlag
                }
            }

            if (this.scanAngleHori < -this._angleHori / 2) {
                this.scanAngleHori = -this._angleHori / 2
                this.scanStepHori *= -1
            }
            var f = Matrix3.fromRotationZ(CesiumMath.toRadians(this.scanAngleHori), new Matrix3())
            var d = Matrix4.multiplyByMatrix3(this._commonModelMatrix, f, new Matrix4())
            this.horiModelMatrix = d
        }

        this.lastTime = p
    }

    update(frameState) {
        if (this.lastTime === null) {
            this.lastTime = getTimestamp()
            return
        }

        this._camPosition = frameState.camera.position
        updateVisibleAngle(this)

        const pos = Cartesian3.fromDegrees(this._position[0], this._position[1], this._position[2])

        this.updateModelMatrix(pos)

        createBodyGeometry(frameState, this)
        createFaceGeometry(frameState, this)
        createGridGeometry(frameState, this)
        createBoderGeometry(frameState, this)

        // 水平扫面面
        createVert1Geometry(frameState, this)
        createVert2Geometry(frameState, this)

        // 垂直扫描面
        createHori1Geometry(frameState, this)
        createHori2Geometry(frameState, this)
        this._isGeometryCreate = true

        frameState.commandList.push(this.bodyDrawCommand)
        frameState.commandList.push(this.faceDrawCommand)

        if (this._gridFlag) {
            frameState.commandList.push(this.gridDrawCommand)
        }

        if (this._borderFlag) {
            frameState.commandList.push(this.boderDrawCommand)
        }

        if (this._vertActive && this.scanFlag) {
            this.scanVertFlag = !0
            frameState.commandList.push(this.vert1DrawCommand)
            frameState.commandList.push(this.vert2DrawCommand)
        }

        if (this._horiActive && !this.scanFlag) {
            this.scanVertFlag = !0
            frameState.commandList.push(this.hori1DrawCommand)
            frameState.commandList.push(this.hori2DrawCommand)
        }
    }

    isDestroyed() {
        return false
    }
}
