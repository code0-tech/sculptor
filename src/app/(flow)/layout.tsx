"use client"

import React from "react";
import {useApolloClient} from "@apollo/client/react";
import {
    Button,
    ContextStoreProvider,
    DataTypeView, DFlowFolder, DFlowFolderHandle,
    DLayout,
    DNamespaceMemberView,
    DNamespaceProjectView,
    DNamespaceRoleView,
    DNamespaceView,
    DOrganizationView, DResizableHandle, DResizablePanel, DResizablePanelGroup,
    DRuntimeView,
    DUserView, Flex,
    FlowTypeView,
    FunctionDefinitionView,
    ReactiveArrayStore, Text, Tooltip, TooltipArrow, TooltipContent, TooltipPortal, TooltipTrigger,
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
import {FlowtypeService} from "@edition/flowtype/Flowtype.service";
import {FileTabsView} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs.view";
import {FileTabsService} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs.service";
import {IconArrowsMaximize, IconArrowsMinimize, IconCircleDot} from "@tabler/icons-react";

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
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`

    const user = usePersistentReactiveArrayService<DUserView, UserService>(`dashboard::users::${currentSession?.id}`, (store: ReactiveArrayStore<DUserView>) => new UserService(graphqlClient, store))
    const organization = usePersistentReactiveArrayService<DOrganizationView, OrganizationService>(`dashboard::organizations::${currentSession?.id}`, (store: ReactiveArrayStore<DOrganizationView>) => new OrganizationService(graphqlClient, store))
    const member = usePersistentReactiveArrayService<DNamespaceMemberView, MemberService>(`dashboard::members::${currentSession?.id}`, (store: ReactiveArrayStore<DNamespaceMemberView>) => new MemberService(graphqlClient, store))
    const namespace = usePersistentReactiveArrayService<DNamespaceView, NamespaceService>(`dashboard::namespaces::${currentSession?.id}`, (store: ReactiveArrayStore<DNamespaceView>) => new NamespaceService(graphqlClient, store))
    const runtime = usePersistentReactiveArrayService<DRuntimeView, RuntimeService>(`dashboard::global_runtimes::${currentSession?.id}`, (store: ReactiveArrayStore<DRuntimeView>) => new RuntimeService(graphqlClient, store))
    const project = usePersistentReactiveArrayService<DNamespaceProjectView, ProjectService>(`dashboard::projects::${currentSession?.id}`, (store: ReactiveArrayStore<DNamespaceProjectView>) => new ProjectService(graphqlClient, store))
    const role = usePersistentReactiveArrayService<DNamespaceRoleView, RoleService>(`dashboard::roles::${currentSession?.id}`, (store: ReactiveArrayStore<DNamespaceRoleView>) => new RoleService(graphqlClient, store))
    const flow = usePersistentReactiveArrayService<Flow, FlowService>(`dashboard::flows::${currentSession?.id}`, (store: ReactiveArrayStore<Flow>) => new FlowService(graphqlClient, store))
    const functions = usePersistentReactiveArrayService<FunctionDefinitionView, FunctionService>(`dashboard::functions::${currentSession?.id}`, (store: ReactiveArrayStore<FunctionDefinitionView>) => new FunctionService(graphqlClient, store))
    const datatype = usePersistentReactiveArrayService<DataTypeView, DatatypeService>(`dashboard::datatypes::${currentSession?.id}`, (store: ReactiveArrayStore<DataTypeView>) => new DatatypeService(graphqlClient, store))
    const flowtype = usePersistentReactiveArrayService<FlowTypeView, FlowtypeService>(`dashboard::flowtypes::${currentSession?.id}`, (store: ReactiveArrayStore<FlowTypeView>) => new FlowtypeService(graphqlClient, store))
    const file = usePersistentReactiveArrayService<FileTabsView, FileTabsService>(`dashboard::files::${currentSession?.id}`, FileTabsService, [])


    if (currentSession === null) router.push("/login")

    const runtimeId = React.useMemo(() => project[1].getById(projectId, {namespaceId})?.primaryRuntime?.id, [projectId, project[0], namespaceId])

    React.useMemo(() => {
        flow[1].values({namespaceId, projectId})
        functions[1].values({namespaceId, projectId, runtimeId})
        datatype[1].values({namespaceId, projectId, runtimeId})
        flowtype[1].values({namespaceId, projectId, runtimeId})
    }, [runtimeId, namespaceId, projectId])

    const ref = React.useRef<DFlowFolderHandle>(null)

    return <ContextStoreProvider
        services={[user, organization, member, namespace, runtime, project, role, flow, functions, datatype, flowtype, file]}>
        <DLayout style={{zIndex: 0}} topContent={
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
                    <DResizablePanel id={"1"} defaultSize={15}>
                        <DLayout topContent={
                            <Flex style={{gap: "0.35rem"}} align={"center"} justify={"space-between"} p={0.75}>
                                <Button paddingSize={"xxs"} color={"success"}>
                                    <Text>Create new flow</Text>
                                </Button>
                                <Flex style={{gap: "0.35rem"}}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant={"none"} paddingSize={"xxs"} onClick={() => ref.current?.openActivePath()}>
                                                <IconCircleDot size={16}/>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipPortal>
                                            <TooltipContent side={"bottom"}>
                                                <Text>Open active flow</Text>
                                                <TooltipArrow/>
                                            </TooltipContent>
                                        </TooltipPortal>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant={"none"} paddingSize={"xxs"} onClick={() => ref.current?.closeAll()}>
                                                <IconArrowsMinimize size={16}/>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipPortal>
                                            <TooltipContent side={"bottom"}>
                                                <Text>Close all</Text>
                                                <TooltipArrow/>
                                            </TooltipContent>
                                        </TooltipPortal>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button paddingSize={"xxs"} variant={"none"} onClick={() => ref.current?.openAll()}>
                                                <IconArrowsMaximize size={16}/>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipPortal>
                                            <TooltipContent side={"bottom"}>
                                                <Text>Open all</Text>
                                                <TooltipArrow/>
                                            </TooltipContent>
                                        </TooltipPortal>
                                    </Tooltip>
                                </Flex>
                            </Flex>
                        }>
                            <div style={{padding: "0.75rem"}}>
                                <DFlowFolder ref={ref} activeFlowId={"gid://sagittarius/Flow/2"}
                                             namespaceId={`gid://sagittarius/Namespace/${namespaceIndex}`}
                                             projectId={`gid://sagittarius/NamespaceProject/${projectIndex}`}/>
                            </div>
                        </DLayout>
                    </DResizablePanel>
                    <DResizableHandle/>
                    {children}
                </DResizablePanelGroup>
            </DLayout>
        </DLayout>
    </ContextStoreProvider>
}

export default ApplicationLayout
