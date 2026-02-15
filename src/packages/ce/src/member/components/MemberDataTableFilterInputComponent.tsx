import React from "react";
import {
    DataTableFilterInput,
    DataTableFilterSuggestionMenu, DRuntimeView,
    MenuCheckboxItem,
    useService,
    useStore
} from "@code0-tech/pictor";
import {IconCheck} from "@tabler/icons-react";
import {Namespace, Runtime} from "@code0-tech/sagittarius-graphql-types";
import {DataTableFilterProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {RoleService} from "@edition/role/services/Role.service";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {UserService} from "@edition/user/services/User.service";
import {MemberService} from "@edition/member/services/Member.service";

export interface MemberDataTableFilterInputComponentProps {
    namespaceId: Namespace['id']
    onChange: (filter: DataTableFilterProps) => void
}

export const MemberDataTableFilterInputComponent: React.FC<MemberDataTableFilterInputComponentProps> = (props) => {

    const {namespaceId, onChange} = props

    const memberService = useService(MemberService)
    const memberStore = useStore(MemberService)
    const roleService = useService(RoleService)
    const roleStore = useStore(RoleService)

    const members = React.useMemo(
        () => memberService.values({namespaceId: namespaceId}),
        [memberStore]
    )

    const roles = React.useMemo(
        () => {
            const roleIds = members.map(m => m.roles?.nodes?.map(r => r?.id)).flat()
            return roleIds.map(id => roleService.getById(id)).filter(Boolean)
        },
        [roleStore]
    )

    return <DataTableFilterInput onChange={onChange} filterTokens={[
        {
            token: "Username",
            key: "user.username",
            operators: ["isOneOf"],
            suggestion: (context, operator, currentValue, applySuggestion) => {

                const split = currentValue.split(",").map(s => s.trim()).filter(Boolean)

                return <DataTableFilterSuggestionMenu context={context}>
                    {members.map(member => {

                        const isChecked = split.includes(member?.user?.username!)

                        return <MenuCheckboxItem key={member?.user?.username} checked={isChecked} onSelect={e => {
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
        },
        {
            token: "Roles",
            key: "roles.nodes.name",
            operators: ["isOneOf"],
            suggestion: (context, operator, currentValue, applySuggestion) => {

                const split = currentValue.split(",").map(s => s.trim()).filter(Boolean)

                return <DataTableFilterSuggestionMenu context={context}>
                    {roles.map(role => {

                        const isChecked = split.includes(role?.name!)

                        return <MenuCheckboxItem key={role?.name} checked={isChecked} onSelect={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            const updated = isChecked
                                ? split.filter(name => name !== role?.name)
                                : [...split, role?.name];
                            applySuggestion(updated.join(","), true);
                        }}>
                            {isChecked ? <IconCheck size={13}/> : <IconCheck color={"transparent"} size={13}/>}
                            {role?.name}
                        </MenuCheckboxItem>
                    })}
                </DataTableFilterSuggestionMenu>
            }
        }
    ]}/>
}