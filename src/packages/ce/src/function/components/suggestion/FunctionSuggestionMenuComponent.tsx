import React from "react";
import {FunctionSuggestion} from "./FunctionSuggestionComponent.view";
import {toInputSuggestions} from "./FunctionSuggestionMenuComponent.util";
import {FunctionSuggestionSearchBarComponent} from "./FunctionSuggestionSearchBarComponent";
import {
    Card,
    InputSuggestionMenuContent,
    InputSuggestionMenuContentItems,
    InputSuggestionMenuContentItemsHandle,
    Menu,
    MenuPortal,
    MenuTrigger
} from "@code0-tech/pictor";

export interface FunctionSuggestionMenuComponentProps {
    triggerContent: React.ReactNode
    suggestions?: FunctionSuggestion[]
    onSuggestionSelect?: (suggestion: FunctionSuggestion) => void
}

export const FunctionSuggestionMenuComponent: React.FC<FunctionSuggestionMenuComponentProps> = (props) => {

    const {suggestions = [], triggerContent, onSuggestionSelect = () => null} = props

    const menuRef = React.useRef<InputSuggestionMenuContentItemsHandle | null>(null); // Ref to suggestion list
    const [stateSuggestions, setStateSuggestions] = React.useState(suggestions)

    React.useEffect(() => {
        setStateSuggestions(suggestions)
    }, [suggestions])

    return <Menu>
        <MenuTrigger asChild>
            {triggerContent}
        </MenuTrigger>
        <MenuPortal>
            <InputSuggestionMenuContent align={"center"} color={"secondary"} data-qa-selector={"flow-builder-suggestions"}>
                <FunctionSuggestionSearchBarComponent onType={event => {

                    if (event.key === "ArrowDown") {
                        event.preventDefault();
                        menuRef.current?.focusFirstItem(); // Navigate down
                    } else if (event.key === "ArrowUp") {
                        event.preventDefault();
                        menuRef.current?.focusLastItem(); // Navigate up
                    }

                    // @ts-ignore
                    const searchTerm = event.target.value
                    setStateSuggestions(suggestions.filter(suggestion => {
                        return suggestion.displayText.some(text => {
                            return text.includes(searchTerm)
                        })
                    }))
                    event.preventDefault()
                    return false
                }}/>
                <Card paddingSize={"xxs"} mt={-0.2} mx={-0.2}>
                    <InputSuggestionMenuContentItems
                        /* @ts-ignore */
                        ref={menuRef}
                        suggestions={toInputSuggestions(stateSuggestions)}
                        onSuggestionSelect={(suggestion) => {
                            onSuggestionSelect(suggestion.valueData as FunctionSuggestion)
                        }}
                    />
                </Card>

            </InputSuggestionMenuContent>
        </MenuPortal>
    </Menu>

}