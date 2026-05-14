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
        "categories": {
            "all": {
                "title": "All",
                "visible": {
                    "icon": "tabler:all"
                },
                "components": [
                    { "type": "Heading", "title": "Heading", "description": "Display eye-catching titles and section headers.", "icon": "tabler:heading" },
                    { "type": "Text", "title": "Text", "description": "Add and style paragraph text for your content.", "icon": "tabler:text-size" },
                    { "type": "Container", "title": "Container", "description": "A versatile wrapper to group and align components.", "icon": "tabler:container" },
                    { "type": "Row", "title": "Row", "description": "Arrange elements horizontally in a flexible row.", "icon": "tabler:layout-list" },
                    { "type": "Column", "title": "Column", "description": "Create vertical sections within your layout.", "icon": "tabler:columns-3" },
                    { "type": "Link", "title": "Link", "description": "Add clickable navigation or external references.", "icon": "tabler:link" },
                    { "type": "Divider", "title": "Divider", "description": "Visually separate sections with a clean line.", "icon": "tabler:divider" },
                    { "type": "Table", "title": "Table", "description": "Organize and display data in structured rows and columns.", "icon": "tabler:table" },
                    { "type": "Graph", "title": "Graph", "description": "Visualize complex data sets with dynamic charts.", "icon": "tabler:graph" }
                ]
            },
            "typography": {
                "title": "Typography",
                "visible": {
                    "icon": "tabler:typography"
                },
                "components": [
                    { "type": "Heading", "title": "Heading", "description": "Display eye-catching titles and section headers.", "icon": "tabler:heading" },
                    { "type": "Text", "title": "Text", "description": "Add and style paragraph text for your content.", "icon": "tabler:text-size" }
                ]
            },
            "layout": {
                "title": "Layout",
                "visible": {
                    "icon": "tabler:layout"
                },
                "components": [
                    { "type": "Container", "title": "Container", "description": "A versatile wrapper to group and align components.", "icon": "tabler:container" },
                    { "type": "Row", "title": "Row", "description": "Arrange elements horizontally in a flexible row.", "icon": "tabler:layout-list" },
                    { "type": "Column", "title": "Column", "description": "Create vertical sections within your layout.", "icon": "tabler:columns-3" }
                ]
            },
            "elements": {
                "title": "Elements",
                "visible": {
                    "icon": "tabler:atom"
                },
                "components": [
                    { "type": "Link", "title": "Link", "description": "Add clickable navigation or external references.", "icon": "tabler:link" },
                    { "type": "Divider", "title": "Divider", "description": "Visually separate sections with a clean line.", "icon": "tabler:divider" }
                ]
            },
            "data": {
                "title": "Data",
                "visible": {
                    "icon": "tabler:database"
                },
                "components": [
                    { "type": "Table", "title": "Table", "description": "Organize and display data in structured rows and columns.", "icon": "tabler:table" },
                    { "type": "Graph", "title": "Graph", "description": "Visualize complex data sets with dynamic charts.", "icon": "tabler:graph" }
                ]
            }
        },
    }

    const [data, setData] = React.useState<any>({content: [], root: {props: {}}})

    return <Puck config={config as any} iframe={{
        enabled: false,
    }} data={data} height={"100%"} onChange={setData}>
        {children}
    </Puck>
}