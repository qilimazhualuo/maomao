import { Math as CesiumMath } from 'cesium'

export function bodyAndHoriVertex(primitive, t) {
    const radius = primitive.radius
    const hStep = CesiumMath.toRadians(primitive._hStep)
    const vStep = CesiumMath.toRadians(primitive._vStep)

    let angleVert = CesiumMath.toRadians(primitive._angleVert)
    let angleHori = CesiumMath.toRadians(primitive._angleHori)

    if (t === 1) {
        angleVert = vStep
    } else if (t === 2) {
        angleHori = hStep
    }

    var s = []
    s.push(0)
    s.push(0)
    s.push(0)
    s.push(1)

    for (let i = 0; i < angleVert; i += vStep) {
        const x = radius * Math.cos(i) * Math.sin(-angleHori / 2)
        const y = radius * Math.cos(i) * Math.cos(-angleHori / 2)
        const z = radius * Math.sin(i)
        s.push(x)
        s.push(y)
        s.push(z)
        s.push(1)
    }

    for (let i = -angleHori / 2; i < angleHori / 2; i += hStep) {
        let u = radius * Math.cos(angleVert) * Math.sin(i)
        let c = radius * Math.cos(angleVert) * Math.cos(i)
        let h = radius * Math.sin(angleVert)
        s.push(u)
        s.push(c)
        s.push(h)
        s.push(1)
    }

    for (let i = angleVert; i > 0; i -= vStep) {
        let u = radius * Math.cos(i) * Math.sin(angleHori / 2)
        let c = radius * Math.cos(i) * Math.cos(angleHori / 2)
        let h = radius * Math.sin(i)
        s.push(u)
        s.push(c)
        s.push(h)
        s.push(1)
    }

    for (let i = angleHori / 2; i > -angleHori / 2; i -= hStep) {
        let u = radius * Math.sin(i)
        let c = radius * Math.cos(i)
        let h = radius * Math.sin(0)
        s.push(u)
        s.push(c)
        s.push(h)
        s.push(1)
    }

    let u = radius * Math.sin(-angleHori / 2)
    let c = radius * Math.cos(-angleHori / 2)
    let h = radius * Math.sin(0)
    s.push(u)
    s.push(c)
    s.push(h)
    s.push(1)

    var p = new Float32Array(s.length)
    for (let i = 0; i < s.length; ++i) {
        p[i] = s[i]
    }
    return p
}

export function verticalVertex(e) {
    const radius = e.radius
    const hstep = CesiumMath.toRadians(e._hStep)
    const vstep = CesiumMath.toRadians(e._vStep)

    const angleHori = CesiumMath.toRadians(e._angleHori)

    let angleVert = CesiumMath.toRadians(e._angleVert)
    angleVert = vstep + CesiumMath.toRadians(e.scanAngleVert)

    let j
    let a = []

    for (let i = angleVert; i >= angleVert; i -= vstep) {
        for (j = -angleHori / 2; j <= angleHori / 2 - hstep; j += hstep) {
            const u = radius * Math.cos(i) * Math.sin(j)
            const c = radius * Math.cos(i) * Math.cos(j)
            const h = radius * Math.sin(i)

            const d = radius * Math.cos(i - vstep) * Math.sin(j)
            const p = radius * Math.cos(i - vstep) * Math.cos(j)
            const f = radius * Math.sin(i - vstep)

            const m = radius * Math.cos(i) * Math.sin(j + hstep)
            const _ = radius * Math.cos(i) * Math.cos(j + hstep)
            const g = radius * Math.sin(i)

            const y = radius * Math.cos(i - vstep) * Math.sin(j + hstep)
            const v = radius * Math.cos(i - vstep) * Math.cos(j + hstep)
            const A = radius * Math.sin(i - vstep)

            a.push(u)
            a.push(c)
            a.push(h)
            a.push(1)

            a.push(d)
            a.push(p)
            a.push(f)
            a.push(1)

            a.push(y)
            a.push(v)
            a.push(A)
            a.push(1)

            a.push(u)
            a.push(c)
            a.push(h)
            a.push(1)

            a.push(y)
            a.push(v)
            a.push(A)
            a.push(1)

            a.push(m)
            a.push(_)
            a.push(g)
            a.push(1)
        }

        const u = radius * Math.cos(i) * Math.sin(j)
        const c = radius * Math.cos(i) * Math.cos(j)
        const h = radius * Math.sin(i)
        const d = radius * Math.cos(i - vstep) * Math.sin(j)
        const p = radius * Math.cos(i - vstep) * Math.cos(j)
        const f = radius * Math.sin(i - vstep)
        const m = radius * Math.cos(i) * Math.sin(angleHori / 2)
        const _ = radius * Math.cos(i) * Math.cos(angleHori / 2)
        const g = radius * Math.sin(i)
        const y = radius * Math.cos(i - vstep) * Math.sin(angleHori / 2)
        const v = radius * Math.cos(i - vstep) * Math.cos(angleHori / 2)
        const A = radius * Math.sin(i - vstep)

        a.push(u)
        a.push(c)
        a.push(h)
        a.push(1)

        a.push(d)
        a.push(p)
        a.push(f)
        a.push(1)

        a.push(y)
        a.push(v)
        a.push(A)
        a.push(1)

        a.push(u)
        a.push(c)
        a.push(h)
        a.push(1)

        a.push(y)
        a.push(v)
        a.push(A)
        a.push(1)

        a.push(m)
        a.push(_)
        a.push(g)
        a.push(1)
    }

    const b = new Float32Array(a.length)
    for (let i = 0; i < a.length; ++i) {
        b[i] = a[i]
    }
    return b
}

