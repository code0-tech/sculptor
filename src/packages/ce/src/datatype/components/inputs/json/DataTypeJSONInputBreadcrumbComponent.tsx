import React from "react"
import {LiteralValue} from "@code0-tech/sagittarius-graphql-types"
import {Schema} from "@code0-tech/triangulum"
import {Breadcrumb, Text} from "@code0-tech/pictor"
import {getSchemaAtPath, getValueAtPath} from "@edition/datatype/components/inputs/json/DataTypeJSONInputFormComponent"

export interface DataTypeJSONInputBreadcrumbComponentProps {
    schema: Schema | undefined
    value: LiteralValue | null
    activePath: string[]
    onActivePathChange: (path: string[]) => void
}

export const DataTypeJSONInputBreadcrumbComponent: React.FC<DataTypeJSONInputBreadcrumbComponentProps> = (props) => {

    const {schema, value, activePath, onActivePathChange} = props

    const crumbs = React.useMemo(
        () => {
            const rootCrumb = {label: "Root", path: [] as string[]}
            const nestedCrumbs = activePath.map((key, index) => {
                const parentPath = activePath.slice(0, index)
                const parentSchema = getSchemaAtPath(schema, parentPath)
                const parentValue = getValueAtPath(value, parentPath)
                const parentIsList = parentSchema?.input === "list" || Array.isArray(parentValue)
                return {
                    label: parentIsList ? `Item ${Number(key) + 1}` : key,
                    path: activePath.slice(0, index + 1)
                }
            })
            return [rootCrumb, ...nestedCrumbs]
        },
        [schema, value, activePath]
    )

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
