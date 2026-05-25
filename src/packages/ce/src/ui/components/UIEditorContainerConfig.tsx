import React from "react";
import {Container} from "@code0-tech/pictor";

export const UIEditorContainerConfig = {
    fields: {
        children: {
            type: "slot",
        }
    },
    render: ({children: Children}: { children: React.FC<any> }) => {
        return (
            <Container p={0} w={"100%"} miw={"auto"} maw={"100%"}>
                <Children style={{display: "flex", flexDirection: "column", gap: "1rem"}}/>
            </Container>
        )
    }
}