export function faceAndHoriVertex(primitive, t) {
    const radius = primitive.radius
    const hStep = CesiumMath.toRadians(primitive._hStep)
    const vStep = CesiumMath.toRadians(primitive._vStep)
    let angleVert = CesiumMath.toRadians(primitive._angleVert)
    let angleHori = CesiumMath.toRadians(primitive._angleHori)

    1 === t ? (angleVert = vStep) : 2 === t && (angleHori = hStep)
    const s = []
    let l = 0
    let u = 0

    for (l = angleVert; l >= vStep; l -= vStep) {
        for (u = -angleHori / 2; u <= angleHori / 2 - hStep; u += hStep) {
            var c = radius * Math.cos(l) * Math.sin(u),
                h = radius * Math.cos(l) * Math.cos(u),
                d = radius * Math.sin(l),
                p = radius * Math.cos(l - vStep) * Math.sin(u),
                f = radius * Math.cos(l - vStep) * Math.cos(u),
                m = radius * Math.sin(l - vStep),
                _ = radius * Math.cos(l) * Math.sin(u + hStep),
                g = radius * Math.cos(l) * Math.cos(u + hStep),
                y = radius * Math.sin(l),
                v = radius * Math.cos(l - vStep) * Math.sin(u + hStep),
                A = radius * Math.cos(l - vStep) * Math.cos(u + hStep),
                C = radius * Math.sin(l - vStep)
            s.push(c),
                s.push(h),
                s.push(d),
                s.push(1),
                s.push(p),
                s.push(f),
                s.push(m),
                s.push(1),
                s.push(v),
                s.push(A),
                s.push(C),
                s.push(1),
                s.push(c),
                s.push(h),
                s.push(d),
                s.push(1),
                s.push(v),
                s.push(A),
                s.push(C),
                s.push(1),
                s.push(_),
                s.push(g),
                s.push(y),
                s.push(1)
        }
        if (u < angleHori / 2) {
            ;(c = radius * Math.cos(l) * Math.sin(u)),
                (h = radius * Math.cos(l) * Math.cos(u)),
                (d = radius * Math.sin(l)),
                (p = radius * Math.cos(l - vStep) * Math.sin(u)),
                (f = radius * Math.cos(l - vStep) * Math.cos(u)),
                (m = radius * Math.sin(l - vStep)),
                (_ = radius * Math.cos(l) * Math.sin(angleHori / 2)),
                (g = radius * Math.cos(l) * Math.cos(angleHori / 2)),
                (y = radius * Math.sin(l)),
                (v = radius * Math.cos(l - vStep) * Math.sin(angleHori / 2)),
                (A = radius * Math.cos(l - vStep) * Math.cos(angleHori / 2)),
                (C = radius * Math.sin(l - vStep))
            s.push(c),
                s.push(h),
                s.push(d),
                s.push(1),
                s.push(p),
                s.push(f),
                s.push(m),
                s.push(1),
                s.push(v),
                s.push(A),
                s.push(C),
                s.push(1),
                s.push(c),
                s.push(h),
                s.push(d),
                s.push(1),
                s.push(v),
                s.push(A),
                s.push(C),
                s.push(1),
                s.push(_),
                s.push(g),
                s.push(y),
                s.push(1)
        }
    }

    if (l > 0) {
        for (u = -angleHori / 2; u <= angleHori / 2 - hStep; u += hStep) {
            ;(c = radius * Math.cos(l) * Math.sin(u)),
                (h = radius * Math.cos(l) * Math.cos(u)),
                (d = radius * Math.sin(l)),
                (p = radius * Math.sin(u)),
                (f = radius * Math.cos(u)),
                (m = radius * Math.sin(0)),
                (_ = radius * Math.cos(l) * Math.sin(u + hStep)),
                (g = radius * Math.cos(l) * Math.cos(u + hStep)),
                (y = radius * Math.sin(l)),
                (v = radius * Math.sin(u + hStep)),
                (A = radius * Math.cos(u + hStep)),
                (C = radius * Math.sin(0))
            s.push(c),
                s.push(h),
                s.push(d),
                s.push(1),
                s.push(p),
                s.push(f),
                s.push(m),
                s.push(1),
                s.push(v),
                s.push(A),
                s.push(C),
                s.push(1),
                s.push(c),
                s.push(h),
                s.push(d),
                s.push(1),
                s.push(v),
                s.push(A),
                s.push(C),
                s.push(1),
                s.push(_),
                s.push(g),
                s.push(y),
                s.push(1)
        }
        if (u < angleHori / 2) {
            ;(c = radius * Math.cos(l) * Math.sin(u)),
                (h = radius * Math.cos(l) * Math.cos(u)),
                (d = radius * Math.sin(l)),
                (p = radius * Math.sin(u)),
                (f = radius * Math.cos(u)),
                (m = radius * Math.sin(0)),
                (_ = radius * Math.cos(l) * Math.sin(angleHori / 2)),
                (g = radius * Math.cos(l) * Math.cos(angleHori / 2)),
                (y = radius * Math.sin(l)),
                (v = radius * Math.sin(angleHori / 2)),
                (A = radius * Math.cos(angleHori / 2)),
                (C = radius * Math.sin(0))
            s.push(c),
                s.push(h),
                s.push(d),
                s.push(1),
                s.push(p),
                s.push(f),
                s.push(m),
                s.push(1),
                s.push(v),
                s.push(A),
                s.push(C),
                s.push(1),
                s.push(c),
                s.push(h),
                s.push(d),
                s.push(1),
                s.push(v),
                s.push(A),
                s.push(C),
                s.push(1),
                s.push(_),
                s.push(g),
                s.push(y),
                s.push(1)
        }
    }
    var b = s.length,
        E = new Float32Array(b)
    for (l = 0; l < b; ++l) {
        E[l] = s[l]
    }
    return E
}

