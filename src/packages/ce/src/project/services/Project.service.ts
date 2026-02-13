import {
    DNamespaceProjectReactiveService,
    DNamespaceProjectView,
    DProjectDependencies,
    ReactiveArrayStore
} from "@code0-tech/pictor";
import {
    Mutation,
    NamespaceProject,
    NamespacesProjectsAssignRuntimesInput,
    NamespacesProjectsAssignRuntimesPayload,
    NamespacesProjectsCreateInput,
    NamespacesProjectsCreatePayload,
    NamespacesProjectsDeleteInput,
    NamespacesProjectsDeletePayload,
    Query
} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";
import projectsQuery from "./queries/Projects.query.graphql"
import projectCreateMutation from "./mutations/Project.create.mutation.graphql"
import {View} from "@code0-tech/pictor/dist/utils/view";

export class ProjectService extends DNamespaceProjectReactiveService {

    private readonly client: GraphqlClient
    private i = 0;

    constructor(client: GraphqlClient, store: ReactiveArrayStore<View<DNamespaceProjectView>>) {
        super(store);
        this.client = client
    }

    values(dependencies: DProjectDependencies): DNamespaceProjectView[] {
        const projects = super.values()
        if (!dependencies?.namespaceId) return projects

        const namespaceId = dependencies.namespaceId
        const filtered = projects.filter(p => p.namespace?.id === namespaceId)

        if (filtered.length === 0) {
            this.client.query<Query>({
                query: projectsQuery,
                variables: {
                    namespaceId,
                    firstProject: 50,
                    afterProject: null,
                },
            }).then(res => {
                const nodes = res.data?.namespace?.projects?.nodes ?? []
                nodes.forEach(project => {
                    if (
                        project &&
                        project.namespace?.id === namespaceId &&
                        !this.hasById(project.id)
                    ) {
                        this.set(this.i++, new View(new DNamespaceProjectView(project)))
                    }
                })
            })
        }

        return filtered
    }

    hasById(id: NamespaceProject["id"]): boolean {
        const project = super.values().find(p => p.id === id)
        return project !== undefined
    }

    async projectAssignRuntimes(payload: NamespacesProjectsAssignRuntimesInput): Promise<NamespacesProjectsAssignRuntimesPayload | undefined> {
        return Promise.resolve(undefined);
    }

    async projectCreate(payload: NamespacesProjectsCreateInput): Promise<NamespacesProjectsCreatePayload | undefined> {
        const result = await this.client.mutate<Mutation, NamespacesProjectsCreateInput>({
            mutation: projectCreateMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.namespacesProjectsCreate && result.data.namespacesProjectsCreate.namespaceProject) {
            const project = result.data.namespacesProjectsCreate.namespaceProject
            if (!this.hasById(project.id)) {
                this.add(new View(new DNamespaceProjectView(project)))
            }
        }

        return result.data?.namespacesProjectsCreate ?? undefined
    }

    async projectDelete(payload: NamespacesProjectsDeleteInput): Promise<NamespacesProjectsDeletePayload | undefined> {
        return Promise.resolve(undefined);
    }

}