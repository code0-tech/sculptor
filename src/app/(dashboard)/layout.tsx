"use client"

import React from "react";
import {useApolloClient} from "@apollo/client/react";
import {
    AuroraBackground,
    ContextStoreProvider,
    Flex
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {GraphqlClient} from "@core/util/graphql-client";
import {useRouter} from "next/navigation";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {MemberService} from "@edition/member/services/Member.service";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {usePersistentReactiveArrayService} from "@/hooks/usePersistentReactiveArrayService";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {RoleService} from "@edition/role/services/Role.service";
import Image from "next/image";
import {Application, ApplicationService} from "@edition/application/services/Application.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {UserView} from "@edition/user/services/User.view";
import {OrganizationView} from "@edition/organization/services/Organization.view";
import {MemberView} from "@edition/member/services/Member.view";
import {NamespaceView} from "@edition/namespace/services/Namespace.view";
import {ProjectView} from "@edition/project/services/Project.view";
import {RoleView} from "@edition/role/services/Role.view";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";
import {Runtime} from "@code0-tech/sagittarius-graphql-types";

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

    const user = usePersistentReactiveArrayService<UserView, UserService>(`dashboard::users::${currentSession?.id}`, (store) => new UserService(graphqlClient, store))
    const organization = usePersistentReactiveArrayService<OrganizationView, OrganizationService>(`dashboard::organizations::${currentSession?.id}`, (store) => new OrganizationService(graphqlClient, store))
    const member = usePersistentReactiveArrayService<MemberView, MemberService>(`dashboard::members::${currentSession?.id}`, (store) => new MemberService(graphqlClient, store))
    const namespace = usePersistentReactiveArrayService<NamespaceView, NamespaceService>(`dashboard::namespaces::${currentSession?.id}`, (store) => new NamespaceService(graphqlClient, store))
    const runtime = usePersistentReactiveArrayService<Runtime, RuntimeService>(`dashboard::global_runtimes::${currentSession?.id}`, (store) => new RuntimeService(graphqlClient, store))
    const project = usePersistentReactiveArrayService<ProjectView, ProjectService>(`dashboard::projects::${currentSession?.id}`, (store) => new ProjectService(graphqlClient, store))
    const role = usePersistentReactiveArrayService<RoleView, RoleService>(`dashboard::roles::${currentSession?.id}`, (store) => new RoleService(graphqlClient, store))
    const application = usePersistentReactiveArrayService<Application, ApplicationService>(`dashboard::application::${currentSession?.id}`, (store) => new ApplicationService(graphqlClient, store))

    if (currentSession === null) router.push("/login")

    return <ContextStoreProvider services={[user, organization, member, namespace, runtime, project, role, application]}>
        <Layout style={{zIndex: 0}} layoutGap={"0"} showLayoutSplitter={false} leftContent={
            <Flex p={0.7} pt={1} align={"center"} style={{flexDirection: "column", gap: "0.7rem"}}>
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "50%",
                    transform: "scaleX(-1)",
                    height: "40%",
                    zIndex: "-1",
                }}>
                    <div style={{
                        position: "absolute",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        background: "radial-gradient(circle at top right,rgba(25, 24, 37, 0.25) 0%, rgba(25, 24, 37, 1) 25%)",
                        zIndex: "1"
                    }}/>
                    <AuroraBackground/>

                </div>
                <Image src={"/CodeZero_Logo.png"} alt={"CodeZero Banner"} width={160} height={0}
                       style={{width: '38px', height: 'auto'}}/>
                {tab}
            </Flex>
        }>
            <Layout px={0.7} layoutGap={"0"} topContent={<>{bar}</>}>
                <Layout>
                    <>{children}</>
                </Layout>
            </Layout>
        </Layout>
    </ContextStoreProvider>
}

export default ApplicationLayout
