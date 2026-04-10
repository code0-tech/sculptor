import {OTLPLogExporter} from "@opentelemetry/exporter-logs-otlp-http"
import {BatchLogRecordProcessor, LoggerProvider} from "@opentelemetry/sdk-logs"
import {resource, serverResource} from "@core/util/open-telemetry"
import {recordException} from "@core/util/open-telemetry-exceptions"
import {parseHeaders} from "@core/util/headers";

export const openTelemetryServerLogsReader = new OTLPLogExporter({
    url: process.env.OTEL_LOGS_ENDPOINT,
    headers: parseHeaders(process.env.OTEL_HEADER),
})

export const openTelemetryClientLogsReader = new OTLPLogExporter({
    url: process.env.NEXT_PUBLIC_OTEL_LOGS_ENDPOINT,
    headers: parseHeaders(process.env.NEXT_PUBLIC_OTEL_HEADER),
})

export const openTelemetryServerLogsProvider = new LoggerProvider({
    resource: serverResource,
    processors: [new BatchLogRecordProcessor(openTelemetryServerLogsReader)]
})

export const openTelemetryClientLogsProvider = new LoggerProvider({
    resource: resource,
    processors: [new BatchLogRecordProcessor(openTelemetryClientLogsReader)]
})

export default (level: 'server' | "client" = "server") => {

    const logger = level === "server" ?
        openTelemetryServerLogsProvider.getLogger("default", "1.0.0") :
        openTelemetryClientLogsProvider.getLogger("default", "1.0.0")

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

            logger.emit({
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

            logger.emit({
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

            logger.emit({
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

            logger.emit({
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

            logger.emit({
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