import React from "react"
import * as TablerIcons from "@tabler/icons-react"

export type IconString = `${'tabler'}:${string}`

export const icon = (icon?: IconString): React.FC<TablerIcons.IconProps & React.RefAttributes<SVGSVGElement>> => {

    const fallbackIcon = TablerIcons.IconNote
    const normalizedIconName = `Icon${(icon?.replace("tabler:", "") ?? "Note")
        .trim()
        .replace(/^icon/i, "")
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join("")}`

    const resolvedIcon = normalizedIconName in TablerIcons
        ? TablerIcons[normalizedIconName as keyof typeof TablerIcons]
        : fallbackIcon

    return resolvedIcon as React.FC<TablerIcons.IconProps & React.RefAttributes<SVGSVGElement>>
}