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

export interface RoleDataTableFilterInputComponentProps {
    namespaceId?: Namespace['id']
    onChange: (filter: DataTableFilterProps) => void
    preFilter?: (project: DRuntimeView, index: number) => boolean
}

export const RuntimeDataTableFilterInputComponent: React.FC<RoleDataTableFilterInputComponentProps> = (props) => {

    const {namespaceId, onChange, preFilter = () => true} = props

    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)

    const runtimes = React.useMemo(
        () => runtimeService.values({namespaceId}).filter(preFilter),
        [runtimeStore, namespaceId]
    )

    return <DataTableFilterInput onChange={onChange} filterTokens={[
        {
            token: "Name",
            key: "name",
            operators: ["isOneOf"],
            suggestion: (context, operator, currentValue, applySuggestion) => {

                const split = currentValue.split(",").map(s => s.trim()).filter(Boolean)

                return <DataTableFilterSuggestionMenu context={context}>
                    {runtimes.map(runtime => {

                        const isChecked = split.includes(runtime?.name!)

                        return <MenuCheckboxItem key={runtime.id} checked={isChecked} onSelect={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            const updated = isChecked
                                ? split.filter(name => name !== runtime?.name)
                                : [...split, runtime?.name];
                            applySuggestion(updated.join(","), true);
                        }}>
                            {isChecked ? <IconCheck size={13}/> : <IconCheck color={"transparent"} size={13}/>}
                            {runtime?.name}
                        </MenuCheckboxItem>
                    })}
                </DataTableFilterSuggestionMenu>
            }
        }, {
            token: "Status",
            key: "status",
            operators: ["isOneOf"],
            suggestion: (context, operator, currentValue, applySuggestion) => {

                const split = currentValue.split(",").map(s => s.trim()).filter(Boolean)

                return <DataTableFilterSuggestionMenu context={context}>
                    {["CONNECTED", "DISCONNECTED"].map(status => {

                        const isChecked = split.includes(status)

                        return <MenuCheckboxItem key={status} checked={isChecked} onSelect={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            const updated = isChecked
                                ? split.filter(name => name !== status)
                                : [...split, status];
                            applySuggestion(updated.join(","), true);
                        }}>
                            {isChecked ? <IconCheck size={13}/> : <IconCheck color={"transparent"} size={13}/>}
                            {status}
                        </MenuCheckboxItem>
                    })}
                </DataTableFilterSuggestionMenu>
            }
        }
    ]}/>
}