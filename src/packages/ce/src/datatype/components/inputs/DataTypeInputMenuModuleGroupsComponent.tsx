import React from "react";
import {
    Flex,
    hashToColor,
    Icon,
    IconString,
    MenuItem,
    MenuSub,
    MenuSubContent,
    MenuSubTrigger,
    TagInputMenuItem,
    TagInputSubMenu,
    Text
} from "@code0-tech/pictor";
import {IconChevronRight} from "@tabler/icons-react";
import {
    Suggestion,
    SuggestionGroup,
    SuggestionTagKey,
    SuggestionValue
} from "@edition/function/components/suggestion/Suggestion.util";
import {useFlowReferenceHoverStore} from "@edition/flow/hooks/Flow.reference.hover.hook";

export interface DataTypeInputMenuModuleGroupsComponentProps {
    moduleGroups: SuggestionGroup[]
    suggestions: SuggestionValue[]
    mode: "tag" | "menu"
    tagKeys?: SuggestionTagKey[]
    onSelect?: (value: SuggestionValue) => void
    onVariantRequest: (suggestion: Suggestion) => void
}

export const DataTypeInputMenuModuleGroupsComponent: React.FC<DataTypeInputMenuModuleGroupsComponentProps> = (props) => {

    const {moduleGroups, suggestions, mode, tagKeys, onSelect, onVariantRequest} = props

    const setHoveredNodeId = useFlowReferenceHoverStore(state => state.setHoveredNodeId)

    return <>
        {moduleGroups.map((group, index) => {

            const groupLabel = <Flex align={"center"} justify={"space-between"} style={{gap: "0.7rem"}} w={"100%"}
                                     onMouseEnter={() => setHoveredNodeId(null)}>
                <Flex align={"center"} style={{gap: "0.35rem"}}>
                    <Icon icon={group.icon as IconString} size={13} color={hashToColor(`group-${index}`)}/>
                    <Text>{group.displayMessage}</Text>
                </Flex>
                <IconChevronRight size={12}/>
            </Flex>

            const groupItems = group.suggestions.map((suggestion, suggestionIndex) => {

                const directValue = suggestion.variants.find(variant => variant.__typename === "SubFlowValue")
                const resultValue = suggestion.variants.find(variant => variant.__typename === "NodeFunction")
                const directIndex = directValue ? suggestions.indexOf(directValue) : -1
                const resultIndex = resultValue ? suggestions.indexOf(resultValue) : -1

                const content = <Flex align={"center"} style={{gap: "0.35rem"}}
                                      onMouseEnter={() => setHoveredNodeId(null)}>
                    <Icon icon={suggestion.icon as IconString} size={13} color={hashToColor(`group-${index}`)}/>
                    <Text>{suggestion.displayMessage}</Text>
                </Flex>

                if (directIndex >= 0 && resultIndex >= 0) return <MenuItem key={suggestionIndex}
                                                                           title={suggestion.description}
                                                                           onFocus={() => setHoveredNodeId(null)}
                                                                           onSelect={() => onVariantRequest(suggestion)}>
                    {content}
                </MenuItem>

                if (mode === "menu") return <MenuItem key={suggestionIndex} title={suggestion.description}
                                                      onFocus={() => setHoveredNodeId(null)}
                                                      onSelect={() => onSelect?.(suggestion.value)}>
                    {content}
                </MenuItem>

                const valueIndex = suggestions.indexOf(suggestion.value)
                if (valueIndex < 0) return null

                return <TagInputMenuItem key={suggestionIndex} value={tagKeys?.[valueIndex]} data={suggestion.value}
                                         aliases={[suggestion.displayMessage, ...(suggestion.aliases ?? [])]}
                                         title={suggestion.description}>
                    {content}
                </TagInputMenuItem>
            })

            if (mode === "menu") return <MenuSub key={`group-${index}`}>
                <MenuSubTrigger onMouseEnter={() => setHoveredNodeId(null)}
                                onFocus={() => setHoveredNodeId(null)}>{groupLabel}</MenuSubTrigger>
                <MenuSubContent align={"start"} collisionPadding={16} alignOffset={0} sideOffset={0}>
                    {groupItems}
                </MenuSubContent>
            </MenuSub>

            return <TagInputSubMenu key={`group-${index}`} label={groupLabel}>
                {groupItems}
            </TagInputSubMenu>
        })}
    </>
}
