import "@opentelemetry/api-logs"
import initializeLogs, {openTelemetryClientLogsProvider} from "@core/util/open-telemetry-logs"
import initializeTraces, {openTelemetryClientTracesProvider} from "@core/util/open-telemetry-traces"
import {logs} from "@opentelemetry/api-logs"
import {trace} from "@opentelemetry/api"

initializeLogs("client")
logs.setGlobalLoggerProvider(openTelemetryClientLogsProvider)

initializeTraces("client")
trace.setGlobalTracerProvider(openTelemetryClientTracesProvider)