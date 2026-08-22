import React from "react";
import {Badge, EditorInput, EditorInputProps, EditorInputValue, EditorTokenRule} from "@code0-tech/pictor"

export interface FlowNameInputComponentProps extends EditorInputProps {

}

export const FlowNameInputComponent: React.FC<FlowNameInputComponentProps> = (props) => {

    const tokenRules: EditorTokenRule[] = [
        {
            pattern: /[^/]+(?=\/)/g,
            wrap: (_text, children) => <Badge color={"info"}>{children}</Badge>,
        },
        {
            pattern: /\//g,
            wrap: (_text, children) => <Badge color={"warning"}>{children}</Badge>,
        },
    ]

    return <EditorInput singleLine tokenRules={tokenRules} {...props}>
        <EditorInputValue/>
    </EditorInput>
}
