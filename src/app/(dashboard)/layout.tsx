"use client"

import React from "react";
import {useApolloClient} from "@apollo/client/react";
import {
    Container,
    ContextStoreProvider,
    DLayout,
    DUserView,
    useReactiveArrayService,
    useUserSession
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/User.service";
import {GraphqlClient} from "@core/util/graphql-client";
import {useRouter} from "next/navigation";

interface ApplicationLayoutProps {
    children: React.ReactNode
    bar: React.ReactNode
    tab: React.ReactNode
}

const ApplicationLayout: React.FC<ApplicationLayoutProps> = ({children, bar, tab}) => {

    const client = useApolloClient()
    const user = useReactiveArrayService<DUserView, UserService>((store) => new UserService(new GraphqlClient(client), store))
    const router = useRouter()
    const currentSession = useUserSession()

    if (currentSession === null) router.push("/login")

    return <ContextStoreProvider services={[user]}>
        <DLayout topContent={
            <>
                <div style={{background: "rgba(255,2552,255,.1)", borderBottom: "1px solid rgba(255,2552,255,.1)"}}>
                    {bar}
                    {tab}
                </div>
            </>
        }>
            <Container>
                {children}
            </Container>
        </DLayout>
    </ContextStoreProvider>
}

export default ApplicationLayout
