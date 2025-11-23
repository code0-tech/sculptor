import React from "react";
import {
    Button,
    DNamespaceProjectList,
    Flex, Spacing,
    Text,
    TextInput,
    useService,
    useStore,
    useUserSession
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/User.service";
import {IconSearch} from "@tabler/icons-react";
import Link from "next/link";

export const PersonalProjectsView: React.FC = () => {

    const userSession = useUserSession()
    const userStore = useStore(UserService)
    const userService = useService(UserService)

    const currentUser = React.useMemo(() => userService.getById(userSession?.user?.id), [userStore, userSession])

    const projectsList = React.useMemo(() => {
        if (!currentUser || !currentUser.namespace) return null
        return <DNamespaceProjectList namespaceId={currentUser.namespace.id}/>

    }, [currentUser])

    return <>

        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                Personal projects
            </Text>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <TextInput left={<IconSearch size={16}/>} placeholder={"Find a personal project..."}/>
                <Link href={"/projects/create"}>
                    <Button color={"success"}>Create personal project</Button>
                </Link>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        {projectsList}

    </>

}