import {resourceFromAttributes} from "@opentelemetry/resources";

export const resource = resourceFromAttributes({
    ...(process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ? {'service.name': process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME} : {}),
    'service.version': (process.env.NEXT_PUBLIC_SCULPTOR_VERSION ?? "0.0.0") + "-" + (process.env.NEXT_PUBLIC_EDITION ?? "edition"),
    ...(process.env.NEXT_PUBLIC_OTEL_ENVIRONMENT ? {'deployment.environment.name': process.env.NEXT_PUBLIC_OTEL_ENVIRONMENT} : {}),
});

export const serverResource = resourceFromAttributes({
    ...(process.env.OTEL_SERVICE_NAME ? {'service.name': process.env.OTEL_SERVICE_NAME} : {}),
    'service.version': (process.env.NEXT_PUBLIC_SCULPTOR_VERSION ?? "0.0.0") + "-" + (process.env.NEXT_PUBLIC_EDITION ?? "edition"),
    ...(process.env.NEXT_PUBLIC_OTEL_ENVIRONMENT ? {'deployment.environment.name': process.env.NEXT_PUBLIC_OTEL_ENVIRONMENT} : {}),
});
