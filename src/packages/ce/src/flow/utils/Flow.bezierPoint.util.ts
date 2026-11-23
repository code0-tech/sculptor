export type BezierPoint = [number, number]

export type BezierCurve = [BezierPoint, BezierPoint, BezierPoint, BezierPoint]

export const bezierPoint = (curve: BezierCurve, t: number): BezierPoint => {
    const u = 1 - t

    return [
        u * u * u * curve[0][0] + 3 * u * u * t * curve[1][0] + 3 * u * t * t * curve[2][0] + t * t * t * curve[3][0],
        u * u * u * curve[0][1] + 3 * u * u * t * curve[1][1] + 3 * u * t * t * curve[2][1] + t * t * t * curve[3][1]
    ]
}
