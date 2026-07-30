import {OTLPLogExporter} from "@opentelemetry/exporter-logs-otlp-http"
import {BatchLogRecordProcessor, LoggerProvider} from "@opentelemetry/sdk-logs"
import {buildClientResource, ClientOtelConfig, serverResource} from "@core/util/open-telemetry"
import {recordException} from "@core/util/open-telemetry-exceptions"
import {logs} from "@opentelemetry/api-logs"
import {parseHeaders} from "@core/util/headers";

export const openTelemetryServerLogsReader = process.env.OTEL_LOGS_ENDPOINT ? new OTLPLogExporter({
    url: process.env.OTEL_LOGS_ENDPOINT,
    headers: parseHeaders(process.env.OTEL_HEADER),
}) : undefined

export const openTelemetryServerLogsProvider = openTelemetryServerLogsReader ? new LoggerProvider({
    resource: serverResource,
    processors: [new BatchLogRecordProcessor(openTelemetryServerLogsReader)]
}) : undefined

/**
 * Patches the global `console` methods to forward messages to the given
 * OpenTelemetry logger provider (in addition to the original console output).
 */
const instrumentConsole = (provider: LoggerProvider) => {

    const logger = provider.getLogger("default", "1.0.0")

    const originalConsole = {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
        debug: console.debug,
    }

    const SeverityNumber = {
        DEBUG: 5,
        INFO: 9,
        WARN: 13,
        ERROR: 17,
    }

    console.log = function (...args: any[]) {

        try {
            const message = args
                .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
                .join(" ")

            logger?.emit({
                severityNumber: SeverityNumber.INFO,
                severityText: "INFO",
                body: message,
                attributes: {},
            })
        } catch (e) {
        }


        originalConsole.log.apply(console, args)
    }

    console.info = function (...args: any[]) {

        try {
            const message = args
                .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
                .join(" ")

            logger?.emit({
                severityNumber: SeverityNumber.INFO,
                severityText: "INFO",
                body: message,
                attributes: {},
            })
        } catch (e) {
        }

        originalConsole.info.apply(console, args)
    }

    console.warn = function (...args: any[]) {

        try {
            const message = args
                .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
                .join(" ")

            logger?.emit({
                severityNumber: SeverityNumber.WARN,
                severityText: "WARN",
                body: message,
                attributes: {},
            })
        } catch (e) {
        }

        originalConsole.warn.apply(console, args)
    }

    console.error = function (...args: any[]) {

        try {
            const message = args
                .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
                .join(" ")

            logger?.emit({
                severityNumber: SeverityNumber.ERROR,
                severityText: "ERROR",
                body: message,
                attributes: {},
            })
        } catch (e) {
        }

        const errorArg = args.find((arg) => arg instanceof Error)
        recordException(errorArg || `${args}`)

        originalConsole.error.apply(console, args)
    }

    console.debug = function (...args: any[]) {

        try {
            const message = args
                .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
                .join(" ")

            logger?.emit({
                severityNumber: SeverityNumber.DEBUG,
                severityText: "DEBUG",
                body: message,
                attributes: {},
            })
        } catch (e) {
        }

        originalConsole.debug.apply(console, args)
    }

}

export default () => {

    if (!openTelemetryServerLogsProvider) return
    instrumentConsole(openTelemetryServerLogsProvider)
}

/**
 * Builds and registers the browser logger provider from runtime configuration,
 * then patches `console` to forward log records to it. Returns the provider, or
 * undefined when logging is not configured.
 */
export const initializeClientLogs = (config: ClientOtelConfig) => {

    if (!config.logsEndpoint) return undefined

    const exporter = new OTLPLogExporter({
        url: config.logsEndpoint,
        headers: parseHeaders(config.header ?? undefined),
    })

    const provider = new LoggerProvider({
        resource: buildClientResource(config),
        processors: [new BatchLogRecordProcessor(exporter)]
    })

    logs.setGlobalLoggerProvider(provider)
    instrumentConsole(provider)

    return provider
}
