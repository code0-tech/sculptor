import {BezierCurve, bezierPoint} from "@edition/flow/utils/Flow.bezierPoint.util";

const SAMPLES = 64

// t = 0.5 of a bezier is not its middle, so the curve is sampled and cut at half of its arc length
export const bezierMiddle = (curve: BezierCurve): number => {
    const sampled = Array.from({length: SAMPLES + 1}, (_, index) => bezierPoint(curve, index / SAMPLES))

    const lengths = sampled.reduce<number[]>((collected, point, index) => index === 0
        ? [0]
        : [...collected, collected[index - 1] + Math.hypot(point[0] - sampled[index - 1][0], point[1] - sampled[index - 1][1])], [])

    const half = lengths[SAMPLES] / 2
    const reached = lengths.findIndex(length => length >= half)

    if (reached <= 0) return 0.5

    return (reached - 1 + (half - lengths[reached - 1]) / (lengths[reached] - lengths[reached - 1])) / SAMPLES
}
