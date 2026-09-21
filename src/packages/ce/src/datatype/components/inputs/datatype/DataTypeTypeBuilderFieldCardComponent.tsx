import React from "react"
import {Button, Card, Flex, getSize, Text, TextInput} from "@code0-tech/pictor"
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup"
import {IconChevronDown, IconChevronRight, IconChevronUp, IconTrash} from "@tabler/icons-react"
import {DataTypeOption, isContainerKind, TypeNode} from "@edition/datatype/components/inputs/datatype/DataTypeType.node.util"
import {
    DataTypeTypeBuilderPickerComponent
} from "@edition/datatype/components/inputs/datatype/DataTypeTypeBuilderPickerComponent"

export interface DataTypeTypeBuilderFieldCardComponentProps {
    node: TypeNode
    dataTypeOptions: DataTypeOption[]
    name: string
    optional?: boolean
    nameError?: boolean
    hasNestedErrors?: boolean
    onNameChange: (name: string) => void
    onOptionalChange: (optional: boolean) => void
    onChange: (node: TypeNode) => void
    onDrillIn: () => void
    onRemove: () => void
}

export const DataTypeTypeBuilderFieldCardComponent: React.FC<DataTypeTypeBuilderFieldCardComponentProps> = (props) => {

    const {node, dataTypeOptions, name, optional, nameError, hasNestedErrors, onNameChange, onOptionalChange, onChange, onDrillIn, onRemove} = props

    const [open, setOpen] = React.useState<boolean>(!name.trim())

    const drillIn = isContainerKind(node.kind) || node.kind === "literal" || (node.kind === "datatype" && (node.args?.length ?? 0) > 0)

    const chosen = node.kind !== "datatype" || !!(node.identifier ?? "").trim()

    const verb = optional ? "may be" : "must be"

    const describe = (current: TypeNode): string => {
        if (current.kind === "object") return "a group of details"
        if (current.kind === "union" || current.kind === "intersection") {
            const parts = (current.members ?? []).map(member => describe(member))
            if (parts.length === 0) return current.kind === "union" ? "one of a few choices" : "a combination"
            return parts.join(current.kind === "union" ? " or " : " and ")
        }
        if (current.kind === "literal") return (current.identifier ?? "").trim() ? `exactly “${current.identifier}”` : "an exact value"
        if (!(current.identifier ?? "").trim()) return "not chosen yet"

        const option = dataTypeOptions.find(candidate => candidate.identifier === current.identifier)
        if (!option?.displayMessage) return option?.label ?? current.identifier!

        let unresolved = false
        const filled = option.displayMessage.replace(/\$\{([^}]+)}/g, (_, variable: string) => {
            const index = option.genericKeys.findIndex(key => key.split(/\s+extends\s+/)[0].trim() === variable.trim())
            const argument = index >= 0 ? current.args?.[index] : undefined
            if (index < 0) unresolved = true
            return argument ? describe(argument) : "…"
        })
        return unresolved ? option.label : filled
    }

    return (
        <Card color={"primary"} clickable={!open} paddingSize={"sm"} style={{cursor: "pointer"}}
              onClick={() => setOpen(previous => !previous)}>
            <Flex align={"center"} justify={"space-between"} style={{gap: getSize("xs")}} w={"100%"}>
                <Flex align={"center"} style={{minWidth: 0}}>
                    <Text hierarchy={"tertiary"}>
                        <Text hierarchy={"secondary"} style={{display: "inline", verticalAlign: "baseline"}}>{name.trim() || "This field"}</Text>
                        {chosen ? ` ${verb} ` : " has no type yet"}
                        {chosen && <Text hierarchy={"secondary"} style={{display: "inline", verticalAlign: "baseline"}}>{describe(node)}</Text>}
                    </Text>
                </Flex>
                <Flex align={"center"} style={{gap: getSize("xs")}}>
                    {open && (
                        <ButtonGroup color={"primary"} style={{boxShadow: "none"}}>
                            <Button variant={"none"} color={"secondary"} paddingSize={"xxs"}
                                    onClick={event => {
                                        event.stopPropagation()
                                        onOptionalChange(!optional)
                                    }}>
                                <Text hierarchy={"tertiary"}>{optional ? "optional" : "required"}</Text>
                            </Button>
                            <Button variant={"none"} color={"secondary"} paddingSize={"xxs"}
                                    onClick={event => {
                                        event.stopPropagation()
                                        onRemove()
                                    }}>
                                <IconTrash size={13}/>
                            </Button>
                        </ButtonGroup>
                    )}
                    <div style={{position: "relative", display: "flex", marginRight: getSize("xs")}}>
                        {open ? <IconChevronUp size={13}/> : <IconChevronDown size={13}/>}
                        {!open && hasNestedErrors && (
                            <span style={{
                                position: "absolute",
                                top: -2,
                                right: -2,
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "#D90429"
                            }}/>
                        )}
                    </div>
                </Flex>
            </Flex>

            {open && (
                <Flex align={"center"} style={{gap: getSize("xs"), marginTop: getSize("xs"), cursor: "default"}} w={"100%"}
                      onClick={event => event.stopPropagation()}>
                    <TextInput value={name}
                               placeholder={"Field name"}
                               wrapperComponent={{style: {flex: "0 0 30%", minWidth: 0}}}
                               formValidation={{valid: !nameError}}
                               onChange={event => onNameChange(event.target.value)}/>
                    <div style={{flex: "1 1 auto", minWidth: 0}}>
                        <DataTypeTypeBuilderPickerComponent node={node}
                                                            dataTypeOptions={dataTypeOptions}
                                                            onNodeChange={onChange}/>
                    </div>
                    {drillIn && (
                        <Button color={"secondary"} style={{position: "relative", padding: getSize("xs")}}
                                onClick={onDrillIn}>
                            <IconChevronRight size={13}/>
                            {hasNestedErrors && (
                                <span style={{
                                    position: "absolute",
                                    top: 2,
                                    right: 2,
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: "#D90429"
                                }}/>
                            )}
                        </Button>
                    )}
                </Flex>
            )}
        </Card>
    )
}
