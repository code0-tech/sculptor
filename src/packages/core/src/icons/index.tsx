import React from "react"
import GlsIcon from "./gls.svg"

export type CustomIconProps = {
    size?: number | string
    color?: string
} & Omit<React.SVGProps<SVGSVGElement>, "color">

/**
 * Wraps a raw SVG (loaded directly from its `.svg` file in this folder) into a
 * component that accepts the same `size` and `color` props as the Tabler/Simple
 * icons. The `fill` is applied on the root `<svg>` and inherited by the paths.
 */
const customIcon = (Svg: React.FC<React.SVGProps<SVGSVGElement>>): React.FC<CustomIconProps> =>
    function CustomIcon({size = 24, color = "currentColor", ...rest}) {
        return <Svg width={size} height={size} fill={color} {...rest}/>
    }

export const Gls = customIcon(GlsIcon)
