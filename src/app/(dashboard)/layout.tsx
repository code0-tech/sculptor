"use client"

import React from "react";
import {useApolloClient} from "@apollo/client/react";
import {
    Container,
    ContextStoreProvider,
    DLayout, DNamespaceMemberView, DNamespaceView, DOrganizationView,
    DUserView, ReactiveArrayStore,
    useReactiveArrayService,
    useUserSession
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/User.service";
import {GraphqlClient} from "@core/util/graphql-client";
import {useRouter} from "next/navigation";
import {OrganizationService} from "@edition/organization/Organization.service";
import {MemberService} from "@edition/member/Member.service";
import {NamespaceService} from "@edition/namespace/Namespace.service";

interface ApplicationLayoutProps {
    children: React.ReactNode
    bar: React.ReactNode
    tab: React.ReactNode
}

const ApplicationLayout: React.FC<ApplicationLayoutProps> = ({children, bar, tab}) => {

    const client = useApolloClient()
    const router = useRouter()
    const currentSession = useUserSession()

    const graphqlClient = React.useMemo(() => new GraphqlClient(client), [client])

    const createUserService = React.useCallback(
        (store: ReactiveArrayStore<DUserView>) => new UserService(graphqlClient, store),
        [graphqlClient]
    )
    const user = useReactiveArrayService<DUserView, UserService>(createUserService)

    const createOrganizationService = React.useCallback(
        (store: ReactiveArrayStore<DOrganizationView>) => new OrganizationService(graphqlClient, store),
        [graphqlClient]
    )
    const organization = useReactiveArrayService<DOrganizationView, OrganizationService>(createOrganizationService)

    const createMemberService = React.useCallback(
        (store: ReactiveArrayStore<DNamespaceMemberView>) => new MemberService(graphqlClient, store),
        [graphqlClient]
    )
    const member = useReactiveArrayService<DNamespaceMemberView, MemberService>(createMemberService)

    const createNamespaceService = React.useCallback(
        (store: ReactiveArrayStore<DNamespaceView>) => new NamespaceService(graphqlClient, store),
        [graphqlClient]
    )
    const namespace = useReactiveArrayService<DNamespaceView, NamespaceService>(createNamespaceService)

    if (currentSession === null) router.push("/login")

    return <ContextStoreProvider services={[user, organization, member, namespace]}>
        <DLayout style={{zIndex: 0}} topContent={
            <>
                <div style={{background: "rgba(255,2552,255,.1)", borderBottom: "1px solid rgba(255,2552,255,.1)"}}>
                    {bar}
                    {tab}
                </div>
            </>
        }>
            <Container h={"100%"} w={"100%"}>
                {children}
            </Container>
        </DLayout>
    </ContextStoreProvider>
}

export default ApplicationLayout
