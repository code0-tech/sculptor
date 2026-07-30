"use client"

import React from "react";
import QRCode from "qrcode";

export interface QrCodeComponentProps {
    value: string
    size?: number
}

export const QrCodeComponent: React.FC<QrCodeComponentProps> = (props) => {

    const {value, size = 200} = props

    const {path, viewBoxSize} = React.useMemo(() => {
        const quietZone = 4
        const {modules} = QRCode.create(value, {errorCorrectionLevel: "M"})
        const moduleCount = modules.size

        let path = ""
        for (let row = 0; row < moduleCount; row++) {
            for (let column = 0; column < moduleCount; column++) {
                if (modules.data[row * moduleCount + column]) {
                    path += `M${column + quietZone},${row + quietZone}h1v1h-1z`
                }
            }
        }

        return {path, viewBoxSize: moduleCount + quietZone * 2}
    }, [value])

    return <svg width={size} height={size}
                viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                shapeRendering={"crispEdges"}
                style={{display: "block", borderRadius: 8}}>
        <rect width={viewBoxSize} height={viewBoxSize} fill={"#ffffff"}/>
        <path d={path} fill={"#000000"}/>
    </svg>
}
