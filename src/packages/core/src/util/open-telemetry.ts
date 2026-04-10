import {resourceFromAttributes} from "@opentelemetry/resources";

export const resource = resourceFromAttributes({
    'service.name': process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME || "service.name",
    'service.version': (process.env.NEXT_PUBLIC_SCULPTOR_VERSION ?? "0.0.0") + "-" + (process.env.NEXT_PUBLIC_EDITION ?? "edition"),
    'deployment.environment.name': process.env.NEXT_PUBLIC_OTEL_ENVIRONMENT || "deployment.environment.name",
});

export const serverResource = resourceFromAttributes({
    'service.name': process.env.OTEL_SERVICE_NAME || "service.name",
    'service.version': (process.env.NEXT_PUBLIC_SCULPTOR_VERSION ?? "0.0.0") + "-" + (process.env.NEXT_PUBLIC_EDITION ?? "edition"),
    'deployment.environment.name': process.env.NEXT_PUBLIC_OTEL_ENVIRONMENT || "deployment.environment.name",
});
