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

export class ProjectService extends DNamespaceProjectReactiveService {

    private readonly client: GraphqlClient
    private i = 0;

    constructor(client: GraphqlClient, store: ReactiveArrayStore<DNamespaceProjectView>) {
        super(store);
        this.client = client
    }

    values(dependencies: DProjectDependencies): DNamespaceProjectView[] {
        if (super.values().length > 0) return super.values()
        this.client.query<Query>({
            query: projectsQuery,
            variables: {
                namespaceId: dependencies?.namespaceId,
                firstProject: 0,
                afterProject: null,
            },
        }).then(result => {
            const data = result.data
            if (!data) return

            if (data.namespace && data.namespace.projects && data.namespace.projects.nodes) {
                data.namespace.projects.nodes.forEach((project) => {
                    if (project) this.set(this.i++, new DNamespaceProjectView(project))
                })
            }
        })

        return super.values(dependencies);
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
                this.add(new DNamespaceProjectView(project))
            }
        }

        return result.data?.namespacesProjectsCreate ?? undefined
    }

    async projectDelete(payload: NamespacesProjectsDeleteInput): Promise<NamespacesProjectsDeletePayload | undefined> {
        return Promise.resolve(undefined);
    }

}