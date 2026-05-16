import {createUsePuck, Puck} from "@puckeditor/core";
import React from "react";
import {Card, CheckboxInput, Col, Container, DataTableFilterInput, Flex, NumberInput, Row, SelectContent, SelectInput, SelectItem, SelectItemText, SelectPortal, SelectTrigger, SelectValue, SelectViewport, SwitchInput, Text, TextInput} from "@code0-tech/pictor";
import {IconChevronDown} from "@tabler/icons-react";

export const usePuck = createUsePuck()

const headingSizes = Array.from({length: 6}, (_, index) => {
    const level = index + 1

    return {
        label: `Heading ${level}`,
        value: `h${level}`,
    }
})

const cardColors = [
    {label: "Primary", value: "primary"},
    {label: "Secondary", value: "secondary"},
    {label: "Tertiary", value: "tertiary"},
    {label: "Info", value: "info"},
    {label: "Success", value: "success"},
    {label: "Warning", value: "warning"},
    {label: "Error", value: "error"},
]

const dividerOrientations = [
    {label: "Horizontal", value: "horizontal"},
    {label: "Vertical", value: "vertical"},
]

const runtimeOptions = [
    {label: "Default Runtime", value: "default-runtime"},
]

const moduleOptions = [
    {label: "Users", value: "users"},
    {label: "Projects", value: "projects"},
    {label: "Organizations", value: "organizations"},
]

const columnOptions = [
    {label: "Name", value: "name"},
    {label: "Description", value: "description"},
    {label: "Created At", value: "createdAt"},
    {label: "Updated At", value: "updatedAt"},
]

const axisOptions = [
    {label: "Name", value: "name"},
    {label: "Created At", value: "createdAt"},
    {label: "Updated At", value: "updatedAt"},
    {label: "Count", value: "count"},
]

const axisTypeOptions = [
    {label: "Date", value: "date"},
    {label: "Number", value: "number"},
    {label: "Text", value: "text"},
]

const textHierarchyOptions = [
    {label: "Primary", value: "primary"},
    {label: "Secondary", value: "secondary"},
    {label: "Tertiary", value: "tertiary"},
]

const columnSizeOptions = [
    {label: "25%", value: "25%"},
    {label: "33%", value: "33%"},
    {label: "50%", value: "50%"},
    {label: "100%", value: "100%"},
]

const isValidUrl = (value: string) => {
    try {
        const url = new URL(value)

        return url.protocol === "http:" || url.protocol === "https:"
    } catch {
        return false
    }
}

const renderSelectInput = (title: string, options: { label: string, value: string }[]) => {
    return (props: any) => {
        return (
            <SelectInput
                title={title}
                onValueChange={(value) => props.onChange(value)}
            >
                <SelectTrigger asChild>
                    <Flex justify={"space-between"} align={"center"}>
                        <SelectValue placeholder={"Select..."}/>
                        <IconChevronDown size={13}/>
                    </Flex>
                </SelectTrigger>
                <SelectPortal>
                    <SelectContent position={"item-aligned"}>
                        <SelectViewport>
                            {options.map((option) => {
                                return (
                                    <SelectItem key={option.value} value={option.value}>
                                        <SelectItemText>
                                            {option.label}
                                        </SelectItemText>
                                    </SelectItem>
                                )
                            })}
                        </SelectViewport>
                    </SelectContent>
                </SelectPortal>
            </SelectInput>
        )
    }
}

const renderNumberInput = (title: string) => {
    return (props: any) => {
        return (
            <NumberInput
                title={title}
                value={props.value?.toString() ?? ""}
                onChange={(e) => props.onChange(Number(e.currentTarget.value))}
            />
        )
    }
}

