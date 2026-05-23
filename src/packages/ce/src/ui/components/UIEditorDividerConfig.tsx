import React from "react";
import {dividerOrientations} from "@edition/ui/components/UIEditorConfigInputs";

export const UIEditorDividerConfig = {
    inline: true,
    fields: {
        orientation: {
            type: "SelectInput",
            title: "Orientation",
            options: dividerOrientations,
            defaultValue: "vertical",
        },
    },
    defaultProps: {
        orientation: "vertical",
    },
    render: ({orientation, puck}: { orientation: "vertical" | "horizontal", puck?: { dragRef?: React.Ref<HTMLDivElement> } }) => {
        const vertical = orientation === "vertical"
        const color = "#6b7280"

        return (
            <div
                ref={puck?.dragRef}
                style={vertical
                    ? {
                        position: "relative",
                        flex: "0 0 16px",
                        width: "16px",
                        minHeight: "100px",
                        alignSelf: "stretch",
                        display: "flex",
                        justifyContent: "center",
                        cursor: "grab",
                        padding: 0,
                        marginLeft: "-8px",
                        marginRight: "-8px",
                        zIndex: 1,
                    }
                    : {
                        position: "relative",
                        width: "100%",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        cursor: "grab",
                        padding: 0,
                        marginTop: "-8px",
                        marginBottom: "-8px",
                        zIndex: 1,
                    }}
            >
                <div
                    style={vertical
                        ? {
                            width: "2px",
                            minHeight: "100px",
                            alignSelf: "stretch",
                            backgroundColor: color,
                            borderRadius: "1px",
                        }
                        : {
                            width: "100%",
                            height: "2px",
                            backgroundColor: color,
                            borderRadius: "1px",
                        }}
                />
            </div>
        )
    },
}
