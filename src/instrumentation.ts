export async function register() {

    // The OpenTelemetry Node SDK (metrics, logs, traces) relies on Node.js APIs
    // such as `process.cpuUsage`, which are not available in the Edge Runtime.
    // Next.js runs `register()` for every runtime (including the Edge runtime
    // used by `middleware.ts`), so we must only load the Node instrumentation
    // when actually running under Node. Using a dynamic import keeps the Node
    // SDK out of the Edge bundle entirely.
    if (process.env.NEXT_RUNTIME === "nodejs") {
        await import("./instrumentation-node")
    }

}
