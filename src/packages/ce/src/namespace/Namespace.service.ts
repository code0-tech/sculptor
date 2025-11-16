import {DNamespaceReactiveService, DNamespaceView, ReactiveArrayStore} from "@code0-tech/pictor";
import {GraphqlClient} from "@core/util/graphql-client";

export class NamespaceService extends DNamespaceReactiveService {

    private readonly client: GraphqlClient

    constructor(client: GraphqlClient, store: ReactiveArrayStore<DNamespaceView>) {
        super(store);
        this.client = client
    }

}