import React from "react";
import {
    DataTableFilterInput,
    DataTableFilterSuggestionMenu,
    MenuCheckboxItem,
    useService,
    useStore
} from "@code0-tech/pictor";
import {IconCheck} from "@tabler/icons-react";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {DataTableFilterProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {RoleService} from "@edition/role/services/Role.service";

export interface RoleDataTableFilterInputComponentProps {
    namespaceId: Namespace['id']
    onChange: (filter: DataTableFilterProps) => void
}

export const RoleDataTableFilterInputComponent: React.FC<RoleDataTableFilterInputComponentProps> = (props) => {

    const {namespaceId, onChange} = props

    const roleService = useService(RoleService)
    const roleStore = useStore(RoleService)

    const roles = React.useMemo(
        () => roleService.values({namespaceId: namespaceId}),
        [roleStore, namespaceId]
    )

    const abilities = React.useMemo(() => {
        const all = new Set<string>()
        roles.forEach(role => role.abilities?.forEach(ability => all.add(ability)))
        return Array.from(all)
    }, [roles])

    return <DataTableFilterInput onChange={onChange} filterTokens={[
        {
            token: "Name",
            key: "name",
            operators: ["isOneOf"],
            suggestion: (context, operator, currentValue, applySuggestion) => {

                const split = currentValue.split(",").map(s => s.trim()).filter(Boolean)

                return <DataTableFilterSuggestionMenu context={context}>
                    {roles.map(role => {

                        const isChecked = split.includes(role?.name!)

                        return <MenuCheckboxItem key={role.id} checked={isChecked} onSelect={e => {
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
        }, {
            token: "Permissions",
            key: "abilities",
            operators: ["isOneOf"],
            suggestion: (context, operator, currentValue, applySuggestion) => {

                const split = currentValue.split(",").map(s => s.trim()).filter(Boolean)

                return <DataTableFilterSuggestionMenu context={context}>
                    {abilities.map(ability => {

                        const isChecked = split.includes(ability)

                        return <MenuCheckboxItem key={ability} checked={isChecked} onSelect={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            const updated = isChecked
                                ? split.filter(name => name !== ability)
                                : [...split, ability];
                            applySuggestion(updated.join(","), true);
                        }}>
                            {isChecked ? <IconCheck size={13}/> : <IconCheck color={"transparent"} size={13}/>}
                            {ability}
                        </MenuCheckboxItem>
                    })}
                </DataTableFilterSuggestionMenu>
            }
        }
    ]}/>
}