import React from "react";
import {FunctionSuggestionSearchInputComponent} from "./FunctionSuggestionSearchInputComponent";
import {IconSearch} from "@tabler/icons-react";
import {Component} from "@code0-tech/pictor";

export interface FunctionSuggestionSearchBarProps extends Component<HTMLDivElement> {
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