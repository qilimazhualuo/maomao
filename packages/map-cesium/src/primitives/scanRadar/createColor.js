import { Color } from 'cesium'

export function createBodyColor(primitive, positionsLength) {
    var t = []

    const i = Color.fromCssColorString(primitive.centerColor)
    t.push(i.red)
    t.push(i.green)
    t.push(i.blue)
    t.push(i.alpha)

    const n = Color.fromCssColorString(primitive.color)

    for (let r = 1; r < positionsLength / 4; ++r) {
        t.push(n.red)
        t.push(n.green)
        t.push(n.blue)
        t.push(n.alpha)
    }

    const a = new Float32Array(t.length)

    for (let r = 0; r < t.length; ++r) {
        a[r] = t[r]
    }

    return a
}

export function createColor(color, positionsLength, itemSize) {
    var t = []

    const n = Color.fromCssColorString(color)

    for (let r = 0; r < positionsLength / itemSize; ++r) {
        t.push(n.red)
        t.push(n.green)
        t.push(n.blue)
        t.push(n.alpha)
    }

    const a = new Float32Array(t.length)

    for (let r = 0; r < t.length; ++r) {
        a[r] = t[r]
    }

    return a
}
