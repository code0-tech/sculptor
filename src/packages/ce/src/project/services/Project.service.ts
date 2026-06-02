import {ReactiveArrayService, ReactiveArrayStore} from "@code0-tech/pictor";
import {
    Mutation,
    Namespace,
    NamespaceProject,
    NamespacesProjectsAssignRuntimesInput,
    NamespacesProjectsAssignRuntimesPayload,
    NamespacesProjectsCreateInput,
    NamespacesProjectsCreatePayload,
    NamespacesProjectsDeleteInput,
    NamespacesProjectsDeletePayload,
    NamespacesProjectsRuntimeAssignmentsUpdateModuleConfigurationsInput,
    NamespacesProjectsRuntimeAssignmentsUpdateModuleConfigurationsPayload,
    NamespacesProjectsUpdateInput,
    NamespacesProjectsUpdatePayload,
    Query
} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";
import projectsQuery from "@edition/project/services/queries/Projects.query.graphql"
import projectCreateMutation from "@edition/project/services/mutations/Project.create.mutation.graphql"
import projectDeleteMutation from "@edition/project/services/mutations/Project.delete.mutation.graphql"
import projectUpdateMutation from "@edition/project/services/mutations/Project.update.mutation.graphql"
import projectAssignRuntimesMutation from "@edition/project/services/mutations/Project.assignRuntimes.mutation.graphql"
import projectUpdateModuleConfigurationMutation
    from "@edition/project/services/mutations/Project.updateModuleConfiguration.graphql"
import {View} from "@code0-tech/pictor/dist/utils/view";

export type ProjectDependencies = {
    namespaceId: Namespace['id']
}

export class ProjectService extends ReactiveArrayService<NamespaceProject, ProjectDependencies> {

    private readonly client: GraphqlClient
    private i = 0;

    constructor(client: GraphqlClient, store: ReactiveArrayStore<View<NamespaceProject>>) {
        super(store);
        this.client = client
    }

    values(dependencies: ProjectDependencies): NamespaceProject[] {
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
                        this.set(this.i++, new View(project))
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

    getById(id: NamespaceProject['id'], dependencies?: ProjectDependencies): NamespaceProject | undefined {
        return this.values(dependencies!).find(project => project && project.id === id)
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
            this.set(index, new View({
                ...projectStored,
                runtimes: {
                    count: payload.runtimeIds.length,
                    nodes: payload.runtimeIds.map(runtimeId => ({id: runtimeId}))
                },
                primaryRuntime: result.data.namespacesProjectsAssignRuntimes.namespaceProject.primaryRuntime
            }))

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
                this.add(new View(project))
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
            this.set(index, new View({
                ...projectStored,
                ...(payload.name ? {name: payload.name} : {}),
                ...(payload.description ? {description: payload.description} : {}),
                ...(payload.slug ? {slug: payload.slug} : {}),
                ...(payload.primaryRuntimeId ? {primaryRuntime: {id: payload.primaryRuntimeId}} : {}),
            }))

        }

        return result.data?.namespacesProjectsUpdate ?? undefined
    }

    async projectModuleConfigurationUpdate(payload: NamespacesProjectsRuntimeAssignmentsUpdateModuleConfigurationsInput): Promise<NamespacesProjectsRuntimeAssignmentsUpdateModuleConfigurationsPayload | undefined> {

        const result = await this.client.mutate<Mutation, NamespacesProjectsRuntimeAssignmentsUpdateModuleConfigurationsInput>({
            mutation: projectUpdateModuleConfigurationMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.namespacesProjectsRuntimeAssignmentsUpdateModuleConfigurations && result.data.namespacesProjectsRuntimeAssignmentsUpdateModuleConfigurations.namespaceProjectRuntimeAssignment) {
            const project = super.values().find(p => p.runtimeAssignments?.nodes?.map(rA => rA?.id).includes(payload.namespaceProjectRuntimeAssignmentId))
            const index = super.values().findIndex(p => p.runtimeAssignments?.nodes?.map(rA => rA?.id).includes(payload.namespaceProjectRuntimeAssignmentId))

            this.set(index, new View({
                ...project,
                runtimeAssignments: {
                    ...project?.runtimeAssignments,
                    nodes: [
                        ...(project?.runtimeAssignments?.nodes?.filter(rA => rA?.id !== payload.namespaceProjectRuntimeAssignmentId) ?? []),
                        (result?.data.namespacesProjectsRuntimeAssignmentsUpdateModuleConfigurations.namespaceProjectRuntimeAssignment ?? {})
                    ]
                }
            }))
        }

        return result?.data?.namespacesProjectsRuntimeAssignmentsUpdateModuleConfigurations ?? undefined

    }

}