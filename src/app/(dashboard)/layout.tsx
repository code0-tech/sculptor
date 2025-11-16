"use client"

import React from "react";
import {useApolloClient} from "@apollo/client/react";
import {
    Container,
    ContextStoreProvider,
    DLayout, DNamespaceMemberView, DNamespaceView, DOrganizationView,
    DUserView,
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

    const user = useReactiveArrayService<DUserView, UserService>((store) => new UserService(new GraphqlClient(client), store))
    const organization = useReactiveArrayService<DOrganizationView, OrganizationService>((store) => new OrganizationService(new GraphqlClient(client), store))
    const member = useReactiveArrayService<DNamespaceMemberView, MemberService>((store) => new MemberService(new GraphqlClient(client), store))
    const namespace = useReactiveArrayService<DNamespaceView, NamespaceService>((store) => new NamespaceService(new GraphqlClient(client), store))

    if (currentSession === null) router.push("/login")

    return <ContextStoreProvider services={[user, organization, member, namespace]}>
        <DLayout topContent={
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
