import {NextResponse} from "next/server"
import {readFile, readdir} from "node:fs/promises"
import path from "node:path"
import {Module, ValidationFlow} from "@code0-tech/tucana/shared"
import {mapDatatypes, mapFlows, mapFlowtypes, mapFunctions, mapModules, project} from "@core/util/playground-mock"

export const dynamic = "force-dynamic"

export async function GET() {

    const readModules = async (from: string): Promise<Module[]> => {
        const modulesDir = path.join(from, "modules")
        const files = await readdir(modulesDir)
            .then(names => names.filter(name => name.endsWith(".json")).sort())
            .catch(() => [] as string[])
        return Promise.all(files.map(async file => JSON.parse(await readFile(path.join(modulesDir, file), "utf-8")) as Module))
    }

    const readFlows = async (from: string): Promise<ValidationFlow[]> =>
        readFile(path.join(from, "flows.json"), "utf-8")
            .then(raw => JSON.parse(raw) as ValidationFlow[])
            .catch(() => [] as ValidationFlow[])

    const dir = process.env.PLAYGROUND_MOCK_DIR
    if (!dir) {
        return new NextResponse(null, {status: 404, headers: {"Cache-Control": "no-store"}})
    }

    const [modules, flows] = await Promise.all([readModules(dir), readFlows(dir)])

    return NextResponse.json({
        flows: mapFlows(modules, flows),
        functions: mapFunctions(modules),
        datatypes: mapDatatypes(modules),
        flowtypes: mapFlowtypes(modules),
        modules: mapModules(modules),
        projects: [project]
    }, {headers: {"Cache-Control": "no-store"}})
}
