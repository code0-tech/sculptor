import React from "react";
import {Row} from "@code0-tech/pictor";

const HALF_COMPONENT_GAP = "0.5rem"

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
                style={{marginLeft: `-${HALF_COMPONENT_GAP}`, marginRight: `-${HALF_COMPONENT_GAP}`}}
            />
        )
    }
}
