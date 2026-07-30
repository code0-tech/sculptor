import {NextResponse} from "next/server"
import {ClientOtelConfig} from "@core/util/open-telemetry"

// Evaluate on every request so the values reflect the current runtime
// environment rather than being cached from build/first render.
export const dynamic = "force-dynamic"

/**
 * Serves the browser OpenTelemetry configuration from server-side environment
 * variables at request time. This lets the client telemetry endpoints be
 * configured at runtime instead of being inlined into the bundle at build time.
 */
export function GET() {

    const config: ClientOtelConfig = {
        tracesEndpoint: process.env.NEXT_PUBLIC_OTEL_TRACES_ENDPOINT ?? null,
        logsEndpoint: process.env.NEXT_PUBLIC_OTEL_LOGS_ENDPOINT ?? null,
        header: process.env.NEXT_PUBLIC_OTEL_HEADER ?? null,
        serviceName: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ?? null,
        environment: process.env.NEXT_PUBLIC_OTEL_ENVIRONMENT ?? null,
        version: process.env.NEXT_PUBLIC_SCULPTOR_VERSION ?? "0.0.0",
        edition: process.env.NEXT_PUBLIC_EDITION ?? "edition",
    }

    return NextResponse.json(config, {
        headers: {"Cache-Control": "no-store"},
    })
}
