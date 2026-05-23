import {Text} from "@code0-tech/pictor";
import {headingSizes} from "@edition/ui/components/UIEditorConfigInputs";

export const UIEditorHeadingConfig = {
    fields: {
        content: {
            type: "TextInput",
            title: "Content",
            defaultValue: "Your Heading",
        },
        size: {
            type: "SelectInput",
            title: "Size",
            options: headingSizes,
            defaultValue: "h1",
        },
    },
    defaultProps: {
        content: "Your Heading",
        size: "h1",
    },
    render: ({content, size}: { content: string, size: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" }) => {
        const fontSizes = {
            h1: "2rem",
            h2: "1.5rem",
            h3: "1.25rem",
            h4: "1rem",
            h5: "0.875rem",
            h6: "0.75rem",
        }

        return (
            <Text
                size={"xl"}
                hierarchy={"primary"}
                style={{fontSize: fontSizes[size]}}
            >
                {content}
            </Text>
        )
    },
}
