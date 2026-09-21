import React from "react"
import {Badge, Flex, hashToColor, Text} from "@code0-tech/pictor"
import {DataTypeOption, TypeNode} from "@edition/datatype/components/inputs/datatype/DataTypeType.node.util"

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

    const rows: { label: string, node: TypeNode, optional?: boolean }[] =
        node.kind === "object"
            ? (node.fields ?? []).map(field => ({
                label: field.key.trim() || "Unnamed",
                node: field.node,
                optional: field.optional
            }))
            : node.kind === "union" || node.kind === "intersection"
                ? (node.members ?? []).map((member, index) => ({
                    label: `${node.kind === "union" ? "Option" : "Part"} ${index + 1}`,
                    node: member
                }))
                : node.kind === "datatype"
                    ? (node.args ?? []).map((arg, index) => ({
                        label: node.identifier === "LIST"
                            ? "Each item"
                            : option?.genericKeys?.[index]?.split(/\s+extends\s+/)[0].trim() || `Detail ${index + 1}`,
                        node: arg
                    }))
                    : []

    const be = optional ? "may be" : "is"

    const phrase = node.kind === "object"
        ? `${be} a group of details`
        : node.kind === "union"
            ? `${be} one of`
            : node.kind === "intersection"
                ? `${be} a combination of`
                : node.kind === "literal"
                    ? `${be} exactly`
                    : !(node.identifier ?? "").trim()
                        ? "has no type yet"
                        : node.identifier === "LIST" && rows.length > 0
                            ? `${be} a list of`
                            : be

    const typeName = node.kind === "literal"
        ? (node.identifier ?? "").trim()
        : node.kind === "datatype" && (node.identifier ?? "").trim() && !(node.identifier === "LIST" && rows.length > 0)
            ? option?.label ?? node.identifier!
            : undefined

    const color = rows.length > 0 ? hashToColor(path.join(".") || "root") : (parentColor ?? hashToColor("root"))

    if (isRoot && node.kind === "datatype" && !(node.identifier ?? "").trim() && rows.length === 0) return null

    const content = (
        <>
            <Flex align="center" style={{gap: ".35rem", textWrap: "nowrap"}} className="rule">
                {label && (
                    <Badge border color={color} style={{verticalAlign: "middle"}}>
                        <Text size="xs" style={{color: "inherit"}}>{label}</Text>
                    </Badge>
                )}
                <Text hierarchy="tertiary">{phrase}</Text>
                {typeName && (
                    <Badge border color={"primary"} style={{verticalAlign: "middle"}}>
                        <Text size="xs" style={{color: "inherit"}}>{typeName}</Text>
                    </Badge>
                )}
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
