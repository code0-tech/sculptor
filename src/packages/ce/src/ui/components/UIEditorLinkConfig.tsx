import {Text} from "@code0-tech/pictor";
import Link from "next/link";
import {isValidUrl} from "@edition/ui/components/UIEditorConfigInputs";

export const UIEditorLinkConfig = {
    fields: {
        content: {
            type: "TextInput",
            title: "Content",
            defaultValue: "Your Link",
        },
        link: {
            type: "TextInput",
            title: "Link",
            defaultValue: "https://example.com",
            validateUrl: true,
        },
    },
    defaultProps: {
        content: "Your Link",
        link: "https://example.com",
    },
    render: ({content, link}: { content: string, link: string }) => {
        const href = isValidUrl(link) ? link : "https://example.com"

        return (
            <Link href={href} target={"_blank"} rel={"noreferrer"}>
                <Text size={"md"}>
                    {content || "Your Link"}
                </Text>
            </Link>
        )
    },
}
