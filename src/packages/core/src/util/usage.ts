/**
 * Traffic light shared by every usage display: the sidebar bars, the license
 * tabs and the AI chat. White while there is headroom, warning when the limit
 * comes close, danger once it is practically gone.
 */
export const USAGE_NEUTRAL_COLOR = "#ffffff"
export const USAGE_WARNING_COLOR = "#FFBE0B"
export const USAGE_DANGER_COLOR = "#D90429"

const WARNING_RATIO = 0.75
const DANGER_RATIO = 0.9

/**
 * `limit` null or undefined means the plan sets no cap, `limit <= 0` means the
 * plan includes no allowance at all.
 */
export const getUsageColor = (used: number, limit?: number | null): string => {
    if (limit == null) return USAGE_NEUTRAL_COLOR
    if (limit <= 0) return USAGE_DANGER_COLOR

    const ratio = used / limit
    return ratio < WARNING_RATIO ? USAGE_NEUTRAL_COLOR : ratio < DANGER_RATIO ? USAGE_WARNING_COLOR : USAGE_DANGER_COLOR
}

/**
 * Percentage of the bar to fill. Without a cap there is nothing to measure
 * against, so the bar renders full in its neutral colour; an exhausted plan
 * renders full in danger.
 */
export const getUsageFill = (used: number, limit?: number | null): number =>
    limit == null || limit <= 0 ? 100 : Math.min(100, Math.round((used / limit) * 100))
