import React from "react";
import {FunctionSuggestion} from "./FunctionSuggestionComponent.view";
import {toInputSuggestions} from "./FunctionSuggestionMenuComponent.util";
import {FunctionSuggestionSearchBarComponent} from "./FunctionSuggestionSearchBarComponent";
import {
    Card, InputSuggestion,
    InputSuggestionMenuContent,
    InputSuggestionMenuContentItems,
    InputSuggestionMenuContentItemsHandle,
    Menu,
    MenuPortal,
    MenuTrigger
} from "@code0-tech/pictor";

export interface FunctionSuggestionMenuComponentProps {
    triggerContent: React.ReactNode
    suggestions?: InputSuggestion[]
    onSuggestionSelect?: (suggestion: FunctionSuggestion) => void
}

export const FunctionSuggestionMenuComponent: React.FC<FunctionSuggestionMenuComponentProps> = (props) => {

    const {suggestions = [], triggerContent, onSuggestionSelect = () => null} = props

    return <Menu>
        <MenuTrigger asChild>
            {triggerContent}
        </MenuTrigger>
        <MenuPortal>
            <InputSuggestionMenuContent align={"end"} color={"secondary"} data-qa-selector={"flow-builder-suggestions"}>
                <Card paddingSize={"xxs"} mt={-0.2} mx={-0.2}>
                    <InputSuggestionMenuContentItems
                        suggestions={suggestions}
                        onSuggestionSelect={(suggestion) => {
                            onSuggestionSelect(suggestion.value)
                        }}
                    />
                </Card>

            </InputSuggestionMenuContent>
        </MenuPortal>
    </Menu>

}