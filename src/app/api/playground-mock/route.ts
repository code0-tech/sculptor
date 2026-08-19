import {NextResponse} from "next/server"
import {readFile} from "node:fs/promises"
import path from "node:path"

export const dynamic = "force-dynamic"

export async function GET() {

    const dir = process.env.PLAYGROUND_MOCK_DIR
    const datasets = ["flows", "functions", "datatypes", "flowtypes", "projects"] as const

    const entries = await Promise.all(datasets.map(async name => {
        if (!dir) return [name, []] as const
        try {
            const raw = await readFile(path.join(dir, `${name}.json`), "utf-8")
            return [name, JSON.parse(raw)] as const
        } catch {
            return [name, []] as const
        }
    }))

    return NextResponse.json(Object.fromEntries(entries), {
        headers: {"Cache-Control": "no-store"},
    })
}
