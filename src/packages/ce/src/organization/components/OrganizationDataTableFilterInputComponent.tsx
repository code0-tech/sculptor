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
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {MemberService} from "@edition/member/services/Member.service";

export interface OrganizationDataTableFilterInputComponentProps {
    onChange: (filter: DataTableFilterProps) => void
}

export const OrganizationDataTableFilterInputComponent: React.FC<OrganizationDataTableFilterInputComponentProps> = (props) => {

    const {onChange} = props

    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)
    const namespaceStore = useStore(NamespaceService)
    const namespaceService = useService(NamespaceService)
    const memberService = useService(MemberService)
    const memberStore = useStore(MemberService)

    const organizations = React.useMemo(
        () => organizationService.values(),
        [organizationStore]
    )

    const namespaces = React.useMemo(
        () => organizations.map(
            organization => namespaceService.getById(organization?.namespace?.id)
        ),
        [namespaceStore, organizations]
    )

    const members = React.useMemo(
        () => namespaces.map(
            namespace => memberService.values({namespaceId: namespace?.id})
        ).flat(),
        [namespaces, memberStore, organizations]
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
        }, {
            token: "Member",
            key: "namespace.members.nodes.user.username",
            operators: ["isOneOf"],
            suggestion: (context, operator, currentValue, applySuggestion) => {

                const split = currentValue.split(",").map(s => s.trim()).filter(Boolean)

                return <DataTableFilterSuggestionMenu context={context}>
                    {members.map(member => {

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
                            {member?.user?.username}
                        </MenuCheckboxItem>
                    })}
                </DataTableFilterSuggestionMenu>
            }
        }
    ]}/>
}