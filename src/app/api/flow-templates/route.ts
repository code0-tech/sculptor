import {NextResponse} from "next/server"
import {readFile} from "node:fs/promises"
import path from "node:path"
import {ValidationFlow} from "@code0-tech/tucana/shared"
import {mapFlowTemplates} from "@core/util/playground-mock"

export const dynamic = "force-dynamic"

export async function GET() {

    const dir = process.env.PLAYGROUND_MOCK_DIR

    const flows = dir ? await readFile(path.join(dir, "flows.json"), "utf-8")
        .then(raw => JSON.parse(raw) as ValidationFlow[])
        .catch(() => [] as ValidationFlow[]) : []

    return NextResponse.json({templates: mapFlowTemplates(flows)}, {headers: {"Cache-Control": "no-store"}})
}
