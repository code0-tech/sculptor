import {License} from "@code0-tech/sagittarius-graphql-types";
import {addMonths, differenceInMonths, format, isFuture, isPast, parseISO, startOfMonth} from "date-fns";

/**
 * Display names for the license enums. Keyed by the raw enum value because the
 * generated types are ambient const enums and cannot be read as values.
 */
export const licensePlanNames: Record<string, string> = {
    PRO: "Pro",
    MAX: "Max",
    CUSTOM: "Custom",
}

export const licensePaymentPeriodNames: Record<string, string> = {
    MONTHLY: "Monthly",
    QUARTERLY: "Quarterly",
    YEARLY: "Yearly",
}

export const licenseCustomerTypeNames: Record<string, string> = {
    BUSINESS: "Business",
    PERSONAL: "Personal",
}

/**
 * A license only counts as active while now lies inside its validity window.
 */
export const isLicenseActive = (license: License | null | undefined): boolean =>
    !!license?.startDate && !!license?.endDate && isPast(license.startDate) && isFuture(license.endDate)

/**
 * Licenses bought through checkout carry a plan, self-hosted keys do not. The
 * fallback names the edition the license unlocks instead.
 */
export const getLicenseName = (license: License | null | undefined, fallback: string): string => {
    const plan = license?.options?.plan
    return plan ? `${licensePlanNames[plan] ?? plan} plan` : fallback
}

/**
 * Entitlements reset every month, counted from the day the license started.
 * Without a license the calendar month is the next best approximation.
 */
export const getLicensePeriod = (startDate?: string | null): { afterDate: string, beforeDate: string } => {
    const now = new Date()
    const start = startDate ? parseISO(startDate) : undefined
    const periodStart = start ? addMonths(start, differenceInMonths(now, start)) : startOfMonth(now)
    const periodEnd = addMonths(periodStart, 1)

    return {
        afterDate: format(periodStart, "yyyy-MM-dd"),
        beforeDate: format(periodEnd, "yyyy-MM-dd")
    }
}
