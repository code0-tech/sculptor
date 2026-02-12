import React from "react";
import {
    Button,
    DNamespaceProjectList,
    Flex,
    Spacing,
    Text,
    useService,
    useStore,
    useUserSession
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/User.service";
import Link from "next/link";
import {useRouter} from "next/navigation";

export const PersonalProjectsView: React.FC = () => {

    const router = useRouter()
    const userSession = useUserSession()
    const userStore = useStore(UserService)
    const userService = useService(UserService)

    const currentUser = React.useMemo(() => userService.getById(userSession?.user?.id), [userStore, userSession])
    const namespaceId = currentUser?.namespace?.id
    const namespaceIndex = namespaceId?.match(/Namespace\/(\d+)$/)?.[1]

    const projectsList = React.useMemo(() => {
        if (!currentUser || !currentUser.namespace) return null
        return <DNamespaceProjectList color={"secondary"} onSelect={(project) => {
            const number = project.id?.match(/NamespaceProject\/(\d+)$/)?.[1]
            router.push(`/namespace/${namespaceIndex}/project/${number}/flow`)
        }} namespaceId={currentUser.namespace.id}/>

    }, [currentUser])

    return <>

        <Flex align={"center"} justify={"space-between"}>
            <Flex style={{gap: "0.35rem", flexDirection: "column"}}>
                <Text size={"xl"} hierarchy={"primary"}>
                    Personal projects
                </Text>
                <Text size={"sm"} hierarchy={"tertiary"}>
                    Projects created in your personal namespace. You can also create organization projects if you are a
                    member of any organization.
                </Text>
            </Flex>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <Link href={`/namespace/${namespaceIndex}/projects/create`}>
                    <Button color={"success"}>Create</Button>
                </Link>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        {projectsList}

    </>

}