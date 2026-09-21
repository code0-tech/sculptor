import React from "react"
import {
    Button,
    Flex,
    Menu,
    MenuContent,
    MenuItem,
    MenuPortal,
    MenuSeparator,
    MenuSub,
    MenuSubContent,
    MenuSubTrigger,
    MenuTrigger,
    Text
} from "@code0-tech/pictor"
import {IconChevronDown, IconChevronRight} from "@tabler/icons-react"
import {icon, IconString} from "@core/util/icons"
import {createTypeNode, DataTypeOption, TypeNode} from "@edition/datatype/components/inputs/datatype/DataTypeType.node.util"

export interface DataTypeTypeBuilderPickerComponentProps {
    node: TypeNode
    dataTypeOptions: DataTypeOption[]
    onNodeChange: (node: TypeNode) => void
}

export const DataTypeTypeBuilderPickerComponent: React.FC<DataTypeTypeBuilderPickerComponentProps> = (props) => {

    const {node, dataTypeOptions, onNodeChange} = props

    const groups = React.useMemo(() => {
        const result: { id: string, name: string, icon?: string, options: DataTypeOption[] }[] = []
        const byId = new Map<string, typeof result[number]>()
        dataTypeOptions
            .filter(option => !["LIST", "OBJECT"].includes(option.identifier))
            .forEach(option => {
                const id = option.moduleId ?? "other"
                let group = byId.get(id)
                if (!group) {
                    group = {id, name: option.moduleName ?? "Other types", icon: option.moduleIcon, options: []}
                    byId.set(id, group)
                    result.push(group)
                }
                group.options.push(option)
            })
        return result
    }, [dataTypeOptions])

    const structure: { value: string, label: string, hint: string }[] = [
        {value: "group", label: "A group of details", hint: "holds several pieces of information inside"},
        {value: "list", label: "A list of…", hint: "many of the same thing"},
        {value: "choices", label: "One of a few fixed choices", hint: "e.g. active, paused or archived"},
        {value: "either", label: "Either one or the other", hint: "any one of several types fits"},
        {value: "combo", label: "All of them at once", hint: "has to be every one of several types"},
        {value: "exact", label: "An exact value", hint: "must equal one specific value"}
    ]

    const scrollStyle: React.CSSProperties = {
        maxHeight: "var(--radix-popper-available-height)",
        overflowY: "auto"
    }

    const itemStyle: React.CSSProperties = {
        width: "auto",
        alignSelf: "stretch"
    }

    const currentValue = node.kind === "object" ? "group"
        : node.kind === "union" ? ((node.members ?? []).every(member => member.kind === "literal") ? "choices" : "either")
            : node.kind === "intersection" ? "combo"
                : node.kind === "literal" ? "exact"
                    : node.identifier === "LIST" ? "list"
                        : node.identifier
                            ? `dt:${node.identifier}`
                            : undefined

    const selectedLabel = structure.find(option => option.value === currentValue)?.label
        ?? (node.kind === "union" ? "One of a few fixed choices"
            : node.kind === "intersection" ? "A combination of several"
                : node.kind === "literal" ? "Exactly one value"
                    : node.kind === "datatype"
                        ? dataTypeOptions.find(option => option.identifier === node.identifier)?.label ?? node.identifier
                        : undefined)

    const handleSelect = (value: string) => {
        switch (value) {
            case "group":
                return onNodeChange(createTypeNode("object"))
            case "list": {
                const list = createTypeNode("datatype", "LIST")
                list.args = [createTypeNode("datatype", "TEXT")]
                return onNodeChange(list)
            }
            case "choices": {
                const choices = createTypeNode("union")
                choices.members = [createTypeNode("literal"), createTypeNode("literal")]
                return onNodeChange(choices)
            }
            case "either":
                return onNodeChange(createTypeNode("union"))
            case "combo":
                return onNodeChange(createTypeNode("intersection"))
            case "exact":
                return onNodeChange(createTypeNode("literal"))
            default: {
                const identifier = value.slice(3)
                const option = dataTypeOptions.find(candidate => candidate.identifier === identifier)
                const next = createTypeNode("datatype", identifier)
                if (option && option.generics > 0)
                    next.args = Array.from({length: option.generics}, () => createTypeNode("datatype"))
                return onNodeChange(next)
            }
        }
    }

    return (
        <Menu>
            <MenuTrigger asChild>
                <Button w={"100%"} color={"secondary"} paddingSize={"xs"}>
                    <Flex justify={"space-between"} align={"center"} w={"100%"}>
                        <Text hierarchy={currentValue ? "secondary" : "tertiary"}>
                            {currentValue ? selectedLabel : "choose…"}
                        </Text>
                        <IconChevronDown size={13}/>
                    </Flex>
                </Button>
            </MenuTrigger>
            <MenuPortal>
                <MenuContent align={"start"} sideOffset={4} collisionPadding={16} style={scrollStyle}>
                    {structure.map(option => (
                        <MenuItem key={option.value} style={itemStyle} onSelect={() => handleSelect(option.value)}>
                            <Flex style={{flexDirection: "column", gap: "0.1rem"}}>
                                <Text>{option.label}</Text>
                                <Text hierarchy={"tertiary"}>{option.hint}</Text>
                            </Flex>
                        </MenuItem>
                    ))}
                    <MenuSeparator/>
                    {groups.map(group => {
                        const DisplayIcon = icon(group.icon as IconString)
                        return (
                            <MenuSub key={group.id}>
                                <MenuSubTrigger style={itemStyle}>
                                    <Flex align={"center"} justify={"space-between"} style={{gap: "0.7rem"}} w={"100%"}>
                                        <Flex align={"center"} style={{gap: "0.5rem"}}>
                                            <DisplayIcon size={15}/>
                                            <Text>{group.name}</Text>
                                        </Flex>
                                        <IconChevronRight size={12}/>
                                    </Flex>
                                </MenuSubTrigger>
                                <MenuSubContent align={"start"} alignOffset={-4} sideOffset={4} collisionPadding={16}
                                                style={scrollStyle}>
                                    {group.options.map(option => (
                                        <MenuItem key={option.identifier} style={itemStyle}
                                                  onSelect={() => handleSelect(`dt:${option.identifier}`)}>
                                            <Text>{option.label}</Text>
                                        </MenuItem>
                                    ))}
                                </MenuSubContent>
                            </MenuSub>
                        )
                    })}
                </MenuContent>
            </MenuPortal>
        </Menu>
    )
}