const MultipleSelectInput: React.FC<{
    title: string
    value?: string[]
    options: { label: string, value: string }[]
    onChange: (value: string[]) => void
}> = (props) => {
    const {title, value, options, onChange} = props
    const selectedValues = Array.isArray(value) ? value : []

    return (
        <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
            <Text size={"sm"} hierarchy={"primary"}>{title}</Text>
            {options.map((option) => {
                const selected = selectedValues.includes(option.value)

                return (
                    <CheckboxInput
                        key={option.value}
                        label={option.label}
                        checked={selected}
                        onCheckedChange={(checked) => {
                            onChange(checked === true
                                ? [...selectedValues, option.value]
                                : selectedValues.filter((selectedValue) => selectedValue !== option.value))
                        }}
                    />
                )
            })}
        </Flex>
    )
}

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
                    content: {
                        type: "custom",
                        label: "Name",
                        render: (props: any) => {
                            return (
                                <TextInput
                                    title={props.name}
                                    description={props.label}
                                    clearable
                                    onChange={(e) => props.onChange(e.currentTarget.value)}
                                />
                            )
                        },
                    },
                    size: {
                        type: "custom",
                        label: "Size",
                        render: renderSelectInput("Size", headingSizes),
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
                            style={{ fontSize: fontSizes[size] }}
                        >
                            {content}
                        </Text>
                    )
                },
            },
            Text: {
                fields: {
                    content: {
                        type: "custom",
                        label: "The content of the text component. You can provide the content as text.",
                        render: (props: any) => {
                            return (
                                <TextInput
                                    title={props.name}
                                    description={props.label}
                                    clearable
                                    onChange={(e) => props.onChange(e.currentTarget.value)}
                                />
                            )
                        },
                    },
                    hierarchy: {
                        type: "custom",
                        label: "Hierarchy",
                        render: renderSelectInput("Hierarchy", textHierarchyOptions),
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
            Row: {
                fields: {
                    children: {
                        type: "slot",
                    },
                },
                render: ({children: Children}: { children: React.FC }) => {
                    return <Row>{<Children/>}</Row>;
                },
            },
            Column: {
                fields: {
                    children: {
                        type: "slot",
                    },
                    column_size: {
                        type: "custom",
                        label: "Column Size",
                        render: renderSelectInput("Column Size", columnSizeOptions),
                    }
                },
                render: ({children: Children, column_size}: { children: React.FC, column_size: string }) => {
                    return <Col width={column_size}>{<Children/>}</Col>;
                },
            },
            Link: {
                fields: {
                    content: {
                        type: "custom",
                        label: "Content",
                        render: (props: any) => {
                            return (
                                <TextInput
                                    title={props.name}
                                    description={props.label}
                                    clearable
                                    onChange={(e) => props.onChange(e.currentTarget.value)}
                                />
                            )
                        },
                    },
                    link: {
                        type: "custom",
                        label: "Link",
                        render: (props: any) => {
                            return (
                                <TextInput
                                    title={props.name}
                                    description={props.label}
                                    clearable
                                    onChange={(e) => {
                                        const value = e.currentTarget.value

                                        if (isValidUrl(value)) {
                                            props.onChange(value)
                                        }
                                    }}
                                />
                            )
                        },
                    },
                },
                defaultProps: {
                    content: "Your Link",
                    link: "https://example.com",
                },
                render: ({content, link}: { content: string, link: string }) => {
                    const href = isValidUrl(link) ? link : "https://example.com"

                    return (
                        <a href={href} target={"_blank"} rel={"noreferrer"}>
                            {content || "Your Link"}
                        </a>
                    )
                },
            },
            Card: {
                fields: {
                    children: {
                        type: "slot",
                    },
                    color: {
                        type: "custom",
                        label: "Color",
                        render: renderSelectInput("Color", cardColors),
                    },
                },
                defaultProps: {
                    color: "primary",
                },
                render: ({children: Children, color}: { children: React.FC, color: "primary" | "secondary" | "tertiary" | "info" | "success" | "warning" | "error" }) => {
                    return <Card color={color}>{<Children/>}</Card>
                },
            },
            Divider: {
                fields: {
                    orientation: {
                        type: "custom",
                        label: "Orientation",
                        render: renderSelectInput("Orientation", dividerOrientations),
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
            },
            Table: {
                fields: {
                    runtime: {
                        type: "custom",
                        label: "Runtime",
                        render: renderSelectInput("Runtime", runtimeOptions),
                    },
                    module: {
                        type: "custom",
                        label: "Module",
                        render: renderSelectInput("Module", moduleOptions),
                    },
                    columns: {
                        type: "custom",
                        label: "Columns",
                        render: (props: any) => {
                            return (
                                <MultipleSelectInput
                                    title={"Columns"}
                                    value={props.value}
                                    options={columnOptions}
                                    onChange={props.onChange}
                                />
                            )
                        },
                    },
                    filter: {
                        type: "custom",
                        label: "Filter",
                        render: (props: any) => {
                            return (
                                <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                                    <Text size={"sm"} hierarchy={"primary"}>Filter</Text>
                                    <DataTableFilterInput
                                        onChange={(filter) => props.onChange(filter)}
                                        filterTokens={columnOptions.map((column) => {
                                            return {
                                                token: column.label,
                                                key: column.value,
                                                operators: ["isOneOf", "isNotOneOf"],
                                            }
                                        })}
                                    />
                                </Flex>
                            )
                        },
                    },
                    showFilter: {
                        type: "custom",
                        label: "Show Filter",
                        render: (props: any) => {
                            return (
                                <SwitchInput
                                    title={"Show Filter"}
                                    initialValue={Boolean(props.value)}
                                    onChange={(e) => props.onChange(e.currentTarget.checked)}
                                />
                            )
                        },
                    },
                    minItems: {
                        type: "custom",
                        label: "Minimum Items",
                        render: renderNumberInput("Minimum Items"),
                    },
                    maxItems: {
                        type: "custom",
                        label: "Maximum Items",
                        render: renderNumberInput("Maximum Items"),
                    },
                    itemsPerPage: {
                        type: "custom",
                        label: "Items per Page",
                        render: renderNumberInput("Items per Page"),
                    },
                },
                defaultProps: {
                    runtime: "default-runtime",
                    module: "users",
                    columns: ["name", "createdAt"],
                    filter: {},
                    showFilter: true,
                    minItems: 0,
                    maxItems: 100,
                    itemsPerPage: 10,
                },
                render: ({module, columns, itemsPerPage}: { module: string, columns: string[], itemsPerPage: number }) => {
                    return (
                        <Card color={"secondary"}>
                            <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                                <Text hierarchy={"primary"}>Table: {module}</Text>
                                <Text hierarchy={"secondary"}>Columns: {columns?.join(", ")}</Text>
                                <Text hierarchy={"tertiary"}>Items per page: {itemsPerPage}</Text>
                            </Flex>
                        </Card>
                    )
                },
            },
            Graph: {
                fields: {
                    runtime: {
                        type: "custom",
                        label: "Runtime",
                        render: renderSelectInput("Runtime", runtimeOptions),
                    },
                    module: {
                        type: "custom",
                        label: "Module",
                        render: renderSelectInput("Module", moduleOptions),
                    },
                    xAxis: {
                        type: "custom",
                        label: "X Axis",
                        render: renderSelectInput("X Axis", axisOptions),
                    },
                    yAxis: {
                        type: "custom",
                        label: "Y Axis",
                        render: renderSelectInput("Y Axis", axisOptions),
                    },
                    xAxisType: {
                        type: "custom",
                        label: "X Axis Type",
                        render: renderSelectInput("X Axis Type", axisTypeOptions),
                    },
                    yAxisType: {
                        type: "custom",
                        label: "Y Axis Type",
                        render: renderSelectInput("Y Axis Type", axisTypeOptions),
                    },
                },
                defaultProps: {
                    runtime: "default-runtime",
                    module: "users",
                    xAxis: "createdAt",
                    yAxis: "count",
                    xAxisType: "date",
                    yAxisType: "number",
                },
                render: ({module, xAxis, yAxis}: { module: string, xAxis: string, yAxis: string }) => {
                    return (
                        <Card color={"secondary"}>
                            <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                                <Text hierarchy={"primary"}>Graph: {module}</Text>
                                <Text hierarchy={"secondary"}>X Axis: {xAxis}</Text>
                                <Text hierarchy={"secondary"}>Y Axis: {yAxis}</Text>
                            </Flex>
                        </Card>
                    )
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
        },
    }

    const [data, setData] = React.useState<any>({content: [], root: {props: {}}})

    return <Puck config={config as any} iframe={{
        enabled: false,
    }} data={data} height={"100%"} onChange={setData}>
        {children}
    </Puck>
}
