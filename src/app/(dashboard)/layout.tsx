"use client"

import React from "react";
import {useApolloClient} from "@apollo/client/react";
import {Container, ContextStoreProvider, DLayout, DUserView, useReactiveArrayService} from "@code0-tech/pictor";
import {UserService} from "@core/user/User.service";
import {GraphqlClient} from "@core/util/graphql-client";

interface ApplicationLayoutProps {
    children: React.ReactElement
    bar: React.ReactElement
    tab: React.ReactElement
}

const ApplicationLayout: React.FC<ApplicationLayoutProps> = ({children, bar, tab}) => {

    const client = useApolloClient()
    const [store, service] = useReactiveArrayService<DUserView, UserService>((store) => new UserService(new GraphqlClient(client), store))

    return <ContextStoreProvider services={[[store, service]]}>
        <DLayout topContent={
            <>
                <div style={{background: "rgba(255,2552,255,.1)", borderBottom: "1px solid rgba(255,2552,255,.1)"}}>
                    <Container>
                        {bar}
                    </Container>
                </div>
                {tab}
            </>
        }>
            <Container>
                {children}
            </Container>
        </DLayout>
    </ContextStoreProvider>
}

export default React.memo(ApplicationLayout)
