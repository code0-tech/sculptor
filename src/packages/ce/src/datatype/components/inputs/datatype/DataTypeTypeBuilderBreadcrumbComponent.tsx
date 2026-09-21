import React from "react"
import {Breadcrumb, Text} from "@code0-tech/pictor"
import {DataTypeOption, TypeNode} from "@edition/datatype/components/inputs/datatype/DataTypeType.node.util"

export interface DataTypeTypeBuilderBreadcrumbComponentProps {
    root: TypeNode
    activePath: number[]
    dataTypeOptions: DataTypeOption[]
    onActivePathChange: (path: number[]) => void
}

export const DataTypeTypeBuilderBreadcrumbComponent: React.FC<DataTypeTypeBuilderBreadcrumbComponentProps> = (props) => {

    const {root, activePath, dataTypeOptions, onActivePathChange} = props

    const crumbs = React.useMemo(() => {
        const result = [{label: "Root", path: [] as number[]}]
        let current: TypeNode = root
        for (let index = 0; index < activePath.length; index++) {
            const childId = activePath[index]
            let label = "Unnamed"
            if (current.kind === "object") {
                label = (current.fields ?? []).find(field => field.node.id === childId)?.key?.trim() || "Unnamed"
            } else if (current.kind === "union" || current.kind === "intersection") {
                const position = (current.members ?? []).findIndex(member => member.id === childId)
                label = `${current.kind === "union" ? "Option" : "Part"} ${position + 1}`
            } else if (current.kind === "datatype") {
                const position = (current.args ?? []).findIndex(arg => arg.id === childId)
                if (current.identifier === "LIST") {
                    label = "Each item"
                } else {
                    const option = dataTypeOptions.find(candidate => candidate.identifier === current.identifier)
                    label = option?.genericKeys?.[position]?.split(/\s+extends\s+/)[0].trim() || `Detail ${position + 1}`
                }
            }
            const next = current.kind === "object"
                ? (current.fields ?? []).find(field => field.node.id === childId)?.node
                : current.kind === "datatype"
                    ? (current.args ?? []).find(arg => arg.id === childId)
                    : (current.members ?? []).find(member => member.id === childId)
            if (!next) break
            result.push({label, path: activePath.slice(0, index + 1)})
            current = next
        }
        return result
    }, [root, activePath, dataTypeOptions])

    return (
        <Breadcrumb>
            {crumbs.map((crumb, index) => {
                const isCurrent = index === crumbs.length - 1
                return (
                    <Text key={crumb.path.join(".") || "root"}
                          size={"sm"}
                          hierarchy={isCurrent ? "primary" : "tertiary"}
                          style={isCurrent ? undefined : {cursor: "pointer"}}
                          onClick={isCurrent ? undefined : () => onActivePathChange(crumb.path)}>
                        {crumb.label}
                    </Text>
                )
            })}
        </Breadcrumb>
    )
}
