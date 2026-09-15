import React from "react"
import {LiteralValue} from "@code0-tech/sagittarius-graphql-types"
import {DataInput, ListInput, Schema} from "@code0-tech/triangulum"
import {Breadcrumb, Text} from "@code0-tech/pictor"

export interface DataTypeJSONInputBreadcrumbComponentProps {
    schema: Schema | undefined
    value: LiteralValue | null
    activePath: string[]
    onActivePathChange: (path: string[]) => void
}

export const DataTypeJSONInputBreadcrumbComponent: React.FC<DataTypeJSONInputBreadcrumbComponentProps> = (props) => {

    const {schema, value, activePath, onActivePathChange} = props

    const unwrapSchema = (target: Schema | Schema[] | undefined): Schema | undefined =>
        Array.isArray(target) ? target[0] : target

    const isDataSchema = (target: Schema | undefined): boolean =>
        target?.input === "data" || target?.input === "type"

    const schemaAtPath = (root: Schema | undefined, path: string[]): Schema | undefined => {
        let current = root
        for (const key of path) {
            if (!current) return undefined
            if (isDataSchema(current)) {
                current = unwrapSchema((current as DataInput).properties?.[key])
            } else if (current.input?.startsWith("list")) {
                const listItems = (current as ListInput).items
                current = unwrapSchema(listItems?.[Number(key)] ?? listItems?.[(listItems?.length ?? 0) - 1])
            } else {
                return undefined
            }
        }
        return current
    }

    const valueAtPath = (path: string[]): unknown => {
        let current: unknown = value?.value
        for (const key of path) {
            if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
                current = (current as Record<string, unknown>)[key]
            } else {
                return undefined
            }
        }
        return current
    }

    const crumbs = React.useMemo(
        () => {
            const rootCrumb = {label: "Root", path: [] as string[]}
            const nestedCrumbs = activePath.map((key, index) => {
                const parentPath = activePath.slice(0, index)
                const parentSchema = schemaAtPath(schema, parentPath)
                const parentValue = valueAtPath(parentPath)
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