export function gridVertex(e) {
    var radius = e.radius,
        hStep = CesiumMath.toRadians(5 * e._hStep),
        vStep = CesiumMath.toRadians(5 * e._vStep),
        angleVert = CesiumMath.toRadians(e._angleVert),
        angleHori = CesiumMath.toRadians(e._angleHori),
        a = [],
        s = 0,
        l = 0

    for (s = angleVert; s > 0; s -= vStep) {
        for (l = -angleHori / 2; l <= angleHori / 2 - hStep; l += hStep) {
            var u = radius * Math.cos(s) * Math.sin(l),
                c = radius * Math.cos(s) * Math.cos(l),
                h = radius * Math.sin(s),
                d = radius * Math.cos(s) * Math.sin(l + hStep),
                p = radius * Math.cos(s) * Math.cos(l + hStep),
                f = radius * Math.sin(s)

            a.push(u)
            a.push(c)
            a.push(h)
            a.push(d)
            a.push(p)
            a.push(f)
        }

        if (l < angleHori / 2) {
            u = radius * Math.cos(s) * Math.sin(l)
            c = radius * Math.cos(s) * Math.cos(l)
            h = radius * Math.sin(s)
            d = radius * Math.cos(s) * Math.sin(angleHori / 2)
            p = radius * Math.cos(s) * Math.cos(angleHori / 2)
            f = radius * Math.sin(s)
            a.push(u)
            a.push(c)
            a.push(h)
            a.push(d)
            a.push(p)
            a.push(f)
        }
    }
    if (s <= 0) {
        for (l = -angleHori / 2; l < angleHori / 2 - hStep; l += hStep) {
            u = radius * Math.sin(l)
            c = radius * Math.cos(l)
            h = radius * Math.sin(0)
            d = radius * Math.sin(l + hStep)
            p = radius * Math.cos(l + hStep)
            f = radius * Math.sin(0)
            a.push(u)
            a.push(c)
            a.push(h)
            a.push(d)
            a.push(p)
            a.push(f)
        }
        if (l >= angleHori / 2 - hStep) {
            u = radius * Math.sin(l)
            c = radius * Math.cos(l)
            h = radius * Math.sin(0)
            d = radius * Math.sin(angleHori / 2)
            p = radius * Math.cos(angleHori / 2)
            f = radius * Math.sin(0)
            a.push(u)
            a.push(c)
            a.push(h)
            a.push(d)
            a.push(p)
            a.push(f)
        }
    }
    for (s = -angleHori / 2; s < angleHori / 2; s += hStep) {
        for (l = angleVert; l > vStep; l -= vStep) {
            u = radius * Math.cos(l) * Math.sin(s)
            c = radius * Math.cos(l) * Math.cos(s)
            h = radius * Math.sin(l)
            d = radius * Math.cos(l - vStep) * Math.sin(s)
            p = radius * Math.cos(l - vStep) * Math.cos(s)
            f = radius * Math.sin(l - vStep)
            a.push(u)
            a.push(c)
            a.push(h)
            a.push(d)
            a.push(p)
            a.push(f)
        }
        if (l <= vStep) {
            u = radius * Math.cos(l) * Math.sin(s)
            c = radius * Math.cos(l) * Math.cos(s)
            h = radius * Math.sin(l)
            d = radius * Math.sin(s)
            p = radius * Math.cos(s)
            f = radius * Math.sin(0)
            a.push(u)
            a.push(c)
            a.push(h)
            a.push(d)
            a.push(p)
            a.push(f)
        }
    }
    if (s >= angleHori / 2) {
        for (l = angleVert; l > vStep; l -= vStep) {
            u = radius * Math.cos(l) * Math.sin(angleHori / 2)
            c = radius * Math.cos(l) * Math.cos(angleHori / 2)
            h = radius * Math.sin(l)
            d = radius * Math.cos(l - vStep) * Math.sin(angleHori / 2)
            p = radius * Math.cos(l - vStep) * Math.cos(angleHori / 2)
            f = radius * Math.sin(l - vStep)
            a.push(u)
            a.push(c)
            a.push(h)
            a.push(d)
            a.push(p)
            a.push(f)
        }
        if (l <= vStep) {
            u = radius * Math.cos(l) * Math.sin(angleHori / 2)
            c = radius * Math.cos(l) * Math.cos(angleHori / 2)
            h = radius * Math.sin(l)
            d = radius * Math.sin(angleHori / 2)
            p = radius * Math.cos(angleHori / 2)
            f = radius * Math.sin(0)
            a.push(u)
            a.push(c)
            a.push(h)
            a.push(d)
            a.push(p)
            a.push(f)
        }
    }
    var m = a.length,
        _ = new Float32Array(m)
    for (s = 0; s < m; ++s) {
        _[s] = a[s]
    }
    return _
}

