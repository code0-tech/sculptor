import React from "react";
import {Row} from "@code0-tech/pictor";

export const UIEditorRowConfig = {
    fields: {
        children: {
            type: "slot",
        }
    },
    render: ({children: Children}: { children: React.FC<any> }) => {
        return (
            <Children
                as={Row}
                collisionAxis={"x"}
                minEmptyHeight={120}
            />
        )
    }
}
