import {MeterProvider, PeriodicExportingMetricReader} from "@opentelemetry/sdk-metrics"
import {serverResource} from "@core/util/open-telemetry"
import {OTLPMetricExporter} from "@opentelemetry/exporter-metrics-otlp-http"
import {parseHeaders} from "@core/util/headers";


export const openTelemetryMetricReader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({

        url: process.env.OTEL_METRICS_ENDPOINT,
        headers: parseHeaders(process.env.OTEL_HEADER),
    }),
    exportIntervalMillis: 10000,
})

export const openTelemetryMetricProvider = new MeterProvider({
    resource: serverResource,
    readers: [openTelemetryMetricReader],
})

export default () => {

    const g = globalThis as any
    const proc = g['process']

    if (typeof globalThis === 'undefined' || !(globalThis as any).process) return
    if (!proc || typeof proc['cpuUsage'] !== 'function') return


    const meter = openTelemetryMetricProvider.getMeter('process-metrics', '1.0.0')

    const cpuUsageGauge = meter.createObservableGauge('process.cpu.percent', {
        description: 'CPU usage as percentage',
        unit: '%',
    })

    const memoryUsageGauge = meter.createObservableGauge('process.memory.mb', {
        description: 'Memory usage in megabytes',
        unit: 'MB',
    })

    let previousCpuUsage = proc['cpuUsage']()
    let previousTime = Date.now()

    meter.addBatchObservableCallback(
        (batchObservableCallback) => {
            try {
                const p = g['process']
                if (!p) return

                const now = Date.now()
                const currentCpuUsage = p['cpuUsage'](previousCpuUsage)
                const timeDiff = (now - previousTime) / 1000

                if (timeDiff > 0) {
                    const totalCpuTime = (currentCpuUsage.user + currentCpuUsage.system) / 1_000_000
                    const cpuUsagePercent = Math.min(100, (totalCpuTime / timeDiff) * 100)
                    batchObservableCallback.observe(cpuUsageGauge, cpuUsagePercent)
                }

                previousCpuUsage = p['cpuUsage']()
                previousTime = now

                const memUsage = p['memoryUsage']()
                const memoryMB = memUsage.heapUsed / 1024 / 1024
                batchObservableCallback.observe(memoryUsageGauge, memoryMB)
            } catch (error) {
            }
        },
        [cpuUsageGauge, memoryUsageGauge],
    )

}