import {DataTypeView, DFlowDataTypeReactiveService, ReactiveArrayStore} from "@code0-tech/pictor";
import {GraphqlClient} from "@core/util/graphql-client";

export class DatatypeService extends DFlowDataTypeReactiveService {

    private readonly client: GraphqlClient

    constructor(client: GraphqlClient, store: ReactiveArrayStore<DataTypeView>) {
        super(store)
        this.client = client
    }

}