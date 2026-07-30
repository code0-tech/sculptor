import "@opentelemetry/api-logs"
import {ClientOtelConfig} from "@core/util/open-telemetry"
import {initializeClientLogs} from "@core/util/open-telemetry-logs"
import {initializeClientTraces} from "@core/util/open-telemetry-traces"

// The browser OpenTelemetry configuration is fetched from the server at runtime
// (see /api/config) instead of relying on build-time inlined NEXT_PUBLIC_*
// variables, so the collector endpoints can be changed without rebuilding.
fetch("/api/config")
    .then((response) => response.json())
    .then((config: ClientOtelConfig) => {
        initializeClientLogs(config)
        initializeClientTraces(config)
    })
    .catch(() => {
        // Telemetry is best-effort; ignore config fetch/initialization failures.
    })
