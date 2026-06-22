import React from "react"
import * as TablerIcons from "@tabler/icons-react"
import * as SimpleIcons from "@icons-pack/react-simple-icons"

type TablerIcon = React.FC<TablerIcons.IconProps & React.RefAttributes<SVGSVGElement>>
type SimpleIcon = React.FC<Omit<SimpleIcons.IconType, '$$typeof'>>
export type IconString = `${'tabler'}:${string}` | `${'simple'}:${string}`

export const icon = (icon?: IconString): TablerIcon | SimpleIcon => {

    const fallbackIcon = TablerIcons.IconNote

    if (icon?.startsWith("simple:")) {
        const name = icon.replace("simple:", "").trim()
        const normalizedName = `Si${name.charAt(0).toUpperCase() + name.slice(1)}`

        const resolvedIcon = normalizedName in SimpleIcons
            ? SimpleIcons[normalizedName as keyof typeof SimpleIcons]
            : fallbackIcon

        return resolvedIcon as SimpleIcon
    }

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

    return resolvedIcon as TablerIcon
}