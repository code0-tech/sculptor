import {Text} from "@code0-tech/pictor";

export const UIEditorLinkConfig = {
    fields: {
        content: {
            type: "TextInput",
            title: "Content",
        },
        link: {
            type: "TextInput",
            title: "Link",
            validateUrl: true,
        },
    },
    defaultProps: {
        content: "Your Link",
        link: "https://example.com",
    },
    render: ({content}: { content: string, link: string }) => {
        return (
            <Text size={"md"}>
                {content || "Your Link"}
            </Text>
        )
    },
}
