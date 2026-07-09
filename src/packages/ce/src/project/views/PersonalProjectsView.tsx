import React from "react";
import {
    Button,
    Flex,
    Menu,
    MenuCheckboxItem,
    MenuContent,
    MenuPortal,
    MenuTrigger,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {ProjectDataTableComponent} from "@edition/project/components/ProjectDataTableComponent";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {ProjectDataTableFilterInputComponent} from "@edition/project/components/ProjectDataTableFilterInputComponent";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {IconMinus, IconSortAscending, IconSortDescending} from "@tabler/icons-react";
import {useUserSession} from "@edition/user/hooks/User.session.hook";

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
        return <ProjectDataTableComponent filter={filter} sort={sort} onSelect={(project) => {
            const number = project?.id?.match(/NamespaceProject\/(\d+)$/)?.[1]
            router.push(`/namespace/${namespaceIndex}/project/${number}/flow`)
        }} namespaceId={currentUser.namespace.id}/>

    }, [currentUser, filter, sort])

    return <>
        {projectsList}

    </>

}