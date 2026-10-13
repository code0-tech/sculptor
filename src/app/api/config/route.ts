import {NextResponse} from "next/server"
import {ClientOtelConfig} from "@core/util/open-telemetry"

// Evaluate on every request so the values reflect the current runtime
// environment rather than being cached from build/first render.
export const dynamic = "force-dynamic"

interface UpgradeBenefit {
    icon: string
    title: string
    text: string
}

const upgradeBenefitDefaults: UpgradeBenefit[] = [
    {
        icon: "bolt",
        title: "Up to 10k executions",
        text: "Run your flows without hitting the execution cap of this workspace.",
    },
    {
        icon: "sparkles",
        title: "Up to 4mio AI tokens",
        text: "Higher token limits for AI actions across the whole workspace.",
    },
    {
        icon: "adjustments",
        title: "Limits that fit you",
        text: "Scale executions and AI as you grow. Pro, Max or fully custom.",
    },
    {
        icon: "headset",
        title: "Priority support",
        text: "Get faster help from our team when it matters most.",
    },
]

/**
 * Serves the browser OpenTelemetry configuration from server-side environment
 * variables at request time. This lets the client telemetry endpoints be
 * configured at runtime instead of being inlined into the bundle at build time.
 */
export function GET() {

    const config: ClientOtelConfig & {
        subscriptionUrl: string | null,
        checkoutUrl: string | null,
        upgradeVisibilityDays: number,
        upgradeDescription: string,
        upgradeBenefits: UpgradeBenefit[],
        upgradePriceLabel: string,
        upgradeCtaLabel: string,
        upgradeDiscountCode: string,
        upgradeDiscountLabel: string,
        upgradeDiscountHint: string,
        upgradeBasePrice: number,
        upgradeDiscountedPrice: number,
        upgradeDiscountDurationMinutes: number,
        upgradeDiscountDelaySeconds: number
    } = {
        tracesEndpoint: process.env.NEXT_PUBLIC_OTEL_TRACES_ENDPOINT ?? null,
        logsEndpoint: process.env.NEXT_PUBLIC_OTEL_LOGS_ENDPOINT ?? null,
        header: process.env.NEXT_PUBLIC_OTEL_HEADER ?? null,
        serviceName: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ?? null,
        environment: process.env.NEXT_PUBLIC_OTEL_ENVIRONMENT ?? null,
        version: process.env.NEXT_PUBLIC_SCULPTOR_VERSION ?? "0.0.0",
        edition: process.env.NEXT_PUBLIC_EDITION ?? "edition",
        subscriptionUrl: process.env.SUBSCRIPTION_URL ?? null,
        checkoutUrl: process.env.CHECKOUT_URL ?? null,
        upgradeVisibilityDays: Number(process.env.UPGRADE_VISIBILITY_DAYS) || 7,
        upgradeDescription: process.env.UPGRADE_DESCRIPTION
            || "Unlock higher limits for executions and AI usage.\nPick the plan that fits. Pro, Max or fully custom.",
        upgradeBenefits: upgradeBenefitDefaults.map((benefit, index) => ({
            icon: process.env[`UPGRADE_BENEFIT_ICON_${index + 1}`] || benefit.icon,
            title: process.env[`UPGRADE_BENEFIT_TITLE_${index + 1}`] || benefit.title,
            text: process.env[`UPGRADE_BENEFIT_TEXT_${index + 1}`] || benefit.text,
        })),
        upgradePriceLabel: process.env.UPGRADE_PRICE_LABEL || "Full access starts at",
        upgradeCtaLabel: process.env.UPGRADE_CTA_LABEL || "Choose your plan",
        upgradeDiscountCode: process.env.UPGRADE_DISCOUNT_CODE || "HELLO20",
        upgradeDiscountLabel: process.env.UPGRADE_DISCOUNT_LABEL || "20% off",
        upgradeDiscountHint: process.env.UPGRADE_DISCOUNT_HINT || "Once the timer runs out, this code is gone.",
        upgradeBasePrice: Number(process.env.UPGRADE_BASE_PRICE) || 8.95,
        upgradeDiscountedPrice: Number(process.env.UPGRADE_DISCOUNTED_PRICE) || 7.16,
        upgradeDiscountDurationMinutes: Number(process.env.UPGRADE_DISCOUNT_DURATION_MINUTES) || 30,
        upgradeDiscountDelaySeconds: Number(process.env.UPGRADE_DISCOUNT_DELAY_SECONDS) || 1.5,
    }

    return NextResponse.json(config, {
        headers: {"Cache-Control": "no-store"},
    })
}