export function boderVertex(e) {
    var radius = e.radius,
        hStep = CesiumMath.toRadians(5 * e._hStep),
        vStep = CesiumMath.toRadians(5 * e._vStep),
        angleVert = CesiumMath.toRadians(e._angleVert),
        angleHori = CesiumMath.toRadians(e._angleHori),
        a = [],
        s = [],
        l = [],
        u = [],
        c = [0, 0, 1e-5],
        h = [],
        d = 0,
        p = 0

    for (d = angleVert; d > 0; d -= vStep) {
        for (p = -angleHori / 2; p <= angleHori / 2 - hStep; p += hStep) {
            var f = radius * Math.cos(d) * Math.sin(p),
                m = radius * Math.cos(d) * Math.cos(p),
                _ = radius * Math.sin(d),
                g = radius * Math.cos(d) * Math.sin(p + hStep),
                y = radius * Math.cos(d) * Math.cos(p + hStep),
                v = radius * Math.sin(d)

            d === angleVert && p === -angleHori / 2 && (a = [f, m, _])
            d === angleVert && (h.push(f), h.push(m), h.push(_), h.push(g), h.push(y), h.push(v))
        }
        if (p < angleHori / 2) {
            f = radius * Math.cos(d) * Math.sin(p)
            m = radius * Math.cos(d) * Math.cos(p)
            _ = radius * Math.sin(d)
            g = radius * Math.cos(d) * Math.sin(angleHori / 2)
            y = radius * Math.cos(d) * Math.cos(angleHori / 2)
            v = radius * Math.sin(d)
            d === angleVert &&
                ((s = [g, y, v]), h.push(f), h.push(m), h.push(_), h.push(g), h.push(y), h.push(v))
        }
    }

    if (d <= 0) {
        for (p = -angleHori / 2; p < angleHori / 2 - hStep; p += hStep) {
            f = radius * Math.sin(p)
            m = radius * Math.cos(p)
            _ = radius * Math.sin(0)
            g = radius * Math.sin(p + hStep)
            y = radius * Math.cos(p + hStep)
            v = radius * Math.sin(0)

            p === -angleHori / 2 && (l = [f, m, _]),
                h.push(f),
                h.push(m),
                h.push(_),
                h.push(g),
                h.push(y),
                h.push(v)
        }

        if (p >= angleHori / 2 - hStep) {
            f = radius * Math.sin(p)
            m = radius * Math.cos(p)
            _ = radius * Math.sin(0)
            g = radius * Math.sin(angleHori / 2)
            y = radius * Math.cos(angleHori / 2)
            v = radius * Math.sin(0)
            u = [g, y, v]
            h.push(f)
            h.push(m)
            h.push(_)
            h.push(g)
            h.push(y)
            h.push(v)
        }
    }
    for (d = -angleHori / 2; d < angleHori / 2; d += hStep) {
        for (p = angleVert; p > vStep; p -= vStep) {
            f = radius * Math.cos(p) * Math.sin(d)
            m = radius * Math.cos(p) * Math.cos(d)
            _ = radius * Math.sin(p)
            g = radius * Math.cos(p - vStep) * Math.sin(d)
            y = radius * Math.cos(p - vStep) * Math.cos(d)
            v = radius * Math.sin(p - vStep)
            d === -angleHori / 2 &&
                (h.push(f), h.push(m), h.push(_), h.push(g), h.push(y), h.push(v))
        }

        if (p <= vStep) {
            f = radius * Math.cos(p) * Math.sin(d)
            m = radius * Math.cos(p) * Math.cos(d)
            _ = radius * Math.sin(p)
            g = radius * Math.sin(d)
            y = radius * Math.cos(d)
            v = radius * Math.sin(0)

            d === -angleHori / 2 &&
                (h.push(f), h.push(m), h.push(_), h.push(g), h.push(y), h.push(v))
        }
    }
    if (d >= angleHori / 2) {
        for (p = angleVert; p > vStep; p -= vStep) {
            f = radius * Math.cos(p) * Math.sin(angleHori / 2)
            m = radius * Math.cos(p) * Math.cos(angleHori / 2)
            _ = radius * Math.sin(p)
            g = radius * Math.cos(p - vStep) * Math.sin(angleHori / 2)
            y = radius * Math.cos(p - vStep) * Math.cos(angleHori / 2)
            v = radius * Math.sin(p - vStep)

            h.push(f)
            h.push(m)
            h.push(_)
            h.push(g)
            h.push(y)
            h.push(v)
        }

        if (p <= vStep) {
            f = radius * Math.cos(p) * Math.sin(angleHori / 2)
            m = radius * Math.cos(p) * Math.cos(angleHori / 2)
            _ = radius * Math.sin(p)
            g = radius * Math.sin(angleHori / 2)
            y = radius * Math.cos(angleHori / 2)
            v = radius * Math.sin(0)

            h.push(f)
            h.push(m)
            h.push(_)
            h.push(g)
            h.push(y)
            h.push(v)
        }
    }

    h = h.concat(c, a, c, s, c, l, c, u)
    var A = h.length,
        C = new Float32Array(A)
    for (d = 0; d < A; ++d) {
        C[d] = h[d]
    }
    return C
}

