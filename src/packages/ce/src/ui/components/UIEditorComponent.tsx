import {createUsePuck, Puck} from "@puckeditor/core";
import React from "react";
import {UIEditorActionBarComponent} from "@edition/ui/components/UIEditorActionBarComponent";
import {UIEditorCardConfig} from "@edition/ui/components/UIEditorCardConfig";
import {UIEditorColumnConfig} from "@edition/ui/components/UIEditorColumnConfig";
import {UIEditorContainerConfig} from "@edition/ui/components/UIEditorContainerConfig";
import {UIEditorDividerConfig} from "@edition/ui/components/UIEditorDividerConfig";
import {UIEditorGraphConfig} from "@edition/ui/components/UIEditorGraphConfig";
import {UIEditorHeadingConfig} from "@edition/ui/components/UIEditorHeadingConfig";
import {UIEditorLinkConfig} from "@edition/ui/components/UIEditorLinkConfig";
import {UIEditorRowConfig} from "@edition/ui/components/UIEditorRowConfig";
import {UIEditorTableConfig} from "@edition/ui/components/UIEditorTableConfig";
import {UIEditorTextConfig} from "@edition/ui/components/UIEditorTextConfig";
import {
    UIEditorDataTableFilterInputField,
    UIEditorMultiSelectInputField,
    UIEditorNumberInputField,
    UIEditorSelectInputField,
    UIEditorSwitchInputField,
    UIEditorTextInputField,
} from "@edition/ui/components/UIEditorConfigInputs";

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
            Heading: UIEditorHeadingConfig,
            Text: UIEditorTextConfig,
            Container: UIEditorContainerConfig,
            Row: UIEditorRowConfig,
            Column: UIEditorColumnConfig,
            Link: UIEditorLinkConfig,
            Card: UIEditorCardConfig,
            Divider: UIEditorDividerConfig,
            Table: UIEditorTableConfig,
            Graph: UIEditorGraphConfig,
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
                    { "type": "Card", "title": "Card", "description": "Group content inside a styled surface.", "icon": "tabler:cards" },
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
                    { "type": "Card", "title": "Card", "description": "Group content inside a styled surface.", "icon": "tabler:cards" },
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
        }
    }

    const [data, setData] = React.useState<any>({content: [], root: {props: {}}})

    return (
        <Puck
            config={config as any}
            iframe={{
                enabled: false,
            }}
            overrides={{
                actionBar: UIEditorActionBarComponent,
                fieldTypes: {
                    TextInput: UIEditorTextInputField,
                    SelectInput: UIEditorSelectInputField,
                    MultiSelectInput: UIEditorMultiSelectInputField,
                    NumberInput: UIEditorNumberInputField,
                    DataTableFilterInput: UIEditorDataTableFilterInputField,
                    SwitchInput: UIEditorSwitchInputField,
                } as any,
            }}
            data={data}
            height={"100%"}
            onChange={setData}
        >
            {children}
        </Puck>
    )
}
