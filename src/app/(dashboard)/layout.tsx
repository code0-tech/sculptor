"use client"

import React from "react";
import {useApolloClient} from "@apollo/client/react";
import {ContextStoreProvider} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {GraphqlClient} from "@core/util/graphql-client";
import {useParams, usePathname} from "next/navigation";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {MemberService} from "@edition/member/services/Member.service";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {usePersistentReactiveArrayService} from "@/hooks/usePersistentReactiveArrayService";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {RoleService} from "@edition/role/services/Role.service";
import {Application, ApplicationService} from "@edition/application/services/Application.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {OrganizationView} from "@edition/organization/services/Organization.view";
import {RoleView} from "@edition/role/services/Role.view";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";
import {
    DataType,
    Flow, FlowType,
    FunctionDefinition,
    Namespace,
    NamespaceMember,
    NamespaceProject,
    Runtime, RuntimeModule,
    User
} from "@code0-tech/sagittarius-graphql-types";
import {ApplicationMiddlewareComponent} from "@edition/application/components/ApplicationMiddlewareComponent";
import {FullScreen} from "@code0-tech/pictor/dist/components/fullscreen/FullScreen";
import {ApplicationNavigationView} from "@edition/application/views/ApplicationNavigationView";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {ModuleService} from "@edition/module/services/Module.service";
import {AIService, Model} from "@edition/ai/services/AI.service";

interface ApplicationLayoutProps {
    children: React.ReactNode
    sidebar: React.ReactNode
    modal: React.ReactNode
}

const ApplicationLayout: React.FC<ApplicationLayoutProps> = ({children, sidebar, modal}) => {

    const client = useApolloClient()
    const pathname = usePathname()
    const params = useParams()
    const currentSession = useUserSession()

    const graphqlClient = React.useMemo(() => new GraphqlClient(client), [client])

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const flowIndex = params.flowId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`

    const application = usePersistentReactiveArrayService<Application, ApplicationService>(`dashboard::application::${currentSession?.id}`, (store) => new ApplicationService(graphqlClient, store))
    const user = usePersistentReactiveArrayService<User, UserService>(`dashboard::users::${currentSession?.id}`, (store) => new UserService(graphqlClient, store))
    const organization = usePersistentReactiveArrayService<OrganizationView, OrganizationService>(`dashboard::organizations::${currentSession?.id}`, (store) => new OrganizationService(graphqlClient, store))
    const member = usePersistentReactiveArrayService<NamespaceMember, MemberService>(`dashboard::members::${currentSession?.id}`, (store) => new MemberService(graphqlClient, store))
    const namespace = usePersistentReactiveArrayService<Namespace, NamespaceService>(`dashboard::namespaces::${currentSession?.id}`, (store) => new NamespaceService(graphqlClient, store))
    const runtime = usePersistentReactiveArrayService<Runtime, RuntimeService>(`dashboard::global_runtimes::${currentSession?.id}`, (store) => new RuntimeService(graphqlClient, store))
    const project = usePersistentReactiveArrayService<NamespaceProject, ProjectService>(`dashboard::projects::${currentSession?.id}`, (store) => new ProjectService(graphqlClient, store))
    const role = usePersistentReactiveArrayService<RoleView, RoleService>(`dashboard::roles::${currentSession?.id}`, (store) => new RoleService(graphqlClient, store))
    const flow = usePersistentReactiveArrayService<Flow, FlowService>(`dashboard::flows::${currentSession?.id}`, (store) => new FlowService(graphqlClient, store))
    const functions = usePersistentReactiveArrayService<FunctionDefinition, FunctionService>(`dashboard::functions::${currentSession?.id}`, (store) => new FunctionService(graphqlClient, store))
    const datatype = usePersistentReactiveArrayService<DataType, DatatypeService>(`dashboard::datatypes::${currentSession?.id}`, (store) => new DatatypeService(graphqlClient, store))
    const flowtype = usePersistentReactiveArrayService<FlowType, FlowTypeService>(`dashboard::flowtypes::${currentSession?.id}`, (store) => new FlowTypeService(graphqlClient, store))
    const module = usePersistentReactiveArrayService<RuntimeModule, ModuleService>(`dashboard::modules::${currentSession?.id}`, (store) => new ModuleService(graphqlClient, store))
    const ai = usePersistentReactiveArrayService<Model, AIService>(`dashboard::ai::${currentSession?.id}`, (store) => new AIService(graphqlClient, store))

    const runtimeId = React.useMemo(() => project[1].getById(projectId, {namespaceId})?.primaryRuntime?.id, [projectId, project[0], namespaceId])

    React.useEffect(() => {
        if (!currentSession || !namespaceId || !projectId) return

        flow[1].values({namespaceId, projectId})
        functions[1].values({namespaceId, projectId, runtimeId})
        datatype[1].values({namespaceId, projectId, runtimeId})
        flowtype[1].values({namespaceId, projectId, runtimeId})
        module[1].values({namespaceId, projectId, runtimeId})
    }, [runtimeId, namespaceId, projectId, currentSession, flow, functions, datatype, flowtype])

    const isAddLicensePage = pathname === '/licenses/add';

    return <ContextStoreProvider
        services={[application, user, organization, member, namespace, runtime, project, role, flow, functions, datatype, flowtype, module, ai]}>
        <ApplicationMiddlewareComponent>
            <FullScreen bg={"var(--secondary)"}>
                <Layout p={1} showLayoutSplitter={false} layoutGap={16} leftContent={<ApplicationNavigationView/>}>
                    <Layout showLayoutSplitter={false} layoutGap={16} leftContent={<>{sidebar}</>}>
                        <>
                            {children}
                            {modal}
                        </>
                    </Layout>
                </Layout>
            </FullScreen>
        </ApplicationMiddlewareComponent>
    </ContextStoreProvider>
}

export default ApplicationLayout
