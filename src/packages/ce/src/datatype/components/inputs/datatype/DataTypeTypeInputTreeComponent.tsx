import React from "react"
import {Badge, Flex, hashToColor, Text} from "@code0-tech/pictor"
import {
    DataTypeOption,
    describeType,
    hasStructure,
    TypeNode
} from "@edition/datatype/components/inputs/datatype/DataTypeType.node.util"

export interface DataTypeTypeInputTreeComponentProps {
    node: TypeNode
    dataTypeOptions: DataTypeOption[]
    label?: string
    optional?: boolean
    isRoot?: boolean
    path?: string[]
    parentColor?: string
}

export const DataTypeTypeInputTreeComponent: React.FC<DataTypeTypeInputTreeComponentProps> = (props) => {

    const {node, dataTypeOptions, label, optional, isRoot = true, path = [], parentColor} = props

    const option = node.kind === "datatype"
        ? dataTypeOptions.find(candidate => candidate.identifier === node.identifier)
        : undefined

    const empty = node.kind === "datatype" && !(node.identifier ?? "").trim()
    const expanded = !empty && hasStructure(node)

    const rows: { label: string, node: TypeNode, optional?: boolean }[] =
        !expanded
            ? []
            : node.kind === "object"
                ? (node.fields ?? []).map(field => ({
                    label: field.key.trim() || "Unnamed",
                    node: field.node,
                    optional: field.optional
                }))
                : node.kind === "union" || node.kind === "intersection"
                    ? (node.members ?? []).map((member, index) => ({
                        label: `${node.kind === "union" ? "Choice" : "Part"} ${index + 1}`,
                        node: member
                    }))
                    : (node.args ?? []).map((arg, index) => ({
                        label: node.identifier === "LIST"
                            ? "Each item"
                            : option?.genericKeys?.[index]?.split(/\s+extends\s+/)[0].trim() || `Detail ${index + 1}`,
                        node: arg
                    }))

    const phrase = empty
        ? "has no type yet"
        : node.kind === "object"
            ? (node.fields ?? []).length === 0 ? "is an empty form" : "is a form"
            : expanded
                ? node.kind === "union"
                    ? "is one of"
                    : node.kind === "intersection"
                        ? "is all of"
                        : `is a ${option?.label ?? node.identifier} of`
                : "is"

    const typeName = expanded || empty ? undefined : describeType(node, dataTypeOptions)

    const color = rows.length > 0 ? hashToColor(path.join(".") || "root") : (parentColor ?? hashToColor("root"))

    if (isRoot && empty && rows.length === 0) return null

    const content = (
        <>
            <Flex align="center" style={{gap: ".35rem", textWrap: "nowrap"}} className="rule rule--static">
                {label && (
                    <Badge border color={color} style={{verticalAlign: "middle"}}>
                        <Text size="xs" style={{color: "inherit"}}>{label}</Text>
                    </Badge>
                )}
                <Text size="sm" hierarchy="tertiary">
                    {isRoot ? phrase.charAt(0).toUpperCase() + phrase.slice(1) : phrase}
                </Text>
                {typeName && (
                    <Badge border color={"primary"} style={{verticalAlign: "middle"}}>
                        <Text size="xs" style={{color: "inherit"}}>
                            {typeName.charAt(0).toUpperCase() + typeName.slice(1)}
                        </Text>
                    </Badge>
                )}
                {optional && <Text size="sm" hierarchy="tertiary">optional</Text>}
            </Flex>
            {rows.length > 0 && (
                <ul className="json-tree">
                    {rows.map((row, index) => (
                        <li key={`${row.node.id}-${index}`} className="json-tree__item">
                            <DataTypeTypeInputTreeComponent node={row.node}
                                                            dataTypeOptions={dataTypeOptions}
                                                            label={row.label}
                                                            optional={row.optional}
                                                            isRoot={false}
                                                            path={[...path, String(row.node.id)]}
                                                            parentColor={color}/>
                        </li>
                    ))}
                </ul>
            )}
        </>
    )

    return isRoot ? <ul className="json-tree">
        <div>{content}</div>
    </ul> : <div>{content}</div>
}
