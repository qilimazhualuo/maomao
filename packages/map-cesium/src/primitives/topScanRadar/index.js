import {
    Cartesian3,
    Geometry,
    GeometryAttribute,
    ComponentDatatype,
    PrimitiveType,
    BoundingSphere,
    Primitive,
    MaterialAppearance,
    Material,
    GeometryInstance,
    Transforms,
    Color,
    EllipseGeometry,
    Math as CesiumMath,
    VertexFormat,
    EllipsoidSurfaceAppearance,
    BoxGeometry,
    GeometryAttributes,
    VertexArray,
    PerInstanceColorAppearance,
    ColorGeometryInstanceAttribute,
    Matrix4,
    Pass,
    RenderState,
    WebGLConstants,
    defaultValue,
    Ellipsoid,
    Matrix3,
    getTimestamp,
    HeadingPitchRoll,
    OrientedBoundingBox
} from 'cesium'

export default class TopScanRadarPrimitive {
    constructor({
        position,
        height = 200,
        radius = 1, // 半径
        angleVert = 90, // 垂直角度
        angleHori = 90, // 水平角度
        heading = 0, // 朝向 0 是正北
    } = {}) {
        this._position = Cartesian3.fromDegrees(...position, height)
        this._radius = radius
        this._angleVert = CesiumMath.toRadians(angleVert)
        this._angleHori = CesiumMath.toRadians(angleHori)
        this._heading = heading

        this.scanAngleVert = 0
        this.scanStepVert = 1
        this.scanAngleHori = 0
        this.scanStepHori = 1
        this.scanFlag = true
        this._times = 0
        this.lastTime = getTimestamp()
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

        
        this._isGeometryCreate = true

        
    }

    isDestroyed() {
        return false
    }
}