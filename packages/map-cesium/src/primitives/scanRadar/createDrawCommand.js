import {
    GeometryAttribute,
    GeometryAttributes,
    ComponentDatatype,
    PrimitiveType,
    DrawCommand,
    Geometry,
    GeometryPipeline,
    VertexArray,
    ShaderProgram,
    Cartesian3,
    Matrix3,
    OrientedBoundingBox
} from 'cesium'

import { vs, fs, gridVs } from './glsl.js'
import {
    bodyAndHoriVertex,
    verticalVertex,
    faceAndHoriVertex,
    gridVertex,
    boderVertex,
    vertical2Vertex
} from './createGeometry.js'
import { createBodyColor, createColor } from './createColor.js'

export function createBodyGeometry(frameState, object) {
    const attributes = new GeometryAttributes()

    const positions = bodyAndHoriVertex(object, 0)

    attributes.position = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        values: positions
    })

    const colors = createBodyColor(object, positions.length)

    attributes.color = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        values: colors
    })

    const geometry = new Geometry({ attributes })
    const attributeLocations = GeometryPipeline.createAttributeLocations(geometry)

    const vertexArray = VertexArray.fromGeometry({
        geometry,
        context: frameState.context,
        attributeLocations: attributeLocations
    })

    const shaderProgram = ShaderProgram.fromCache({
        context: frameState.context,
        vertexShaderSource: vs,
        fragmentShaderSource: fs
    })

    const uniformMap = {
        uMMatrix: () => {
            return object._commonModelMatrix
        }
    }

    object.bodyDrawCommand = new DrawCommand({
        count: attributes.position.values.length / 4,
        vertexArray,
        uniformMap,
        shaderProgram,
        renderState: object._renderState,
        pass: object._pass,
        primitiveType: PrimitiveType.TRIANGLE_FAN
    })
    object.bodyDrawCommand._boundingVolume = object.obb
}

export function createFaceGeometry(frameState, object) {
    const attributes = new GeometryAttributes()

    const positions = faceAndHoriVertex(object, 0)
    attributes.position = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        values: positions
    })

    const colors = createColor(object.color, positions.length, 4)
    attributes.color = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        values: colors
    })

    const geometry = new Geometry({ attributes })
    const attributeLocations = GeometryPipeline.createAttributeLocations(geometry)

    const vertexArray = VertexArray.fromGeometry({
        geometry,
        context: frameState.context,
        attributeLocations: attributeLocations
    })

    const shaderProgram = ShaderProgram.fromCache({
        context: frameState.context,
        vertexShaderSource: vs,
        fragmentShaderSource: fs
    })

    const uniformMap = {
        uMMatrix: () => {
            return object._commonModelMatrix
        }
    }

    object.faceDrawCommand = new DrawCommand({
        count: attributes.position.values.length / 4,
        vertexArray,
        uniformMap,
        shaderProgram,
        renderState: object._renderState,
        pass: object._pass,
        primitiveType: PrimitiveType.TRIANGLES
    })
    object.faceDrawCommand._boundingVolume = object.obb
}

export function createGridGeometry(frameState, object) {
    const attributes = new GeometryAttributes()

    const positions = gridVertex(object)
    attributes.position = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: positions
    })

    const colors = createColor(object._griderColor, positions.length, 3)
    attributes.color = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        values: colors
    })

    const geometry = new Geometry({ attributes })
    const attributeLocations = GeometryPipeline.createAttributeLocations(geometry)

    const vertexArray = VertexArray.fromGeometry({
        geometry,
        context: frameState.context,
        attributeLocations: attributeLocations
    })

    const shaderProgram = ShaderProgram.fromCache({
        context: frameState.context,
        vertexShaderSource: gridVs,
        fragmentShaderSource: fs
    })

    const uniformMap = {
        uMMatrix: () => {
            return object._commonModelMatrix
        }
    }

    object.gridDrawCommand = new DrawCommand({
        count: attributes.position.values.length / 3,
        vertexArray,
        uniformMap,
        shaderProgram,
        renderState: object._renderState,
        pass: object._pass,
        primitiveType: PrimitiveType.LINES
    })
    object.gridDrawCommand._boundingVolume = object.obb
}

export function createBoderGeometry(frameState, object) {
    const attributes = new GeometryAttributes()

    const positions = boderVertex(object)
    attributes.position = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: positions
    })

    const colors = createColor(object._borderColor, positions.length, 3)
    attributes.color = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        values: colors
    })

    const geometry = new Geometry({ attributes })
    const attributeLocations = GeometryPipeline.createAttributeLocations(geometry)

    const vertexArray = VertexArray.fromGeometry({
        geometry,
        context: frameState.context,
        attributeLocations: attributeLocations
    })

    const shaderProgram = ShaderProgram.fromCache({
        context: frameState.context,
        vertexShaderSource: gridVs,
        fragmentShaderSource: fs
    })

    const uniformMap = {
        uMMatrix: () => {
            return object._commonModelMatrix
        }
    }

    object.boderDrawCommand = new DrawCommand({
        count: attributes.position.values.length / 3,
        vertexArray,
        uniformMap,
        shaderProgram,
        renderState: object._renderState,
        pass: object._pass,
        primitiveType: PrimitiveType.LINES
    })
    object.boderDrawCommand._boundingVolume = object.obb
}

