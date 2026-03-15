import {ReactiveArrayService, ReactiveArrayStore} from "@code0-tech/pictor";
import {GraphqlClient} from "@core/util/graphql-client";
import {DataType, Namespace, NamespaceProject, Query, Runtime} from "@code0-tech/sagittarius-graphql-types";
import dataTypeQuery from "@edition/datatype/services/queries/DataTypes.query.graphql"
import {View} from "@code0-tech/pictor/dist/utils/view";

export type DataTypeDependencies = {
    namespaceId: Namespace['id']
    projectId: NamespaceProject['id']
    runtimeId: Runtime['id']
}

export class DatatypeService extends ReactiveArrayService<DataType, DataTypeDependencies> {

    private readonly client: GraphqlClient
    private i = 0

    constructor(client: GraphqlClient, store: ReactiveArrayStore<View<DataType>>) {
        super(store)
        this.client = client
    }

    values(dependencies?: DataTypeDependencies): DataType[] {
        const dataTypes = super.values()
        if (!dependencies?.namespaceId || !dependencies.projectId || !dependencies.runtimeId) return dataTypes

        const namespaceId = dependencies.namespaceId
        const projectId = dependencies.projectId
        const runtimeId = dependencies.runtimeId
        const filtered = dataTypes.filter(dataType => dataType.runtime?.id === runtimeId)

        if (filtered.length <= 0) {
            this.client.query<Query>({
                query: dataTypeQuery,
                variables: {
                    namespaceId: namespaceId,
                    projectId: projectId,

                    firstDataType: 50,
                    afterDataType: null,

                    firstDataTypeIdentifier: 50,
                    afterDataTypeIdentifier: null,

                    firstRule: 50,
                    afterRule: null,
                }
            }).then(res => {
                const nodes = res.data?.namespace?.project?.primaryRuntime?.dataTypes?.nodes ?? []
                nodes.forEach(dataType => {
                    if (dataType && !this.hasById(dataType.id)) {
                        this.set(this.i++, new View(dataType))
                    }
                })
            })
        }

        return filtered
    }

    hasById(id: DataType["id"]): boolean {
        const dataType = super.values().find(d => d.id === id)
        return dataType !== undefined
    }

}