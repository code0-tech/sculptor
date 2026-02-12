import React from "react";
import {
    Button,
    DNamespaceProjectList,
    Flex, Menu, MenuCheckboxItem, MenuContent, MenuPortal, MenuTrigger,
    Spacing,
    Text,
    useService,
    useStore,
    useUserSession
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/User.service";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {ProjectDataTableComponent} from "@edition/ui-dashboard/project/ProjectDataTableComponent";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {ProjectDataTableFilterInputComponent} from "@edition/ui-dashboard/project/ProjectDataTableFilterInputComponent";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {IconMinus, IconSortAscending, IconSortDescending} from "@tabler/icons-react";

export const PersonalProjectsView: React.FC = () => {

    const router = useRouter()
    const userSession = useUserSession()
    const userStore = useStore(UserService)
    const userService = useService(UserService)

    const currentUser = React.useMemo(() => userService.getById(userSession?.user?.id), [userStore, userSession])
    const namespaceId = currentUser?.namespace?.id
    const namespaceIndex = namespaceId?.match(/Namespace\/(\d+)$/)?.[1]

    const [filter, setFilter] = React.useState<DataTableFilterProps>({})
    const [sort, setSort] = React.useState<DataTableSortProps>({})

    const projectsList = React.useMemo(() => {
        if (!currentUser || !currentUser.namespace) return null
        return <ProjectDataTableComponent onSelect={(project) => {
            const number = project?.id?.match(/NamespaceProject\/(\d+)$/)?.[1]
            router.push(`/namespace/${namespaceId}/project/${number}/flow`)
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
            <ButtonGroup>
                <Link href={`/namespace/${namespaceIndex}/projects/create`}>
                    <Button color={"success"}>Create</Button>
                </Link>
                <Menu>
                    <MenuTrigger asChild>
                        <Button color={"secondary"} variant={"filled"}>Sort</Button>
                    </MenuTrigger>
                    <MenuPortal>
                        <MenuContent>
                            <MenuCheckboxItem
                                checked={sort["name"] === undefined ? "indeterminate" : sort["name"] === "asc"}
                                onSelect={event => {
                                    if (sort["name"] === undefined)
                                        setSort(prev => ({...prev, name: "asc"}))
                                    else if (sort["name"] === "asc")
                                        setSort(prev => ({...prev, name: "desc"}))
                                    else
                                        setSort(prev => ({...prev, name: undefined}))

                                    event.preventDefault()
                                    event.stopPropagation()
                                }}>
                                {sort["name"] === undefined ? <IconMinus size={13}/> : sort["name"] === "asc" ?
                                    <IconSortDescending size={13}/> : <IconSortAscending size={13}/>}
                                Name
                            </MenuCheckboxItem>
                            <MenuCheckboxItem
                                checked={sort["createdAt"] === undefined ? "indeterminate" : sort["createdAt"] === "asc"}
                                onSelect={event => {
                                    if (sort["createdAt"] === undefined)
                                        setSort(prev => ({...prev, createdAt: "asc"}))
                                    else if (sort["createdAt"] === "asc")
                                        setSort(prev => ({...prev, createdAt: "desc"}))
                                    else
                                        setSort(prev => ({...prev, createdAt: undefined}))

                                    event.preventDefault()
                                    event.stopPropagation()
                                }}>
                                {sort["createdAt"] === undefined ?
                                    <IconMinus size={13}/> : sort["createdAt"] === "asc" ?
                                        <IconSortDescending size={13}/> : <IconSortAscending size={13}/>}
                                Created At
                            </MenuCheckboxItem>
                            <MenuCheckboxItem
                                checked={sort["updatedAt"] === undefined ? "indeterminate" : sort["updatedAt"] === "asc"}
                                onSelect={event => {
                                    if (sort["updatedAt"] === undefined)
                                        setSort(prev => ({...prev, updatedAt: "asc"}))
                                    else if (sort["updatedAt"] === "asc")
                                        setSort(prev => ({...prev, updatedAt: "desc"}))
                                    else
                                        setSort(prev => ({...prev, updatedAt: undefined}))

                                    event.preventDefault()
                                    event.stopPropagation()
                                }}>
                                {sort["updatedAt"] === undefined ?
                                    <IconMinus size={13}/> : sort["updatedAt"] === "asc" ?
                                        <IconSortDescending size={13}/> : <IconSortAscending size={13}/>}
                                Updated At
                            </MenuCheckboxItem>
                        </MenuContent>
                    </MenuPortal>
                </Menu>
            </ButtonGroup>
        </Flex>
        <Spacing spacing={"xl"}/>
        <div style={{width: "100%"}}>
            <ProjectDataTableFilterInputComponent namespaceId={currentUser?.namespace?.id}
                                                  onChange={filter => setFilter(filter)}/>
        </div>
        <Spacing spacing={"xl"}/>
        {projectsList}

    </>

}