import React from "react";
import {NodeToolbar, Position} from "@xyflow/react";
import {Button, ButtonGroup, Text} from "@code0-tech/pictor";
import {IconBackspace, IconPencil, IconSparkles} from "@tabler/icons-react";

export interface FunctionNodeToolbarComponentProps {
    offset?: number
    removable?: boolean
}

export const FunctionNodeToolbarComponent: React.FC<FunctionNodeToolbarComponentProps> = (props) => {

    const {offset = 8, removable = true} = props

    const dispatchShortcut = React.useCallback((event: React.MouseEvent, key: string, code: string, shiftKey: boolean) => {
        document.dispatchEvent(new KeyboardEvent('keydown', {
            key: key,
            code: code,
            shiftKey: shiftKey,
            bubbles: true,
            cancelable: true,
        }))

        event.stopPropagation()
        event.preventDefault()
    }, [])

    return (
        <NodeToolbar align={"center"} offset={offset} position={Position.Top}>
            <ButtonGroup color={"secondary"}>
                {[
                    <Button key={"edit"} variant={"none"} color={"tertiary"} paddingSize={"xxs"}
                            onClick={(event) => dispatchShortcut(event, '1', 'Key1', true)}>
                        <IconPencil size={13}/>
                    </Button>,
                    ...(removable ? [
                        <Button key={"remove"} variant={"none"} color={"tertiary"} paddingSize={"xxs"}
                                onClick={(event) => dispatchShortcut(event, 'Backspace', 'Backspace', false)}>
                            <IconBackspace size={13}/>
                        </Button>
                    ] : []),
                    <Button key={"ai"} variant={"none"} color={"tertiary"} paddingSize={"xxs"}
                            onClick={(event) => dispatchShortcut(event, 'Q', 'KeyQ', true)}>
                        <IconSparkles size={13}/>
                        <Text size={"xs"}>Edit with AI</Text>
                    </Button>
                ]}
            </ButtonGroup>
        </NodeToolbar>
    )
}
