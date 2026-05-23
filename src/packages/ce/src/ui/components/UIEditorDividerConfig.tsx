import {dividerOrientations} from "@edition/ui/components/UIEditorConfigInputs";

export const UIEditorDividerConfig = {
    fields: {
        orientation: {
            type: "SelectInput",
            title: "Orientation",
            options: dividerOrientations,
        },
    },
    defaultProps: {
        orientation: "horizontal",
    },
    render: ({orientation}: { orientation: "vertical" | "horizontal" }) => {
        return (
            <hr
                style={orientation === "vertical"
                    ? {width: 0, height: "100px", border: 0, borderLeft: "1px solid currentColor"}
                    : {width: "100%", border: 0, borderTop: "1px solid currentColor"}}
            />
        )
    },
}
