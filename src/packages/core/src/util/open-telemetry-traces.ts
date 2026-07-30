import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-http'
import {WebTracerProvider} from '@opentelemetry/sdk-trace-web'
import {BatchSpanProcessor} from '@opentelemetry/sdk-trace-base'
import {XMLHttpRequestInstrumentation} from '@opentelemetry/instrumentation-xml-http-request'
import {buildClientResource, ClientOtelConfig, serverResource} from "@core/util/open-telemetry"
import {registerInstrumentations} from '@opentelemetry/instrumentation'
import {FetchInstrumentation} from '@opentelemetry/instrumentation-fetch'
import {ZoneContextManager} from '@opentelemetry/context-zone'
import {trace} from "@opentelemetry/api"
import {parseHeaders} from "@core/util/headers";

export const openTelemetryServerTracesReader = process.env.OTEL_TRACES_ENDPOINT ? new OTLPTraceExporter({
    url: process.env.OTEL_TRACES_ENDPOINT,
    headers: parseHeaders(process.env.OTEL_HEADER),
}) : undefined

export const openTelemetryServerTracesProvider = openTelemetryServerTracesReader ? new WebTracerProvider({
    resource: serverResource,
    spanProcessors: [new BatchSpanProcessor(openTelemetryServerTracesReader)],
}) : undefined

export default () => {

    if (openTelemetryServerTracesProvider) {
        openTelemetryServerTracesProvider.register({
            contextManager: new ZoneContextManager(),
        })
    }
}

/**
 * Builds and registers the browser trace provider from runtime configuration.
 * Returns the provider so the caller can install it as the global tracer
 * provider, or undefined when tracing is not configured.
 */
export const initializeClientTraces = (config: ClientOtelConfig) => {

    if (!config.tracesEndpoint) return undefined

    const exporter = new OTLPTraceExporter({
        url: config.tracesEndpoint,
        headers: parseHeaders(config.header ?? undefined),
    })

    const provider = new WebTracerProvider({
        resource: buildClientResource(config),
        spanProcessors: [new BatchSpanProcessor(exporter)],
    })

    provider.register({
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

    trace.setGlobalTracerProvider(provider)

    return provider
}
