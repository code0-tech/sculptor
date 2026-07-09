import React from "react";
import {
    DataTableFilterInput,
    DataTableFilterSuggestionMenu,
    MenuCheckboxItem,
    useService,
    useStore
} from "@code0-tech/pictor";
import {IconCheck} from "@tabler/icons-react";
import {DataTableFilterProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {MemberService} from "@edition/member/services/Member.service";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {getNamespaceName} from "@edition/namespace/util/Namespace.name.util";

export interface NamespaceDataTableFilterInputComponentProps {
    onChange: (filter: DataTableFilterProps) => void
}

export const NamespaceDataTableFilterInputComponent: React.FC<NamespaceDataTableFilterInputComponentProps> = (props) => {

    const {onChange} = props

    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)
    const memberService = useService(MemberService)
    const memberStore = useStore(MemberService)
    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const currentSession = useUserSession()

    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, currentSession]
    )

    const memberships = React.useMemo(
        () => currentUser?.namespaceMemberships?.nodes ?? [],
        [currentUser]
    )

    const namespaces = React.useMemo(
        () => memberships.map(
            membership => namespaceService.getById(membership?.namespace?.id)
        ).filter(namespace => !!namespace),
        [namespaceStore, memberships]
    )

    const members = React.useMemo(
        () => {
            // A user can be a member of several namespaces; keep one entry per username
            // since the suggestions filter on the username.
            const seen = new Set<string>()
            return namespaces.map(
                namespace => memberService.values({namespaceId: namespace?.id})
            ).flat().filter(member => {
                const username = member?.user?.username
                if (!username || seen.has(username)) return false
                seen.add(username)
                return true
            })
        },
        [namespaces, memberStore]
    )

    // The editor inside DataTableFilterInput builds its suggestion extension once on
    // mount, so the suggestion callbacks would otherwise close over the empty arrays
    // of the first render. Refs let them read the latest data at invocation time.
    const namespacesRef = React.useRef(namespaces)
    const membersRef = React.useRef(members)

    React.useEffect(() => {
        namespacesRef.current = namespaces
        membersRef.current = members
    }, [namespaces, members])

    return <DataTableFilterInput onChange={onChange} filterTokens={[
        {
            token: "Name",
            key: "name",
            operators: ["isOneOf"],
            suggestion: (context, operator, currentValue, applySuggestion) => {

                const split = currentValue.split(",").map(s => s.trim()).filter(Boolean)

                return <DataTableFilterSuggestionMenu context={context}>
                    {namespacesRef.current.map(namespace => {

                        const name = getNamespaceName(namespace, organizationService, userService)
                        const isChecked = split.includes(name!)

                        return <MenuCheckboxItem key={namespace?.id} checked={isChecked} onSelect={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            const updated = isChecked
                                ? split.filter(n => n !== name)
                                : [...split, name];
                            applySuggestion(updated.join(","), true);
                        }}>
                            {isChecked ? <IconCheck size={13}/> : <IconCheck color={"transparent"} size={13}/>}
                            {name}
                        </MenuCheckboxItem>
                    })}
                </DataTableFilterSuggestionMenu>
            }
        }, {
            token: "Member",
            key: "members.nodes.user.username",
            operators: ["isOneOf"],
            suggestion: (context, operator, currentValue, applySuggestion) => {

                const split = currentValue.split(",").map(s => s.trim()).filter(Boolean)

                return <DataTableFilterSuggestionMenu context={context}>
                    {membersRef.current.map(member => {

                        const isChecked = split.includes(member?.user?.username!)

                        return <MenuCheckboxItem key={member.id} checked={isChecked} onSelect={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            const updated = isChecked
                                ? split.filter(name => name !== member?.user?.username)
                                : [...split, member?.user?.username];
                            applySuggestion(updated.join(","), true);
                        }}>
                            {isChecked ? <IconCheck size={13}/> : <IconCheck color={"transparent"} size={13}/>}
                            @{member?.user?.username}
                        </MenuCheckboxItem>
                    })}
                </DataTableFilterSuggestionMenu>
            }
        }
    ]}/>
}
