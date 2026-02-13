"use client"

import {useApolloClient} from "@apollo/client/react";
import {useParams, useRouter} from "next/navigation";
import {
    AuroraBackground,
    ContextStoreProvider,
    DataTypeView,
    DLayout,
    DNamespaceMemberView,
    DNamespaceProjectView,
    DNamespaceRoleView,
    DNamespaceView,
    DOrganizationView,
    DRuntimeView,
    DUserView,
    Flex,
    FlowTypeView,
    FunctionDefinitionView,
    useUserSession
} from "@code0-tech/pictor";
import React from "react";
import {GraphqlClient} from "@core/util/graphql-client";
import {Flow, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {usePersistentReactiveArrayService} from "@/hooks/usePersistentReactiveArrayService";
import {UserService} from "@edition/user/services/User.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {MemberService} from "@edition/member/services/Member.service";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {RoleService} from "@edition/role/services/Role.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {FlowTypeService} from "@edition/flowtype/services/FlowTypeService";
import {FileTabsView} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs.view";
import {FileTabsService} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs.service";
import Image from "next/image";

export default function Layout({bar, tab, children}: {
    bar: React.ReactNode,
    tab: React.ReactNode,
    children: React.ReactNode
}) {
    const client = useApolloClient()
    const router = useRouter()
    const params = useParams()
    const currentSession = useUserSession()

    const graphqlClient = React.useMemo(() => new GraphqlClient(client), [client])

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const flowIndex = params.flowId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`

    if (currentSession === null) router.push("/login")

    const user = usePersistentReactiveArrayService<DUserView, UserService>(`dashboard::users::${currentSession?.id}`, (store) => new UserService(graphqlClient, store))
    const organization = usePersistentReactiveArrayService<DOrganizationView, OrganizationService>(`dashboard::organizations::${currentSession?.id}`, (store) => new OrganizationService(graphqlClient, store))
    const member = usePersistentReactiveArrayService<DNamespaceMemberView, MemberService>(`dashboard::members::${currentSession?.id}`, (store) => new MemberService(graphqlClient, store))
    const namespace = usePersistentReactiveArrayService<DNamespaceView, NamespaceService>(`dashboard::namespaces::${currentSession?.id}`, (store) => new NamespaceService(graphqlClient, store))
    const runtime = usePersistentReactiveArrayService<DRuntimeView, RuntimeService>(`dashboard::global_runtimes::${currentSession?.id}`, (store) => new RuntimeService(graphqlClient, store))
    const project = usePersistentReactiveArrayService<DNamespaceProjectView, ProjectService>(`dashboard::projects::${currentSession?.id}`, (store) => new ProjectService(graphqlClient, store))
    const role = usePersistentReactiveArrayService<DNamespaceRoleView, RoleService>(`dashboard::roles::${currentSession?.id}`, (store) => new RoleService(graphqlClient, store))
    const flow = usePersistentReactiveArrayService<Flow, FlowService>(`dashboard::flows::${currentSession?.id}`, (store) => new FlowService(graphqlClient, store))
    const functions = usePersistentReactiveArrayService<FunctionDefinitionView, FunctionService>(`dashboard::functions::${currentSession?.id}`, (store) => new FunctionService(graphqlClient, store))
    const datatype = usePersistentReactiveArrayService<DataTypeView, DatatypeService>(`dashboard::datatypes::${currentSession?.id}`, (store) => new DatatypeService(graphqlClient, store))
    const flowtype = usePersistentReactiveArrayService<FlowTypeView, FlowTypeService>(`dashboard::flowtypes::${currentSession?.id}`, (store) => new FlowTypeService(graphqlClient, store))
    const file = usePersistentReactiveArrayService<FileTabsView, FileTabsService>(`dashboard::files::${flowId}`, FileTabsService, [])


    const runtimeId = React.useMemo(() => project[1].getById(projectId, {namespaceId})?.primaryRuntime?.id, [projectId, project[0], namespaceId])

    React.useEffect(() => {
        if (!currentSession) return

        flow[1].values({namespaceId, projectId})
        functions[1].values({namespaceId, projectId, runtimeId})
        datatype[1].values({namespaceId, projectId, runtimeId})
        flowtype[1].values({namespaceId, projectId, runtimeId})
    }, [runtimeId, namespaceId, projectId, currentSession, flow, functions, datatype, flowtype])

    return <ContextStoreProvider
        services={[user, organization, member, namespace, runtime, project, role, flow, functions, datatype, flowtype, file]}>
        <DLayout layoutGap={0} style={{zIndex: 0}} showLayoutSplitter={false} leftContent={
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
                    <>
                        {children}
                    </>
                </DLayout>
            </DLayout>
        </DLayout>
    </ContextStoreProvider>
}