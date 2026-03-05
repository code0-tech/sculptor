import React, {RefObject} from "react";
import {IconX} from "@tabler/icons-react";
import "./FunctionSuggestionSearchInput.style.scss"
import {clearInputElement} from "@code0-tech/pictor/dist/components/form/Input.utils";
import {Button, Input, InputProps} from "@code0-tech/pictor";

interface FunctionSuggestionSearchInputProps extends Omit<InputProps<string | null>, "wrapperComponent" | "type"> {
    //defaults to false
    clearable?: boolean
}

//@ts-ignore
export const FunctionSuggestionSearchInput: React.ForwardRefExoticComponent<FunctionSuggestionSearchInputProps> = React.forwardRef((props, ref: RefObject<HTMLElement>) => {
    ref = ref || React.useRef<HTMLElement>(null)

    const {
        clearable = false,
        right,
        ...rest
    } = props

    const toClearable = () => {
        clearInputElement(ref.current)
    }

    const rightAction = [right]
    clearable && rightAction.push(<Button variant={"none"} onClick={toClearable}><IconX size={13}/></Button>)


    return <Input
        wrapperComponent={{
            className: "d-flow-suggestion-search-input",
        }}
        right={rightAction}
        type={"text"}
        ref={ref as RefObject<HTMLInputElement>}
        {...rest}
    />
})
