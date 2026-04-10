import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-http'
import {WebTracerProvider} from '@opentelemetry/sdk-trace-web'
import {BatchSpanProcessor} from '@opentelemetry/sdk-trace-base'
import {XMLHttpRequestInstrumentation} from '@opentelemetry/instrumentation-xml-http-request'
import {resource, serverResource} from "@core/util/open-telemetry"
import {registerInstrumentations} from '@opentelemetry/instrumentation'
import {FetchInstrumentation} from '@opentelemetry/instrumentation-fetch'
import {ZoneContextManager} from '@opentelemetry/context-zone'
import {parseHeaders} from "@core/util/headers";

export const openTelemetryServerTracesReader = process.env.OTEL_TRACES_ENDPOINT ? new OTLPTraceExporter({
    url: process.env.OTEL_TRACES_ENDPOINT,
    headers: parseHeaders(process.env.OTEL_HEADER),
}) : undefined

export const openTelemetryClientTracesReader = process.env.NEXT_PUBLIC_OTEL_TRACES_ENDPOINT ? new OTLPTraceExporter({
    url: process.env.NEXT_PUBLIC_OTEL_TRACES_ENDPOINT || "",
    headers: parseHeaders(process.env.NEXT_PUBLIC_OTEL_HEADER),
}) : undefined

export const openTelemetryServerTracesProvider = openTelemetryServerTracesReader ? new WebTracerProvider({
    resource: serverResource,
    spanProcessors: [new BatchSpanProcessor(openTelemetryServerTracesReader)],
}) : undefined

export const openTelemetryClientTracesProvider = openTelemetryClientTracesReader ? new WebTracerProvider({
    resource: resource,
    spanProcessors: [new BatchSpanProcessor(openTelemetryClientTracesReader)],
}) : undefined

export default (level: 'server' | "client" = "server") => {

    if (level === 'server' && openTelemetryServerTracesProvider) {
        openTelemetryServerTracesProvider.register({
            contextManager: new ZoneContextManager(),
        })
    } else if (level === 'client' && openTelemetryClientTracesProvider) {
        openTelemetryClientTracesProvider.register({
            contextManager: new ZoneContextManager(),
        })

        registerInstrumentations({
            instrumentations: [
                new FetchInstrumentation({
                    propagateTraceHeaderCorsUrls: /.*/,
                }),
                new XMLHttpRequestInstrumentation({
                    propagateTraceHeaderCorsUrls: /.*/,
                }),
            ],
        })
    }

}