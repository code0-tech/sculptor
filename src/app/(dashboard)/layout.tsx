"use client"

import React from "react";
import {useApolloClient} from "@apollo/client/react";
import {Container, ContextStoreProvider, DLayout, DUserView, useReactiveArrayService} from "@code0-tech/pictor";
import {UserService} from "@core/user/User.service";
import {GraphqlClient} from "@core/util/graphql-client";

interface ApplicationLayoutProps {
    children: React.ReactElement
    modal: React.ReactElement
    bar: React.ReactElement
}

const ApplicationLayout: React.FC<ApplicationLayoutProps> = ({children, modal, bar}) => {

    const client = useApolloClient()
    const [store, service] = useReactiveArrayService<DUserView, UserService>((store) => new UserService(new GraphqlClient(client), store))

    return <Container>
        <ContextStoreProvider services={[[store, service]]}>
            {modal}
            <DLayout topContent={bar}>
                {children}
            </DLayout>
        </ContextStoreProvider>
    </Container>
}

export default React.memo(ApplicationLayout)
