import React from "react";
import {FunctionSuggestionSearchInputComponent} from "./FunctionSuggestionSearchInputComponent";
import {IconSearch} from "@tabler/icons-react";
import {Code0Component} from "@code0-tech/pictor";

export interface FunctionSuggestionSearchBarProps extends Code0Component<HTMLDivElement> {
    onType: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

export const FunctionSuggestionSearchBarComponent: React.FC<FunctionSuggestionSearchBarProps> = (props) => {
    return <FunctionSuggestionSearchInputComponent placeholder={"Search..."}
                                                   onKeyUp={(event) => props.onType(event)}
                                                   clearable
                                                   style={{background: "none", boxShadow: "none"}}
                                                   autoFocus
                                                   left={<IconSearch size={12}/>}
    />
}