export function vertical2Vertex(e) {
    var radius = e.radius,
        hStep = CesiumMath.toRadians(e._hStep),
        vStep = CesiumMath.toRadians(e._vStep),
        angleHori = CesiumMath.toRadians(e._angleHori)

    var o = []
    o.push(0)
    o.push(0)
    o.push(1e-5)
    o.push(1)

    for (
        var a = CesiumMath.toRadians(e.scanAngleVert);
        a <= vStep + CesiumMath.toRadians(e.scanAngleVert);
        a += vStep
    ) {
        var s = radius * Math.cos(a) * Math.sin(-angleHori / 2),
            l = radius * Math.cos(a) * Math.cos(-angleHori / 2),
            u = radius * Math.sin(a)

        o.push(s)
        o.push(l)
        o.push(u)
        o.push(1)
    }

    for (var c = -angleHori / 2; c <= angleHori / 2; c += hStep) {
        s = radius * Math.cos(vStep + CesiumMath.toRadians(e.scanAngleVert)) * Math.sin(c)
        l = radius * Math.cos(vStep + CesiumMath.toRadians(e.scanAngleVert)) * Math.cos(c)
        u = radius * Math.sin(vStep + CesiumMath.toRadians(e.scanAngleVert))
        o.push(s)
        o.push(l)
        o.push(u)
        o.push(1)
    }

    for (
        a = vStep + CesiumMath.toRadians(e.scanAngleVert);
        a >= CesiumMath.toRadians(e.scanAngleVert);
        a -= vStep
    ) {
        s = radius * Math.cos(a) * Math.sin(angleHori / 2)
        l = radius * Math.cos(a) * Math.cos(angleHori / 2)
        u = radius * Math.sin(a)

        o.push(s)
        o.push(l)
        o.push(u)
        o.push(1)
    }

    for (c = angleHori / 2; c >= -angleHori / 2; c -= hStep) {
        s = radius * Math.cos(CesiumMath.toRadians(e.scanAngleVert)) * Math.sin(c)
        l = radius * Math.cos(CesiumMath.toRadians(e.scanAngleVert)) * Math.cos(c)
        u = radius * Math.sin(CesiumMath.toRadians(e.scanAngleVert))
        o.push(s)
        o.push(l)
        o.push(u)
        o.push(1)
    }

    s = radius * Math.cos(CesiumMath.toRadians(e.scanAngleVert)) * Math.sin(-angleHori / 2)
    l = radius * Math.cos(CesiumMath.toRadians(e.scanAngleVert)) * Math.cos(-angleHori / 2)
    u = radius * Math.sin(CesiumMath.toRadians(e.scanAngleVert))
    o.push(s)
    o.push(l)
    o.push(u)
    o.push(1)

    var h = new Float32Array(o.length)
    for (c = 0; c < o.length; ++c) {
        h[c] = o[c]
    }
    return h
}
