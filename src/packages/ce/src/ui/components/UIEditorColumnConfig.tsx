import React from "react";
import {Col} from "@code0-tech/pictor";
import {columnSizeOptions, columnSizeToSpan} from "@edition/ui/components/UIEditorConfigInputs";

const HALF_COMPONENT_GAP = "0.5rem"

export const UIEditorColumnConfig = {
    inline: true,
    fields: {
        children: {
            type: "slot",
        },
        column_size: {
            type: "SelectInput",
            title: "Column Size",
            options: columnSizeOptions,
            defaultValue: "50%",
        }
    },
    defaultProps: {
        column_size: "50%",
    },
    render: ({children: Children, column_size, puck}: { children: React.FC<any>, column_size: keyof typeof columnSizeToSpan, puck?: { dragRef?: React.Ref<HTMLDivElement> } }) => {
        return (
            <Col
                ref={puck?.dragRef}
                xs={columnSizeToSpan[column_size] ?? 12}
                style={{paddingLeft: HALF_COMPONENT_GAP, paddingRight: HALF_COMPONENT_GAP, boxSizing: "border-box"}}
            >
                <Children style={{display: "flex", flexDirection: "column", gap: "1rem"}}/>
            </Col>
        )
    }
}
