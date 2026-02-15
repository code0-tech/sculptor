import React, {startTransition} from "react";
import {NamespaceMember} from "@code0-tech/sagittarius-graphql-types";
import {
    Avatar,
    Badge,
    Button,
    Card,
    DataTableColumn,
    Dialog,
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    Flex,
    Menu,
    MenuContent,
    MenuItem,
    MenuPortal,
    MenuTrigger,
    Spacing,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger,
    useService,
    useStore
} from "@code0-tech/pictor";
import {formatDistanceToNow} from "date-fns";
import {UserService} from "@edition/user/services/User.service";
import {MemberService} from "@edition/member/services/Member.service";
import {RoleService} from "@edition/role/services/Role.service";
import {RolePermissionComponent} from "@edition/role/components/RolePermissionComponent";
import {IconDotsVertical, IconUserCog, IconUserOff, IconX} from "@tabler/icons-react";

export interface MemberDataTableRowComponentProps {
    memberId: NamespaceMember['id']
}

export const MemberDataTableRowComponent: React.FC<MemberDataTableRowComponentProps> = (props) => {

    const {memberId} = props

    const memberService = useService(MemberService)
    const memberStore = useStore(MemberService)
    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const roleService = useService(RoleService)
    const roleStore = useStore(RoleService)

    const member = React.useMemo(
        () => memberService.getById(memberId),
        [memberStore, memberId]
    )

    const user = React.useMemo(
        () => userService.getById(member?.user?.id),
        [userStore, member]
    )

    const assignedRoles = React.useMemo(
        () => member?.roles?.nodes?.map(role => roleService.getById(role?.id, {namespaceId: member?.namespace?.id})) || [],
        [roleStore, member]
    )

    const [localAssignedRoles, setLocalAssignedRoles] = React.useState(assignedRoles)
    const [openRemovedMemberDialog, setOpenRemovedMemberDialog] = React.useState(false)
    const [openAssignRolesDialog, setOpenAssignRolesDialog] = React.useState(false)

    const rolesToAssign = roleService
        .values({namespaceId: member?.namespace?.id})
        .filter(role => !localAssignedRoles.find(aRole => aRole?.id === role.id))

    React.useEffect(() => {
        setLocalAssignedRoles(assignedRoles)
    }, [assignedRoles])


    const memberAssignRoles = React.useCallback(() => {
        startTransition(() => {
            memberService.memberAssignRoles({
                memberId: member?.id!,
                roleIds: localAssignedRoles.map(r => r?.id!)
            })
        })
    }, [localAssignedRoles, member])

    const memberDelete = React.useCallback(() => {
        startTransition(() => {
            memberService.memberDelete({
                namespaceMemberId: member?.id!
            })
        })
    }, [member])

    return <>
        <Dialog open={openRemovedMemberDialog} onOpenChange={open => setOpenRemovedMemberDialog(open)}>
            <DialogPortal>
                <DialogOverlay/>
                <DialogContent showCloseButton title={"Remove member"}>
                    <Spacing spacing={"xl"}/>
                    <Text size={"md"} hierarchy={"secondary"}>
                        Are you sure you want to remove {" "}
                        <Badge color={"info"}>
                            <Text size={"md"} style={{color: "inherit"}}>@{user?.username}</Text>
                        </Badge> {" "}
                        from this organization/workspace?
                    </Text>
                    <Spacing spacing={"xl"}/>
                    <Flex justify={"space-between"} align={"center"}>
                        <DialogClose asChild>
                            <Button color={"tertiary"}>No, go back!</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button color={"error"} onClick={memberDelete}>Yes, remove!</Button>
                        </DialogClose>
                    </Flex>
                </DialogContent>
            </DialogPortal>
        </Dialog>
        <Dialog open={openAssignRolesDialog} onOpenChange={open => setOpenAssignRolesDialog(open)}>
            <DialogPortal>
                <DialogOverlay/>
                <DialogContent autoFocus showCloseButton title={"Assign roles"}>
                    <Spacing spacing={"xl"}/>
                    <Flex justify={"space-between"} align={"center"} style={{gap: "0.35rem"}}>
                        <Text size={"md"} hierarchy={"tertiary"}>Assign, remove and manage the roles of a active
                            member</Text>
                        <Menu>
                            <MenuTrigger asChild>
                                <Button style={{textWrap: "nowrap"}} color={"tertiary"}>Assign roles</Button>
                            </MenuTrigger>
                            <MenuPortal>
                                <MenuContent side={"bottom"} sideOffset={8} align={"end"} maw={"300px"}>
                                    {rolesToAssign.map((role, index) => {
                                        return <>
                                            <MenuItem onSelect={() => {
                                                setLocalAssignedRoles(prevState => [...prevState, role])
                                            }}>
                                                <Flex style={{gap: "0.35rem", flexDirection: "column"}}>
                                                    <Text size={"md"} hierarchy={"primary"}>{role?.name}</Text>
                                                    <RolePermissionComponent abilities={role?.abilities!!}/>
                                                </Flex>
                                            </MenuItem>
                                        </>
                                    })}
                                </MenuContent>
                            </MenuPortal>
                        </Menu>
                    </Flex>
                    <Spacing spacing={"md"}/>
                    <Card paddingSize={"xs"} color={"primary"}>
                        {localAssignedRoles.map(role => {
                            return <Flex style={{gap: "0.7rem"}} my={0.35} align={"center"} justify={"space-between"}>
                                <Flex align={"center"} style={{gap: "1.3rem"}}>
                                    <Text hierarchy={"primary"}>{role?.name}</Text>
                                    <RolePermissionComponent abilities={role?.abilities!!}/>
                                </Flex>
                                <Button color={"primary"} variant={"filled"} onClick={() => {
                                    setLocalAssignedRoles(prevState => prevState.filter(aRole => aRole?.id != role?.id))
                                }}>
                                    <IconX size={16}/>
                                </Button>
                            </Flex>

                        })}
                    </Card>
                    <Spacing spacing={"xl"}/>
                    <Flex justify={"space-between"} align={"center"}>
                        <DialogClose asChild>
                            <Button color={"tertiary"}>No, go back!</Button>
                        </DialogClose>

                        <DialogClose asChild>
                            <Button color={"success"} onClick={memberAssignRoles}>Yes, save!</Button>
                        </DialogClose>
                    </Flex>
                </DialogContent>
            </DialogPortal>
        </Dialog>
        <DataTableColumn>
            <Flex style={{flexDirection: "column", gap: "1.3rem"}}>
                <Flex align={"center"} style={{gap: "0.7rem"}}>
                    <Avatar size={32}
                            type={"character"}
                            identifier={user?.username ?? ""}/>
                    <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                        <Flex align={"center"} style={{gap: "0.35rem"}}>
                            <Text size={"md"} hierarchy={"primary"}>
                                @{user?.username}
                            </Text>
                            {user?.admin ? <Badge color={"secondary"}>Owner</Badge> : null}
                            {user?.emailVerifiedAt ? <Badge color={"secondary"}>Email verified</Badge> : null}
                        </Flex>
                        <Text>
                            {user?.email ?? ""}
                        </Text>
                    </Flex>
                </Flex>
                <Text hierarchy={"tertiary"}>
                    Member since {formatDistanceToNow(member?.createdAt!)} ago
                </Text>
            </Flex>
        </DataTableColumn>
        <DataTableColumn>
            <Flex align={"center"} style={{gap: "0.35rem"}}>
                {assignedRoles.map(role => {
                    return <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge color={"info"}>
                                <Text style={{color: "inherit"}}
                                      hierarchy={"tertiary"}>{role?.name}</Text>
                            </Badge>
                        </TooltipTrigger>
                        <TooltipPortal>
                            <TooltipContent side={"bottom"}>
                                <RolePermissionComponent abilities={role?.abilities!!}/>
                            </TooltipContent>
                        </TooltipPortal>
                    </Tooltip>
                })}
            </Flex>
        </DataTableColumn>
        <DataTableColumn>
            {member?.userAbilities?.deleteMember || member?.userAbilities?.assignMemberRoles ? (
                <Menu>
                    <MenuTrigger asChild>
                        <Button color="secondary">
                            <IconDotsVertical size={16}/>
                        </Button>
                    </MenuTrigger>
                    <MenuPortal>
                        <MenuContent align={"end"} side={"bottom"} sideOffset={8}>
                            {member?.userAbilities?.deleteMember && (
                                <MenuItem onSelect={() => setOpenRemovedMemberDialog(true)}>
                                    <IconUserOff size={16}/>
                                    <Text>Remove member</Text>
                                </MenuItem>
                            )}
                            {member?.userAbilities?.assignMemberRoles && (
                                <MenuItem onSelect={() => setOpenAssignRolesDialog(true)}>
                                    <IconUserCog size={16}/>
                                    <Text>Assign role</Text>
                                </MenuItem>
                            )}
                        </MenuContent>
                    </MenuPortal>
                </Menu>
            ) : null}
        </DataTableColumn>
    </>
}