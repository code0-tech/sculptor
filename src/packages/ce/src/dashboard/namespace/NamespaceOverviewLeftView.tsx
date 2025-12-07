import React from "react";
import {Avatar, Badge, Button, Flex, Spacing, Text, useService, useStore, useUserSession} from "@code0-tech/pictor";
import {UserService} from "@edition/user/User.service";
import {IconMail, IconSparkles, IconUser, IconUserCog} from "@tabler/icons-react";
import {OrganizationService} from "@edition/organization/Organization.service";

export const NamespaceOverviewLeftView: React.FC = () => {

    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)
    const currentSession = useUserSession()

    const currentUser = React.useMemo(() => userService.getById(currentSession?.user?.id), [userStore, currentSession])
    const organizations = React.useMemo(() => organizationService.values(), [organizationStore])

    return <Flex w={"200px"} style={{flexDirection: "column"}}>
        <Avatar style={{width: "100%"}} identifier={currentUser?.username!!}/>
        <Spacing spacing={"xl"}/>
        <Flex align={"center"} style={{gap: "0.7rem"}}>
            <Flex style={{flexDirection: "column"}}>
                <Text size={"xl"} hierarchy={"primary"}>{currentUser?.firstname} {currentUser?.lastname} </Text>
                <Text size={"xs"} hierarchy={"tertiary"}>{currentUser?.email}</Text>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
            <Text display={"flex"} align={"center"} size={"sm"} style={{gap: "0.7rem"}}>
                <IconUser size={16}/>
                @{currentUser?.username}
            </Text>
            <Text display={"flex"} align={"center"} size={"sm"} style={{gap: "0.7rem"}}>
                <IconUserCog size={16}/>
                {currentUser?.admin ? <Badge color={"secondary"}>Admin</Badge> :
                    <Badge color={"secondary"}>User</Badge>}
            </Text>
            <Text display={"flex"} align={"center"} size={"sm"} style={{gap: "0.7rem"}}>
                <IconMail size={16}/>
                {currentUser?.email}
            </Text>
            <Text display={"flex"} align={"center"} size={"sm"} style={{gap: "0.7rem"}}>
                <IconSparkles size={16}/>
                {currentUser?.admin ? <Badge color={"info"}>PRO</Badge> : <Badge color={"primary"}>BASIC</Badge>}
            </Text>
        </Flex>
        <Spacing spacing={"xl"}/>
        <Button w={"100%"} paddingSize={"xs"}>Edit Profile</Button>
        <Spacing spacing={"xs"}/>
        <hr style={{width: "100%"}} color={"#1c1a2c"}/>
        <Spacing spacing={"xs"}/>
        <Text size={"md"}>Organizations</Text>
        <Spacing spacing={"xs"}/>
        <Flex align={"center"} style={{flexWrap: "wrap", gap: ".35rem"}}>
            {organizations.map(organization => {
                return <Avatar key={organization.id} identifier={organization.name ?? ""}/>
            })}
        </Flex>
    </Flex>

}