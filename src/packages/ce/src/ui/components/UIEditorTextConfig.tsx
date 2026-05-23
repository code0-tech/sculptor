import {Text} from "@code0-tech/pictor";
import {textHierarchyOptions} from "@edition/ui/components/UIEditorConfigInputs";

export const UIEditorTextConfig = {
    fields: {
        content: {
            type: "TextInput",
            title: "Content",
            defaultValue: "Your Text",
        },
        hierarchy: {
            type: "SelectInput",
            title: "Hierarchy",
            options: textHierarchyOptions,
            defaultValue: "primary",
        },
    },
    render: ({content, hierarchy}: { content: string, hierarchy: "primary" | "secondary" | "tertiary" }) => {
        return <Text size={"md"} hierarchy={hierarchy}>{content || "Your Text"}</Text>
    },
}