export function createVert1Geometry(frameState, object) {
    const attributes = new GeometryAttributes()

    const positions = vertical2Vertex(object)
    attributes.position = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        values: positions
    })

    const colors = createColor(object._scanColor, positions.length, 3)
    attributes.color = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        values: colors
    })

    const geometry = new Geometry({ attributes })
    const attributeLocations = GeometryPipeline.createAttributeLocations(geometry)

    const vertexArray = VertexArray.fromGeometry({
        geometry,
        context: frameState.context,
        attributeLocations: attributeLocations
    })

    const shaderProgram = ShaderProgram.fromCache({
        context: frameState.context,
        vertexShaderSource: vs,
        fragmentShaderSource: fs
    })

    const uniformMap = {
        uMMatrix: () => {
            return object._commonModelMatrix
        }
    }

    object.vert1DrawCommand = new DrawCommand({
        count: attributes.position.values.length / 4,
        vertexArray,
        uniformMap,
        shaderProgram,
        renderState: object._renderState,
        pass: object._pass,
        primitiveType: PrimitiveType.TRIANGLE_FAN
    })
    object.vert1DrawCommand._boundingVolume = object.obb
}

export function createHori1Geometry(frameState, object) {
    const attributes = new GeometryAttributes()

    const positions = bodyAndHoriVertex(object, 2)
    attributes.position = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        values: positions
    })

    const colors = createColor(object._scanColor, positions.length, 3)
    attributes.color = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        values: colors
    })

    const geometry = new Geometry({ attributes })
    const attributeLocations = GeometryPipeline.createAttributeLocations(geometry)

    const vertexArray = VertexArray.fromGeometry({
        geometry,
        context: frameState.context,
        attributeLocations: attributeLocations
    })

    const shaderProgram = ShaderProgram.fromCache({
        context: frameState.context,
        vertexShaderSource: vs,
        fragmentShaderSource: fs
    })

    const uniformMap = {
        uMMatrix: () => {
            return object.horiModelMatrix
        }
    }

    object.hori1DrawCommand = new DrawCommand({
        count: attributes.position.values.length / 4,
        vertexArray,
        uniformMap,
        shaderProgram,
        renderState: object._renderState,
        pass: object._pass,
        primitiveType: PrimitiveType.TRIANGLE_FAN
    })
    object.hori1DrawCommand._boundingVolume = object.obb
}

export function createHori2Geometry(frameState, object) {
    const attributes = new GeometryAttributes()

    const positions = faceAndHoriVertex(object, 2)
    attributes.position = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        values: positions
    })

    const colors = createColor(object._scanFaceColor, positions.length, 3)
    attributes.color = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        values: colors
    })

    const geometry = new Geometry({ attributes })
    const attributeLocations = GeometryPipeline.createAttributeLocations(geometry)

    const vertexArray = VertexArray.fromGeometry({
        geometry,
        context: frameState.context,
        attributeLocations: attributeLocations
    })

    const shaderProgram = ShaderProgram.fromCache({
        context: frameState.context,
        vertexShaderSource: vs,
        fragmentShaderSource: fs
    })

    const uniformMap = {
        uMMatrix: () => {
            return object.horiModelMatrix
        }
    }

    object.hori2DrawCommand = new DrawCommand({
        count: attributes.position.values.length / 4,
        vertexArray,
        uniformMap,
        shaderProgram,
        renderState: object._renderState,
        pass: object._pass,
        primitiveType: PrimitiveType.TRIANGLES
    })
    object.hori2DrawCommand._boundingVolume = object.obb
}

export function createVert2Geometry(frameState, object) {
    const attributes = new GeometryAttributes()

    const positions = verticalVertex(object)
    attributes.position = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        values: positions
    })

    const colors = createColor(object._scanFaceColor, positions.length, 3)
    attributes.color = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 4,
        values: colors
    })

    const geometry = new Geometry({ attributes })
    const attributeLocations = GeometryPipeline.createAttributeLocations(geometry)

    const vertexArray = VertexArray.fromGeometry({
        geometry,
        context: frameState.context,
        attributeLocations: attributeLocations
    })

    const shaderProgram = ShaderProgram.fromCache({
        context: frameState.context,
        vertexShaderSource: vs,
        fragmentShaderSource: fs
    })

    const uniformMap = {
        uMMatrix: () => {
            return object._commonModelMatrix
        }
    }

    object.vert2DrawCommand = new DrawCommand({
        count: attributes.position.values.length / 4,
        vertexArray,
        uniformMap,
        shaderProgram,
        renderState: object._renderState,
        pass: object._pass,
        primitiveType: PrimitiveType.TRIANGLES
    })
    object.vert2DrawCommand._boundingVolume = object.obb
}
