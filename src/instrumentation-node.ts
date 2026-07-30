import {logs} from '@opentelemetry/api-logs'
import {metrics, trace} from "@opentelemetry/api"
import initializeMetrics, {openTelemetryMetricProvider} from "@core/util/open-telemetry-metrics"
import initializeLogs, {openTelemetryServerLogsProvider} from "@core/util/open-telemetry-logs"
import initializeTraces, {openTelemetryServerTracesProvider} from "@core/util/open-telemetry-traces"

// Loaded exclusively from `instrumentation.ts` when NEXT_RUNTIME === "nodejs".
// Keeping the Node OTel SDK behind a dynamic import prevents it from being
// pulled into the Edge Runtime bundle (see instrumentation.ts).

if (openTelemetryMetricProvider) metrics.setGlobalMeterProvider(openTelemetryMetricProvider)
initializeMetrics()

if (openTelemetryServerLogsProvider) logs.setGlobalLoggerProvider(openTelemetryServerLogsProvider)
initializeLogs()

if (openTelemetryServerTracesProvider) trace.setGlobalTracerProvider(openTelemetryServerTracesProvider)
initializeTraces()
