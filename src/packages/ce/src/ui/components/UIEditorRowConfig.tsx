import React from "react";

export const UIEditorRowConfig = {
    fields: {
        children: {
            type: "slot",
        },
    },
    render: ({children: Children}: { children: React.FC<any> }) => {
        return (
            <Children
                as={"div"}
                collisionAxis={"x"}
                minEmptyHeight={120}
            />
        )
    },
}
