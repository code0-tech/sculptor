import "@opentelemetry/api-logs"
import initializeLogs, {openTelemetryClientLogsProvider} from "@core/util/open-telemetry-logs"
import initializeTraces, {openTelemetryClientTracesProvider} from "@core/util/open-telemetry-traces"
import {logs} from "@opentelemetry/api-logs"
import {trace} from "@opentelemetry/api"

initializeLogs("client")
if (openTelemetryClientLogsProvider) logs.setGlobalLoggerProvider(openTelemetryClientLogsProvider)

initializeTraces("client")
if (openTelemetryClientTracesProvider) trace.setGlobalTracerProvider(openTelemetryClientTracesProvider)