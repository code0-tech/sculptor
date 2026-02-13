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
import {OrganizationService} from "@edition/organization/Organization.service";

export interface OrganizationDataTableFilterInputComponentProps {
    onChange: (filter: DataTableFilterProps) => void
}

export const OrganizationDataTableFilterInputComponent: React.FC<OrganizationDataTableFilterInputComponentProps> = (props) => {

    const {onChange} = props

    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)

    const organizations = React.useMemo(
        () => organizationService.values(),
        [organizationStore]
    )

    return <DataTableFilterInput onChange={onChange} filterTokens={[
        {
            token: "Name",
            key: "name",
            operators: ["isOneOf"],
            suggestion: (context, operator, currentValue, applySuggestion) => {

                const split = currentValue.split(",").map(s => s.trim()).filter(Boolean)

                return <DataTableFilterSuggestionMenu context={context}>
                    {organizations.map(organization => {

                        const isChecked = split.includes(organization?.name!)

                        return <MenuCheckboxItem key={organization.id} checked={isChecked} onSelect={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            const updated = isChecked
                                ? split.filter(name => name !== organization?.name)
                                : [...split, organization?.name];
                            applySuggestion(updated.join(","), true);
                        }}>
                            {isChecked ? <IconCheck size={13}/> : <IconCheck color={"transparent"} size={13}/>}
                            {organization?.name}
                        </MenuCheckboxItem>
                    })}
                </DataTableFilterSuggestionMenu>
            }
        }
    ]}/>
}