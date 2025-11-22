import {
    DNamespaceProjectReactiveService,
    DNamespaceProjectView,
    DProjectDependencies, DRuntimeView, DUserView,
    ReactiveArrayStore
} from "@code0-tech/pictor";
import {
    NamespacesProjectsAssignRuntimesInput,
    NamespacesProjectsAssignRuntimesPayload,
    NamespacesProjectsCreateInput,
    NamespacesProjectsCreatePayload,
    NamespacesProjectsDeleteInput, NamespacesProjectsDeletePayload, Query
} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";
import projectsQuery from "./queries/Projects.query.graphql"

export class ProjectService extends DNamespaceProjectReactiveService {

    private readonly client: GraphqlClient
    private i = 0;

    constructor(client: GraphqlClient, store: ReactiveArrayStore<DNamespaceProjectView>) {
        super(store);
        this.client = client
    }

    values(dependencies: DProjectDependencies): DNamespaceProjectView[] {
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

    projectAssignRuntimes(payload: NamespacesProjectsAssignRuntimesInput): Promise<NamespacesProjectsAssignRuntimesPayload | undefined> {
        return Promise.resolve(undefined);
    }

    projectCreate(payload: NamespacesProjectsCreateInput): Promise<NamespacesProjectsCreatePayload | undefined> {
        return Promise.resolve(undefined);
    }

    projectDelete(payload: NamespacesProjectsDeleteInput): Promise<NamespacesProjectsDeletePayload | undefined> {
        return Promise.resolve(undefined);
    }

}