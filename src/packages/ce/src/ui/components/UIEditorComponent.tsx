import {createUsePuck, Puck} from "@puckeditor/core";
import React from "react";
import {Container, Text, TextInput} from "@code0-tech/pictor";

export const usePuck = createUsePuck()

export interface UIEditorComponentProps {
    children: React.ReactNode
}

export const UIEditorComponent: React.FC<UIEditorComponentProps> = (props) => {

    const {children} = props

    const config = {
        root: {
            fields: {}
        },
        components: {
            Heading: {
                fields: {
                    children: {
                        type: "custom",
                        label: "Name",
                        render: (props: any) => {
                            return <TextInput title={props.name} description={props.label} clearable
                                              onChange={(e) => props.onChange(e.currentTarget.value)}/>
                        },
                    },
                },
                render: ({children}: { children: string }) => {
                    return <Text size={"xl"} hierarchy={"primary"}
                                 style={{fontSize: "2rem"}}>{children || "Your Headding"}</Text>;
                },
            },
            Text: {
                fields: {
                    content: {
                        type: "custom",
                        label: "The content of the text component. You can provide the content as text.",
                        render: (props: any) => {
                            return <TextInput title={props.name} description={props.label} clearable
                                              onChange={(e) => props.onChange(e.currentTarget.value)}/>
                        },
                    },
                },
                render: ({content}: { content: string }) => {
                    return <Text size={"md"}>{content || "Your Text"}</Text>;
                },
            },
            Container: {
                fields: {
                    children: {
                        type: "slot",
                    },
                },
                render: ({children: Children}: { children: React.FC }) => {
                    return <Container>{<Children/>}</Container>;
                },
            },
        },
        categories: {
            typography: {
                title: "Typography",
                visible: {
                    icon: "tabler:typography"
                },
                components: [
                    {type: "Heading", title: "Heading", description: "Bla", icon: "tabler:heading"},
                    {type: "Text", title: "Text", description: "Bla", icon: "tabler:text-size"},
                ],
            },
            layout: {
                title: "Layout",
                visible: {
                    icon: "tabler:layout"
                },
                components: [
                    {type: "Container", title: "Container", description: "Bla", icon: "tabler:container"},
                    {type: "Row", title: "Row", description: "Bla", icon: "tabler:layout-list"},
                    {type: "Column", title: "Column", description: "Bla", icon: "tabler:columns-3"},
                ],
            },
        },
    }

    const [data, setData] = React.useState<any>({content: [], root: {props: {}}})

    return <Puck key={JSON.stringify(data)} config={config as any} iframe={{
        enabled: false,
    }} data={data} height={"100%"} onChange={setData}>
        {children}
    </Puck>
}