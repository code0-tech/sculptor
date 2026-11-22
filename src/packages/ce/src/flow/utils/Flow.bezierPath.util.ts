import {BezierCurve} from "@edition/flow/utils/Flow.bezierPoint.util";

export const bezierPath = (curve: BezierCurve): string =>
    `M${curve[0][0]},${curve[0][1]} C${curve[1][0]},${curve[1][1]} ${curve[2][0]},${curve[2][1]} ${curve[3][0]},${curve[3][1]}`
