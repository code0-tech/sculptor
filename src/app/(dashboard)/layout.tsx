"use client"

import React from "react";
import {useApolloClient} from "@apollo/client/react";
import {
    Container,
    ContextStoreProvider,
    DLayout,
    DNamespaceMemberView, DNamespaceProjectView,
    DNamespaceView,
    DOrganizationView, DRuntimeView,
    DUserView,
    ReactiveArrayStore,
    useUserSession,
    DNamespaceRoleView
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
import {Spacing} from "@code0-tech/pictor/dist/components/spacing/Spacing";

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

    const user = usePersistentReactiveArrayService<DUserView, UserService>(`dashboard::users::${currentSession?.id}`, (store: ReactiveArrayStore<DUserView>) => new UserService(graphqlClient, store))
    const organization = usePersistentReactiveArrayService<DOrganizationView, OrganizationService>(`dashboard::organizations::${currentSession?.id}`, (store: ReactiveArrayStore<DOrganizationView>) => new OrganizationService(graphqlClient, store))
    const member = usePersistentReactiveArrayService<DNamespaceMemberView, MemberService>(`dashboard::members::${currentSession?.id}`, (store: ReactiveArrayStore<DNamespaceMemberView>) => new MemberService(graphqlClient, store))
    const namespace = usePersistentReactiveArrayService<DNamespaceView, NamespaceService>(`dashboard::namespaces::${currentSession?.id}`, (store: ReactiveArrayStore<DNamespaceView>) => new NamespaceService(graphqlClient, store))
    const runtime = usePersistentReactiveArrayService<DRuntimeView, RuntimeService>(`dashboard::global_runtimes::${currentSession?.id}`, (store: ReactiveArrayStore<DRuntimeView>) => new RuntimeService(graphqlClient, store))
    const project = usePersistentReactiveArrayService<DNamespaceProjectView, ProjectService>(`dashboard::projects::${currentSession?.id}`, (store: ReactiveArrayStore<DNamespaceProjectView>) => new ProjectService(graphqlClient, store))
    const role = usePersistentReactiveArrayService<DNamespaceRoleView, RoleService>(`dashboard::roles::${currentSession?.id}`, (store: ReactiveArrayStore<DNamespaceRoleView>) => new RoleService(graphqlClient, store))

    if (currentSession === null) router.push("/login")

    return <ContextStoreProvider services={[user, organization, member, namespace, runtime, project, role]}>
        <DLayout style={{zIndex: 0}} topContent={
            <>
                <div style={{background: "rgba(255,2552,255,.1)", borderBottom: "1px solid rgba(255,2552,255,.1)"}}>
                    {bar}
                    {tab}
                    <Spacing spacing={"xxs"}/>
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
