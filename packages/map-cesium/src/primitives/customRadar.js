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
    Matrix4
} from 'cesium'

export default function ({
    position,
    height = 200,
    radius, // 半径
    angleVert, // 垂直角度
    angleHori, // 水平角度
    heading = 0, // 朝向 0 是正北
} = {}) {
    const positionPro = Cartesian3.fromDegrees(...position, height)
    // 高度
    const z  = radius * Math.tan(CesiumMath.toRadians(angleVert))
    const indices = []
    const positions = [0, 0, z]
    // 水平方面需要绘制的顶点
    // const angleHoriPoints = new Array(angleHori < 2 ? 2 : angleHori).fill(0)
    // 底面
    const pointCounts = angleHori < 2 ? 2 : Math.floor(angleHori)
    for (let i = 1; i <= pointCounts; i++) {
        const curAngle = CesiumMath.toRadians(-(heading - 90) - angleHori / 2 + i)
        const x = radius * Math.cos(curAngle)
        const y = radius * Math.sin(curAngle)
        positions.push(x, y, 0)
        i !== 1 && indices.push(0, i, i - 1)
    }
    // 斜面
    for (let i = 0; i < pointCounts; i++) {
        const curAngle = CesiumMath.toRadians(-(heading - 90) - angleHori / 2 + i)
        const x = radius * Math.cos(curAngle)
        const y = radius * Math.sin(curAngle)
        positions.push(x, y, z)
        i !== 0 && indices.push(0, pointCounts + i + 1, pointCounts + i)
    }
    // 侧面
    indices.push(0, 1, pointCounts + 1, 0, pointCounts, pointCounts * 2)
    // angleHoriPoints.forEach((_, idx) => {
    //     const curAngle = CesiumMath.toRadians(-(heading - 90) - angleHori / 2 + idx)
    //     const x = radius * Math.cos(curAngle)
    //     const y = radius * Math.sin(curAngle)
    //     positions.push(x, y, z)
    //     idx !== 0 && indices.push(0, length + idx + 1 + 1, length + idx + 1)
    // })
    const geometry = new Geometry({
        attributes : {
            position : new GeometryAttribute({
            componentDatatype : ComponentDatatype.DOUBLE,
            componentsPerAttribute : 3,
            values: positions
            })
        },
        indices,
        primitiveType : PrimitiveType.TRIANGLES,
        boundingSphere : BoundingSphere.fromVertices(positions)
    })
    const instance = new GeometryInstance({
        geometry: geometry,
        id: 'object returned when this instance is picked and to get/set per-instance attributes',
        attributes: {
            color: ColorGeometryInstanceAttribute.fromColor(Color.RED.withAlpha(0.5))
        },
        // modelMatrix: Matrix4.multiplyByTranslation(Matrix4.IDENTITY, positionPro, new Matrix4()),
        modelMatrix: Transforms.eastNorthUpToFixedFrame(positionPro),
    })
    const primitive = new Primitive({
        geometryInstances: instance,
        appearance: new PerInstanceColorAppearance({
            flat: true,
            translucent: true,
            vertexFormat: VertexFormat.POSITION_AND_COLOR
        }),
        asynchronous: false
    })
    return primitive
    // const box = BoxGeometry.fromDimensions({
    //     vertexFormat: VertexFormat.POSITION_AND_NORMAL,
    //     dimensions: new Cartesian3(1000000.0, 1000000.0, 1000000.0)
    // })
    // const geometry = BoxGeometry.createGeometry(box)
    // const instance = new GeometryInstance({
    //     geometry: geometry,
    //     modelMatrix: Transforms.eastNorthUpToFixedFrame(positionPro),
    // })
    // const primitive = new Primitive({
    //     geometryInstances: instance,
    //     appearance: new MaterialAppearance({
    //         material: new Material({
    //             fabric: {
    //                 type: 'Color',
    //                 uniforms: {
    //                     color: new Color(1.0, 0.0, 0.0, 0.5)
    //                 }
    //             }
    //         }),
    //     })
    // })
    // return primitive
}

// const instance = new GeometryInstance({
//     geometry: new EllipseGeometry({
//         center: positionPro,
//         semiMinorAxis: 500000.0,
//         semiMajorAxis: 1000000.0,
//         rotation: CesiumMath.PI_OVER_FOUR,
//         vertexFormat: VertexFormat.POSITION_AND_ST
//     }),
//     id: 'object returned when this instance is picked and to get/set per-instance attributes'
// })
// const primitive = new Primitive({
//     geometryInstances: instance,
//     appearance: new EllipsoidSurfaceAppearance({
//         material: Material.fromType('Checkerboard')
//     })
// })