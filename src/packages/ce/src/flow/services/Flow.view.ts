import {Flow as SagittariusFlow, Maybe, Scalars} from "@code0-tech/sagittarius-graphql-types";

export interface FlowView extends SagittariusFlow {
    editedAt?: Maybe<Scalars['Time']['output']>;
}