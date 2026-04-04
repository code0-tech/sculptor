import {logs} from '@opentelemetry/api-logs'
import {metrics, trace} from "@opentelemetry/api"
import initializeMetrics, {openTelemetryMetricProvider} from "@core/util/open-telemetry-metrics"
import initializeLogs, {openTelemetryServerLogsProvider} from "@core/util/open-telemetry-logs"
import initializeTraces, {openTelemetryServerTracesProvider} from "@core/util/open-telemetry-traces"

export function register() {


    metrics.setGlobalMeterProvider(openTelemetryMetricProvider)
    initializeMetrics()

    logs.setGlobalLoggerProvider(openTelemetryServerLogsProvider)
    initializeLogs()

    trace.setGlobalTracerProvider(openTelemetryServerTracesProvider)
    initializeTraces()


}






