import {DNamespaceReactiveService, DNamespaceView, ReactiveArrayStore} from "@code0-tech/pictor";
import {GraphqlClient} from "@core/util/graphql-client";
import {Namespace, Query} from "@code0-tech/sagittarius-graphql-types";
import namespaceQuery from "./queries/Namespace.query.graphql";
import {View} from "@code0-tech/pictor/dist/utils/view";

export class NamespaceService extends DNamespaceReactiveService {

    private readonly client: GraphqlClient

    constructor(client: GraphqlClient, store: ReactiveArrayStore<View<DNamespaceView>>) {
        super(store);
        this.client = client
    }

    getById(id: Namespace["id"]): DNamespaceView | undefined {
        if (super.getById(id)) return super.getById(id);
        this.client.query<Query>({
            query: namespaceQuery,
            variables: {
                id: id
            },
        }).then(result => {
            const data = result.data
            if (!data) return

            if (data.namespace) {
                this.add(new View(new DNamespaceView(data.namespace)))
            }
        })

        return super.getById(id);
    }

}