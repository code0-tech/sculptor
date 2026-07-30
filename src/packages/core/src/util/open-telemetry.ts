import {resourceFromAttributes} from "@opentelemetry/resources";

/**
 * Runtime OpenTelemetry configuration for the browser. These values are served
 * by the `/api/config` route handler and read on the server at request
 * time, so they can be changed at runtime without rebuilding the app (unlike
 * `NEXT_PUBLIC_*` variables, which are inlined at build time).
 */
export interface ClientOtelConfig {
    tracesEndpoint?: string | null
    logsEndpoint?: string | null
    header?: string | null
    serviceName?: string | null
    environment?: string | null
    version?: string | null
    edition?: string | null
}

export const buildClientResource = (config: ClientOtelConfig) => resourceFromAttributes({
    ...(config.serviceName ? {'service.name': config.serviceName} : {}),
    'service.version': (config.version ?? "0.0.0") + "-" + (config.edition ?? "edition"),
    ...(config.environment ? {'deployment.environment.name': config.environment} : {}),
});

export const serverResource = resourceFromAttributes({
    ...(process.env.OTEL_SERVICE_NAME ? {'service.name': process.env.OTEL_SERVICE_NAME} : {}),
    'service.version': (process.env.NEXT_PUBLIC_SCULPTOR_VERSION ?? "0.0.0") + "-" + (process.env.NEXT_PUBLIC_EDITION ?? "edition"),
    ...(process.env.NEXT_PUBLIC_OTEL_ENVIRONMENT ? {'deployment.environment.name': process.env.NEXT_PUBLIC_OTEL_ENVIRONMENT} : {}),
});
