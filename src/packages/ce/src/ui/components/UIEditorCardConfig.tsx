import React from "react";
import {Card} from "@code0-tech/pictor";
import {cardColors} from "@edition/ui/components/UIEditorConfigInputs";

export const UIEditorCardConfig = {
    fields: {
        children: {
            type: "slot",
        },
        color: {
            type: "SelectInput",
            title: "Color",
            options: cardColors,
        },
    },
    defaultProps: {
        color: "primary",
    },
    render: ({children: Children, color}: { children: React.FC, color: "primary" | "secondary" | "tertiary" | "info" | "success" | "warning" | "error" }) => {
        return <Card color={color}>{<Children/>}</Card>
    },
}
