"use client"

import React from "react";
import {useApolloClient} from "@apollo/client/react";
import {
    AuroraBackground,
    ContextStoreProvider,
    DLayout,
    DNamespaceMemberView,
    DNamespaceProjectView,
    DNamespaceRoleView,
    DNamespaceView,
    DOrganizationView,
    DRuntimeView,
    DUserView,
    Flex,
    useUserSession
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/User.service";
import {GraphqlClient} from "@core/util/graphql-client";
import {useRouter} from "next/navigation";
import {OrganizationService} from "@edition/organization/Organization.service";
import {MemberService} from "@edition/member/Member.service";
import {NamespaceService} from "@edition/namespace/Namespace.service";
import {usePersistentReactiveArrayService} from "@/hooks/usePersistentReactiveArrayService";
import {RuntimeService} from "@edition/runtime/Runtime.service";
import {ProjectService} from "@edition/project/Project.service";
import {RoleService} from "@edition/role/Role.service";
import Image from "next/image";

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

    const user = usePersistentReactiveArrayService<DUserView, UserService>(`dashboard::users::${currentSession?.id}`, (store) => new UserService(graphqlClient, store))
    const organization = usePersistentReactiveArrayService<DOrganizationView, OrganizationService>(`dashboard::organizations::${currentSession?.id}`, (store) => new OrganizationService(graphqlClient, store))
    const member = usePersistentReactiveArrayService<DNamespaceMemberView, MemberService>(`dashboard::members::${currentSession?.id}`, (store) => new MemberService(graphqlClient, store))
    const namespace = usePersistentReactiveArrayService<DNamespaceView, NamespaceService>(`dashboard::namespaces::${currentSession?.id}`, (store) => new NamespaceService(graphqlClient, store))
    const runtime = usePersistentReactiveArrayService<DRuntimeView, RuntimeService>(`dashboard::global_runtimes::${currentSession?.id}`, (store) => new RuntimeService(graphqlClient, store))
    const project = usePersistentReactiveArrayService<DNamespaceProjectView, ProjectService>(`dashboard::projects::${currentSession?.id}`, (store) => new ProjectService(graphqlClient, store))
    const role = usePersistentReactiveArrayService<DNamespaceRoleView, RoleService>(`dashboard::roles::${currentSession?.id}`, (store) => new RoleService(graphqlClient, store))

    if (currentSession === null) router.push("/login")

    return <ContextStoreProvider services={[user, organization, member, namespace, runtime, project, role]}>
        <DLayout style={{zIndex: 0}} layoutGap={"0"} showLayoutSplitter={false} leftContent={
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
            <DLayout px={0.7} layoutGap={"0"} topContent={<>{bar}</>}>
                <DLayout>
                    <>{children}</>
                </DLayout>
            </DLayout>
        </DLayout>
    </ContextStoreProvider>
}

export default ApplicationLayout
