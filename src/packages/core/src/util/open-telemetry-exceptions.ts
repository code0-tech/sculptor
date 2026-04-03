import {trace} from '@opentelemetry/api'

export const recordException = (error: Error | string, context?: Record<string, any>) => {
    try {
        const tracer = trace.getTracer('exception-recorder', '1.0.0')
        const span = tracer.startSpan('exception')

        span.recordException(error instanceof Error ? error : new Error(String(error)))

        if (context) {
            Object.entries(context).forEach(([key, value]) => {
                span.setAttribute(`error.${key}`, String(value))
            })
        }

        span.setStatus({code: 2})
        span.end()
    } catch (e) {
    }
}

