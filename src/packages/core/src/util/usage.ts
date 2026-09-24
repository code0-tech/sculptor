import {parseISO} from "date-fns";

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

/**
 * Share of the billing period that has already passed, clamped so a period that
 * just started does not project towards infinity.
 */
export const getUsageElapsed = (afterDate: string, beforeDate: string): number => {
    const periodStart = parseISO(afterDate).getTime()
    const periodEnd = parseISO(beforeDate).getTime()
    return Math.min(1, Math.max(0.01, (Date.now() - periodStart) / (periodEnd - periodStart)))
}

/**
 * Percentage the bar is expected to reach once the period resets, extrapolated
 * from the pace so far. Without a cap there is nothing to project against.
 */
export const getUsageProjectedFill = (used: number, limit: number | null | undefined, afterDate: string, beforeDate: string): number =>
    limit == null || limit <= 0
        ? getUsageFill(used, limit)
        : Math.round((used / getUsageElapsed(afterDate, beforeDate) / limit) * 100)

/**
 * Whether the allowance is gone for the rest of the period, so whatever it pays
 * for stops working until the period resets.
 */
export const isUsageExhausted = (used: number, limit?: number | null): boolean =>
    limit != null && limit > 0 && used >= limit

/**
 * Whether to nudge towards raising the limits: the allowance already sits in the
 * warning zone, or the current pace runs it out before the period resets. A plan
 * without a cap, or one that includes no allowance at all, has nothing to run out
 * of and is left to the upgrade action on the plan itself.
 */
export const isUsageAtRisk = (used: number, limit: number | null | undefined, afterDate: string, beforeDate: string): boolean =>
    limit != null && limit > 0 && (
        getUsageColor(used, limit) !== USAGE_NEUTRAL_COLOR
        || getUsageProjectedFill(used, limit, afterDate, beforeDate) >= 100
    )

export interface UsageLimitEntry {
    title: string
    used: number
    limit?: number | null
}

/**
 * The entries that have entered the warning zone or run out before the period
 * resets, in the order they were given.
 */
export const getUsagesAtRisk = (usages: UsageLimitEntry[], afterDate: string, beforeDate: string): UsageLimitEntry[] =>
    usages.filter(usage => isUsageAtRisk(usage.used, usage.limit, afterDate, beforeDate))

/**
 * Headline for the entries at risk: a single metric is named, several are
 * summarised as the limits as a whole. An allowance that is already gone is
 * stated as a fact, everything else as what is about to happen.
 */
export const getUsageRiskTitle = (atRisk: UsageLimitEntry[]): string => {

    const exhausted = atRisk.filter(usage => isUsageExhausted(usage.used, usage.limit))

    if (exhausted.length > 0) return exhausted.length > 1
        ? "Your limits are used up"
        : `Your ${exhausted[0].title.toLowerCase()} are used up`

    return atRisk.length > 1 ? "Your limits are running out" : `Your ${atRisk[0]?.title.toLowerCase()} are running out`
}

/**
 * Sentence naming what runs out and how soon. Undefined while nothing is at
 * risk, so callers can leave their copy untouched.
 */
export const getUsageRiskDescription = (atRisk: UsageLimitEntry[], afterDate: string, beforeDate: string): string | undefined => {

    if (atRisk.length <= 0) return undefined

    const names = (usages: UsageLimitEntry[]) => usages.map(usage => usage.title.toLowerCase()).join(" and ")
    const exhausted = atRisk.filter(usage => isUsageExhausted(usage.used, usage.limit))
    const exceeding = atRisk.some(usage => getUsageProjectedFill(usage.used, usage.limit, afterDate, beforeDate) >= 100)

    if (exhausted.length > 0) return `Your ${names(exhausted)} are used up until this period resets.`

    return exceeding
        ? `Your ${names(atRisk)} will be used up before this period resets.`
        : `Your ${names(atRisk)} are close to their limit for this period.`
}

/**
 * Closing line of the warning card: raising the limits picks an exhausted
 * allowance back up, and keeps a shrinking one from ever stopping.
 */
export const getUsageRiskAdvice = (atRisk: UsageLimitEntry[]): string | undefined => {

    if (atRisk.length <= 0) return undefined

    return atRisk.some(usage => isUsageExhausted(usage.used, usage.limit))
        ? "Increase your limits to pick up where you left off."
        : "Increase your limits to avoid interruptions."
}

/**
 * Label for the upgrade action, taken from the entry that runs out first: what
 * already stopped once its allowance is gone, what is about to stop while it
 * still runs. Undefined while nothing is at risk, so callers can keep their own
 * invitation.
 */
export const getUsageUpgradeLabel = (atRisk: UsageLimitEntry[], afterDate: string, beforeDate: string): string | undefined => {

    if (atRisk.length <= 0) return undefined

    const projected = (usage: UsageLimitEntry) => getUsageProjectedFill(usage.used, usage.limit, afterDate, beforeDate)
    const worst = [...atRisk].sort((a, b) => projected(b) - projected(a))[0]
    const ai = worst.title === "AI tokens"

    if (isUsageExhausted(worst.used, worst.limit)) return ai ? "Get AI back" : "Get your flows running again"

    return projected(worst) >= 90
        ? ai ? "Don't lose AI access" : "Don't let your flows stop"
        : ai ? "Keep AI available" : "Keep your flows running"
}
