import {NextResponse} from "next/server"
import {readFile, readdir} from "node:fs/promises"
import path from "node:path"
import {FlowTemplate} from "@core/util/flow-template"

export const dynamic = "force-dynamic"

export async function GET() {

    const dir = process.env.FLOW_TEMPLATES_DIR
        ? path.resolve(process.cwd(), process.env.FLOW_TEMPLATES_DIR)
        : path.join(process.cwd(), "templates")

    // The slug identifies a template in the create dialog. It is derived from the file path
    // so that mounted templates can carry the same name as a shipped one without colliding.
    const slug = (file: string) => file.split(path.sep).join("/").replace(/\.json$/, "")

    const readTemplate = async (file: string): Promise<FlowTemplate | undefined> => {
        const template = await readFile(path.join(dir, file), "utf-8")
            .then(raw => JSON.parse(raw) as Partial<FlowTemplate>)
            .catch(() => undefined)

        if (!template?.name || !template?.flowTypeIdentifier || !template?.startingNodeId || !Array.isArray(template?.nodes)) {
            console.warn(`Skipping flow template ${file}: name, flowTypeIdentifier, startingNodeId and nodes are required`)
            return undefined
        }

        return {
            slug: template.slug ?? slug(file),
            name: template.name,
            description: template.description ?? "",
            flowTypeIdentifier: template.flowTypeIdentifier,
            signature: template.signature ?? "",
            startingNodeId: template.startingNodeId,
            nodes: template.nodes,
            settings: template.settings ?? []
        }
    }

    const files = await readdir(dir, {recursive: true})
        .then(names => names.filter(name => name.endsWith(".json")).sort())
        .catch(() => [] as string[])

    const templates = await Promise.all(files.map(readTemplate))

    return NextResponse.json({
        templates: templates.filter((template): template is FlowTemplate => !!template)
    }, {headers: {"Cache-Control": "no-store"}})
}
