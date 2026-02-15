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
    NamespacesProjectsUpdateInput,
    NamespacesProjectsUpdatePayload,
    Query
} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";
import projectsQuery from "./queries/Projects.query.graphql"
import projectCreateMutation from "./mutations/Project.create.mutation.graphql"
import projectDeleteMutation from "./mutations/Project.delete.mutation.graphql"
import projectUpdateMutation from "./mutations/Project.update.mutation.graphql"
import projectAssignRuntimesMutation from "./mutations/Project.assignRuntimes.mutation.graphql"
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
        const result = await this.client.mutate<Mutation, NamespacesProjectsAssignRuntimesInput>({
            mutation: projectAssignRuntimesMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.namespacesProjectsAssignRuntimes && result.data.namespacesProjectsAssignRuntimes.namespaceProject) {
            const project = result.data.namespacesProjectsAssignRuntimes.namespaceProject
            const index = this.values({namespaceId: project?.namespace?.id}).findIndex(o => o.id === project.id)
            const projectStored = this.values({namespaceId: project?.namespace?.id}).find(o => o.id === project.id)
            this.set(index, new View(new DNamespaceProjectView({
                ...projectStored?.json(),
                runtimes: {
                    count: payload.runtimeIds.length,
                    nodes: payload.runtimeIds.map(runtimeId => ({ id: runtimeId }))
                }
            })))

        }

        return result.data?.namespacesProjectsAssignRuntimes ?? undefined
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
        const result = await this.client.mutate<Mutation, NamespacesProjectsDeleteInput>({
            mutation: projectDeleteMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.namespacesProjectsDelete && result.data.namespacesProjectsDelete.namespaceProject) {
            const project = result.data.namespacesProjectsDelete.namespaceProject
            const index = this.values({namespaceId: project?.namespace?.id}).findIndex(o => o.id === project.id)
            this.delete(index)

        }

        return result.data?.namespacesProjectsDelete ?? undefined
    }

    async projectUpdate(payload: NamespacesProjectsUpdateInput): Promise<NamespacesProjectsUpdatePayload | undefined> {
        const result = await this.client.mutate<Mutation, NamespacesProjectsUpdateInput>({
            mutation: projectUpdateMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.namespacesProjectsUpdate && result.data.namespacesProjectsUpdate.namespaceProject) {
            const project = result.data.namespacesProjectsUpdate.namespaceProject
            const index = this.values({namespaceId: project?.namespace?.id}).findIndex(o => o.id === project.id)
            const projectStored = this.values({namespaceId: project?.namespace?.id}).find(o => o.id === project.id)
            this.set(index, new View(new DNamespaceProjectView({
                ...projectStored?.json(),
                ...(payload.name ? {name: payload.name} : {}),
                ...(payload.description ? {description: payload.description} : {}),
                ...(payload.slug ? {slug: payload.slug} : {}),
                ...(payload.primaryRuntimeId ? {primaryRuntime: {id: payload.primaryRuntimeId}} : {}),
            })))

        }

        return result.data?.namespacesProjectsUpdate ?? undefined
    }

}