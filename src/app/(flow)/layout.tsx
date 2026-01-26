"use client"

import React from "react";
import {useApolloClient} from "@apollo/client/react";
import {
    ContextStoreProvider,
    DataTypeView,
    DLayout,
    DNamespaceMemberView,
    DNamespaceProjectView,
    DNamespaceRoleView,
    DNamespaceView,
    DOrganizationView,
    DResizableHandle,
    DResizablePanel,
    DResizablePanelGroup,
    DRuntimeView,
    DUserView,
    FlowTypeView,
    FunctionDefinitionView,
    ReactiveArrayStore,
    useUserSession
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/User.service";
import {GraphqlClient} from "@core/util/graphql-client";
import {useParams, useRouter} from "next/navigation";
import {OrganizationService} from "@edition/organization/Organization.service";
import {MemberService} from "@edition/member/Member.service";
import {NamespaceService} from "@edition/namespace/Namespace.service";
import {usePersistentReactiveArrayService} from "@/hooks/usePersistentReactiveArrayService";
import {RuntimeService} from "@edition/runtime/Runtime.service";
import {ProjectService} from "@edition/project/Project.service";
import {RoleService} from "@edition/role/Role.service";
import {Flow, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {FlowService} from "@edition/flow/Flow.service";
import {FunctionService} from "@edition/function/Function.service";
import {DatatypeService} from "@edition/datatype/Datatype.service";
import {FlowTypeService} from "@edition/flowtype/FlowTypeService";
import {FileTabsView} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs.view";
import {FileTabsService} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs.service";
import {FolderView} from "@edition/ui-flow/folder/FolderView";
import {View} from "@code0-tech/pictor/dist/utils/view";

interface ApplicationLayoutProps {
    children: React.ReactNode
    bar: React.ReactNode
    tab: React.ReactNode
}

const ApplicationLayout: React.FC<ApplicationLayoutProps> = ({children, bar, tab}) => {

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
        <DLayout layoutGap={0} style={{zIndex: 0}} topContent={
            <>
                <div style={{
                    padding: "0 1.3rem",
                    background: "rgba(255,2552,255,.1)",
                    borderBottom: "1px solid rgba(255,2552,255,.1)"
                }}>
                    {bar}
                    {tab}
                </div>
            </>
        }>
            <DLayout>
                <DResizablePanelGroup orientation={"horizontal"}>
                    <DResizablePanel id={"1"} defaultSize={"25%"}>
                        <FolderView/>
                    </DResizablePanel>
                    <DResizableHandle/>
                    {children}
                </DResizablePanelGroup>
            </DLayout>
        </DLayout>
    </ContextStoreProvider>
}

export default ApplicationLayout
