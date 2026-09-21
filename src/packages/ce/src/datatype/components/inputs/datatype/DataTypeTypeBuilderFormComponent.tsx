import React from "react"
import {Button, Spacing, Text, TextInput} from "@code0-tech/pictor"
import {IconPlus} from "@tabler/icons-react"
import {
    collectTypeErrors,
    createTypeNode,
    DataTypeOption,
    getNodeAtPath,
    replaceNode,
    TypeNode
} from "@edition/datatype/components/inputs/datatype/DataTypeType.node.util"
import {
    DataTypeTypeBuilderFieldComponent
} from "@edition/datatype/components/inputs/datatype/DataTypeTypeBuilderFieldComponent"
import {
    DataTypeTypeBuilderFieldCardComponent
} from "@edition/datatype/components/inputs/datatype/DataTypeTypeBuilderFieldCardComponent"
import {
    DataTypeTypeBuilderPickerComponent
} from "@edition/datatype/components/inputs/datatype/DataTypeTypeBuilderPickerComponent"
import {
    DataTypeTypeBuilderStarterComponent
} from "@edition/datatype/components/inputs/datatype/DataTypeTypeBuilderStarterComponent"

export interface DataTypeTypeBuilderFormComponentProps {
    root: TypeNode
    activePath: number[]
    dataTypeOptions: DataTypeOption[]
    showErrors?: boolean
    onRootChange: (root: TypeNode) => void
    onActivePathChange: (path: number[]) => void
}

