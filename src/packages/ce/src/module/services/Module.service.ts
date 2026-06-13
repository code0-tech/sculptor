import {ReactiveArrayService, ReactiveArrayStore} from "@code0-tech/pictor";
import {Namespace, NamespaceProject, Query, Runtime, RuntimeModule} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";
import {View} from "@code0-tech/pictor/dist/utils/view";
import modulesQuery from "@edition/module/services/queries/Modules.query.graphql"

export type ModuleDependencies = {
    namespaceId: Namespace['id']
    projectId: NamespaceProject['id']
    runtimeId: Runtime['id']
}

export class ModuleService extends ReactiveArrayService<RuntimeModule, ModuleDependencies> {

    private readonly client: GraphqlClient
    private i = 0

    constructor(client: GraphqlClient, store: ReactiveArrayStore<View<RuntimeModule>>) {
        super(store)
        this.client = client
    }

    values(dependencies?: ModuleDependencies): RuntimeModule[] {
        const modules = super.values()
        if (!dependencies?.namespaceId || !dependencies.projectId) return modules

        const filtered = modules.filter(m => m.runtime?.id === dependencies.runtimeId)

        if (filtered.length <= 0) {
            this.client.query<Query>({
                query: modulesQuery,
                variables: {
                    namespaceId: dependencies?.namespaceId,
                    projectId: dependencies.projectId,

                    firstRuntime: 50,
                    afterRuntime: null,

                    firstModule: 50,
                    afterModule: null,

                    firstConfiguration: 50,
                    afterConfiguration: null,

                    firstDefinition: 50,
                    afterDefinition: null
                }
            }).then(res => {
                const nodes = res.data?.namespace?.project?.runtimes?.nodes?.flatMap(runtime => runtime?.modules?.nodes ?? []) ?? []
                nodes.forEach(module => {
                    if (module && !this.hasById(module.id)) {
                        this.set(this.i++, new View(module))
                    }
                })
            })
        }

        return filtered
    }

    hasById(id: RuntimeModule["id"]): boolean {
        const module = super.values().find(m => m.id === id)
        return module !== undefined
    }

    getById(id: RuntimeModule['id'], dependencies?: ModuleDependencies): RuntimeModule | undefined {
        return this.values(dependencies).find(module => module.id === id)
    }

}