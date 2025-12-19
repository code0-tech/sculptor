import {DFlowTypeReactiveService, FlowTypeView, ReactiveArrayStore} from "@code0-tech/pictor";
import {GraphqlClient} from "@core/util/graphql-client";

export class FlowtypeService extends DFlowTypeReactiveService {

    private readonly client: GraphqlClient

    constructor(client: GraphqlClient, store: ReactiveArrayStore<FlowTypeView>) {
        super(store)
        this.client = client
    }

}