export const DataTypeTypeBuilderFormComponent: React.FC<DataTypeTypeBuilderFormComponentProps> = (props) => {

    const {root, activePath, dataTypeOptions, showErrors, onRootChange, onActivePathChange} = props

    const [started, setStarted] = React.useState<boolean>(false)

    const empty = root.kind === "datatype" && !(root.identifier ?? "").trim() && !(root.args?.length ?? 0)

    if (activePath.length === 0 && empty && !started) {
        return (
            <DataTypeTypeBuilderStarterComponent onStart={next => {
                setStarted(true)
                onRootChange(next)
            }}/>
        )
    }

    const activeNode = getNodeAtPath(root, activePath)
    if (!activeNode) return null

    const addBarStyle: React.CSSProperties = {
        position: "sticky",
        bottom: 0,
        zIndex: 1,
        paddingTop: "0.563rem",
        paddingBottom: "0.563rem",
        background: "#070514"
    }

    const option = dataTypeOptions.find(candidate => candidate.identifier === activeNode.identifier)

    const update = (updater: (node: TypeNode) => TypeNode) => onRootChange(replaceNode(root, activeNode.id, updater))

    const drillTo = (childId: number) => onActivePathChange([...activePath, childId])

    const genericLabel = (index: number) =>
        option?.genericKeys?.[index]?.split(/\s+extends\s+/)[0].trim() || `Detail ${index + 1}`

    return (
        <div>
            {activePath.length === 0 && (
                <>
                    <Text hierarchy={"tertiary"}>This is</Text>
                    <Spacing spacing={"xs"}/>
                    <DataTypeTypeBuilderPickerComponent node={activeNode}
                                                        dataTypeOptions={dataTypeOptions}
                                                        onNodeChange={onRootChange}/>
                    <Spacing spacing={"xl"}/>
                </>
            )}

            {activeNode.kind === "object" && (
                <>
                    {(activeNode.fields ?? []).map(field => {
                        const key = field.key.trim()
                        const duplicate = (activeNode.fields ?? []).filter(candidate => candidate.key.trim() === key).length > 1
                        return (
                            <div key={field.node.id} style={{marginBottom: "0.5rem"}}>
                                <DataTypeTypeBuilderFieldCardComponent node={field.node}
                                                                       dataTypeOptions={dataTypeOptions}
                                                                       name={field.key}
                                                                       optional={field.optional}
                                                                       nameError={showErrors && (!key || duplicate)}
                                                                       hasNestedErrors={showErrors && collectTypeErrors(field.node).length > 0}
                                                                       onNameChange={value => update(node => ({
                                                                           ...node,
                                                                           fields: (node.fields ?? []).map(current =>
                                                                               current.node.id === field.node.id ? {
                                                                                   ...current,
                                                                                   key: value
                                                                               } : current)
                                                                       }))}
                                                                       onOptionalChange={value => update(node => ({
                                                                           ...node,
                                                                           fields: (node.fields ?? []).map(current =>
                                                                               current.node.id === field.node.id ? {
                                                                                   ...current,
                                                                                   optional: value
                                                                               } : current)
                                                                       }))}
                                                                       onChange={next => update(node => ({
                                                                           ...node,
                                                                           fields: (node.fields ?? []).map(current =>
                                                                               current.node.id === field.node.id ? {
                                                                                   ...current,
                                                                                   node: next
                                                                               } : current)
                                                                       }))}
                                                                       onDrillIn={() => drillTo(field.node.id)}
                                                                       onRemove={() => update(node => ({
                                                                           ...node,
                                                                           fields: (node.fields ?? []).filter(current => current.node.id !== field.node.id)
                                                                       }))}/>
                            </div>
                        )
                    })}
                    <div style={addBarStyle}>
                        <Button color={"secondary"} paddingSize={"xxs"} w={"100%"}
                                onClick={() => update(node => ({
                                    ...node,
                                    fields: [...(node.fields ?? []), {
                                        key: "",
                                        node: createTypeNode("datatype", "TEXT")
                                    }]
                                }))}>
                            <IconPlus size={13}/>
                            <Text size={"sm"}>Add field</Text>
                        </Button>
                    </div>
                </>
            )}

            {(activeNode.kind === "union" || activeNode.kind === "intersection") && (
                <>
                    {(activeNode.members ?? []).map((member, index) => (
                        <div key={member.id} style={{marginBottom: "0.7rem"}}>
                            <DataTypeTypeBuilderFieldComponent node={member}
                                                               dataTypeOptions={dataTypeOptions}
                                                               label={`${activeNode.kind === "union" ? "Option" : "Part"} ${index + 1}`}
                                                               hasNestedErrors={showErrors && collectTypeErrors(member).length > 0}
                                                               onChange={next => update(node => ({
                                                                   ...node,
                                                                   members: (node.members ?? []).map(current =>
                                                                       current.id === member.id ? next : current)
                                                               }))}
                                                               onDrillIn={() => drillTo(member.id)}
                                                               onRemove={(activeNode.members?.length ?? 0) > 1 ? () => update(node => ({
                                                                   ...node,
                                                                   members: (node.members ?? []).filter(current => current.id !== member.id)
                                                               })) : undefined}/>
                        </div>
                    ))}
                    <div style={addBarStyle}>
                        <Button color={"secondary"} paddingSize={"xxs"} w={"100%"}
                                onClick={() => update(node => ({
                                    ...node,
                                    members: [...(node.members ?? []), (activeNode.members ?? []).every(member => member.kind === "literal") ? createTypeNode("literal") : createTypeNode("datatype")]
                                }))}>
                            <IconPlus size={13}/>
                            <Text
                                size={"sm"}>{activeNode.kind === "union" ? "Add another option" : "Add another part"}</Text>
                        </Button>
                    </div>
                </>
            )}

            {activeNode.kind === "literal" && (
                <>
                    <Text hierarchy={"tertiary"}>This has to be exactly</Text>
                    <Spacing spacing={"xs"}/>
                    <TextInput w={"100%"}
                               value={activeNode.identifier ?? ""}
                               placeholder={"E.g. active"}
                               formValidation={{valid: !(showErrors && !(activeNode.identifier ?? "").trim())}}
                               onChange={event => update(node => ({...node, identifier: event.target.value}))}/>
                </>
            )}

            {activeNode.kind === "datatype" && activeNode.identifier === "LIST" && (
                <DataTypeTypeBuilderFieldComponent node={activeNode.args?.[0] ?? createTypeNode("datatype", "TEXT")}
                                                   dataTypeOptions={dataTypeOptions}
                                                   label={"Each item"}
                                                   hasNestedErrors={showErrors && collectTypeErrors(activeNode.args?.[0] ?? activeNode).length > 0}
                                                   onChange={next => update(node => ({...node, args: [next]}))}
                                                   onDrillIn={() => drillTo((activeNode.args?.[0] ?? activeNode).id)}/>
            )}

            {activeNode.kind === "datatype" && activeNode.identifier !== "LIST" && (activeNode.args?.length ?? 0) > 0 && (
                (activeNode.args ?? []).map((arg, index) => (
                    <div key={arg.id} style={{marginBottom: "0.7rem"}}>
                        <DataTypeTypeBuilderFieldComponent node={arg}
                                                           dataTypeOptions={dataTypeOptions}
                                                           label={genericLabel(index)}
                                                           hasNestedErrors={showErrors && collectTypeErrors(arg).length > 0}
                                                           onChange={next => update(node => ({
                                                               ...node,
                                                               args: (node.args ?? []).map(current => current.id === arg.id ? next : current)
                                                           }))}
                                                           onDrillIn={() => drillTo(arg.id)}/>
                    </div>
                ))
            )}
        </div>
    )
}
