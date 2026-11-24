import {BezierCurve, BezierPoint, bezierPoint} from "@edition/flow/utils/Flow.bezierPoint.util";
import {bezierMiddle} from "@edition/flow/utils/Flow.bezierMiddle.util";
import {bezierPath} from "@edition/flow/utils/Flow.bezierPath.util";

export interface EdgeAddSegments {
    parameter: string
    path: string
    button: BezierPoint
    label: BezierPoint
}

// the add button rides on the middle of the existing edge: the node side half becomes the white standard
// edge carrying the parameter label, the parameter side keeps the parameter colour. de casteljau cuts the
// curve so both halves stay exact beziers and nothing is painted twice where they meet.
// split 0 puts the button on the source itself, which is what an empty slot wants: the box the layout
// reserves is the button, and nothing is left over behind it
export const edgeAddSegments = (path: string, split?: number): EdgeAddSegments | undefined => {
    const points = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number)

    if (!points || points.length < 8) return undefined

    const [x0, y0, x1, y1, x2, y2, x3, y3] = points
    const curve: BezierCurve = [[x0, y0], [x1, y1], [x2, y2], [x3, y3]]
    const t = split ?? bezierMiddle(curve)

    const first: BezierPoint = [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]
    const second: BezierPoint = [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]
    const third: BezierPoint = [x2 + (x3 - x2) * t, y2 + (y3 - y2) * t]
    const head: BezierPoint = [first[0] + (second[0] - first[0]) * t, first[1] + (second[1] - first[1]) * t]
    const tailStart: BezierPoint = [second[0] + (third[0] - second[0]) * t, second[1] + (third[1] - second[1]) * t]
    const button: BezierPoint = [head[0] + (tailStart[0] - head[0]) * t, head[1] + (tailStart[1] - head[1]) * t]

    const tail: BezierCurve = [button, tailStart, third, [x3, y3]]

    return {
        parameter: bezierPath([[x0, y0], first, head, button]),
        path: bezierPath(tail),
        button: button,
        label: bezierPoint(tail, bezierMiddle(tail))
    }
}
