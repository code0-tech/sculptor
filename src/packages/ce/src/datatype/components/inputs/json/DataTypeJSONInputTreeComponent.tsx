import {EditableJSONEntry} from "./DataTypeJSONInputComponent"
import React from "react"
import {IconChevronDown, IconChevronUp} from "@tabler/icons-react"
import {InlineReferenceValue, LiteralValue} from "@code0-tech/sagittarius-graphql-types"
import {Badge, Flex, hashToColor, Text} from "@code0-tech/pictor";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";

export interface DataTypeJSONInputTreeComponentProps {
    object: LiteralValue
    parentKey?: string
    isRoot?: boolean
    onEntryClick?: (entry: EditableJSONEntry) => void
    collapsedState?: Record<string, boolean>
    setCollapsedState?: (path: string[], collapsed: boolean) => void
    path?: string[]
    activePath?: string[] | null
    onDoubleClick?: (path: string[], isCollapsed: boolean) => void
    parentColor?: string
    rootDepth?: number
    references?: InlineReferenceValue[]
    readonly?: boolean
}

const CLICK_DELAY = 250

export const DataTypeJSONInputTreeComponent: React.FC<DataTypeJSONInputTreeComponentProps> = (props) => {
    const {
        object,
        parentKey,
        isRoot = !parentKey,
        onEntryClick,
        collapsedState,
        setCollapsedState,
        path = [],
        activePath = null,
        onDoubleClick,
        parentColor,
        rootDepth = 1,
        references,
        readonly = false,
    } = props

    const clickTimeout = React.useRef<NodeJS.Timeout | null>(null)

    const value: unknown = isRoot ? object?.value : object
    const entries = typeof value === "object" && value !== null ? Object.entries(value as Record<string, unknown>) : null
    const rootCollapsed = collapsedState?.["root"] || false
    const rootCollapsable = !!entries && entries.length > 0
    const rootActive = Array.isArray(activePath) && activePath.length === 0 && parentKey === undefined

    React.useEffect(() => {
        const pathKey = (isRoot ? ["root"] : path).join(".")
        if (path.length > rootDepth && collapsedState?.[pathKey] === undefined) {
            setCollapsedState?.(path.length === 0 ? ["root"] : path, true)
        }
    }, [path, isRoot, collapsedState, setCollapsedState])

    const handleClick = (entry: EditableJSONEntry) => {
        if (clickTimeout.current) clearTimeout(clickTimeout.current)
        clickTimeout.current = setTimeout(() => {
            onEntryClick?.(entry)
            clickTimeout.current = null
        }, CLICK_DELAY)
    }

    const handleDoubleClick = (currentPath: string[], isCollapsed: boolean) => {
        if (clickTimeout.current) {
            clearTimeout(clickTimeout.current)
            clickTimeout.current = null
        }
        if (onDoubleClick) onDoubleClick(currentPath, isCollapsed)
        else setCollapsedState?.(currentPath, !isCollapsed)
    }

    if (!entries) return null

    const children = entries.map(([key, val]) => {
        const currentPath = [...path, key]
        const pathKey = currentPath.join(".")
        const isCollapsed = collapsedState?.[pathKey] || false
        const isActive = !!activePath && activePath.length > 0 && pathKey === activePath.join(".")
        const isCollapsable = typeof val === "object" && val !== null && Object.keys(val).length > 0
        const color = isCollapsable ? hashToColor(pathKey) : (parentColor ?? hashToColor("root"))
        const signature = typeof val === "string" ? val.match(/^\$\{(.+)}$/)?.[1] : undefined
        const reference = signature ? references?.find(entry => entry.signature === signature)?.value : undefined

        return (
            <li key={pathKey} className="json-tree__item">
                <div
                    onClick={readonly ? undefined : e => {
                        e.stopPropagation()
                        handleClick({key, value: val as LiteralValue, path: currentPath})
                    }}
                    onDoubleClick={readonly ? undefined : e => {
                        e.stopPropagation()
                        handleDoubleClick(currentPath, isCollapsed)
                    }}
                >
                    <Flex align="center" style={{gap: ".35rem", textWrap: "nowrap"}}
                          className={readonly ? "rule rule--static" : "rule"}
                          aria-selected={isActive || undefined}>
                        {isCollapsable && (isCollapsed ? <IconChevronUp size={13}/> : <IconChevronDown size={13}/>)}
                        <Badge border color={color} style={{verticalAlign: "middle"}}>
                            <Text size="xs" style={{color: "inherit"}}>{key}</Text>
                        </Badge>
                        {isCollapsable ? (
                            <Text hierarchy="tertiary">{Array.isArray(val) ? "is a list of" : "is a nested object"}</Text>
                        ) : (
                            <>
                                <Text hierarchy="tertiary">has value</Text>
                                {reference?.__typename === "ReferenceValue" ? <ReferenceBadgeComponent value={reference}/>
                                    : reference?.__typename === "SubFlowValue" ? <NodeBadgeComponent value={reference}/>
                                        : (
                                            <Badge border color={"primary"} style={{verticalAlign: "middle"}}>
                                                <Text size="xs" style={{color: "inherit"}}>{String(val)}</Text>
                                            </Badge>
                                        )}
                            </>
                        )}
                    </Flex>
                    {isCollapsable && !isCollapsed && (
                        <DataTypeJSONInputTreeComponent
                            object={val as LiteralValue}
                            parentKey={key}
                            isRoot={false}
                            onEntryClick={onEntryClick}
                            collapsedState={collapsedState}
                            setCollapsedState={setCollapsedState}
                            path={currentPath}
                            activePath={activePath}
                            parentColor={color}
                            rootDepth={rootDepth}
                            references={references}
                            readonly={readonly}
                        />
                    )}
                </div>
            </li>
        )
    })

    if (!isRoot) {
        if (children.length === 0) return null
        return <ul className="json-tree">{children}</ul>
    }

    return (
        <ul className="json-tree">
            <div
                onClick={readonly ? undefined : e => {
                    e.stopPropagation()
                    handleClick({key: "root", value: object, path: [...path]})
                }}
                onDoubleClick={readonly ? undefined : e => {
                    e.stopPropagation()
                    handleDoubleClick([...path], rootCollapsed)
                }}
                aria-selected={rootActive || undefined}
            >
                <Flex align="center" style={{gap: ".35rem", textWrap: "nowrap"}} aria-selected={rootActive || undefined}
                      className={readonly ? "rule rule--static" : "rule"}>
                    {rootCollapsable && (rootCollapsed ? <IconChevronUp size={13}/> : <IconChevronDown size={13}/>)}
                    <Text hierarchy="tertiary">{Array.isArray(value) ? "is a list of" : "is a nested object"}</Text>
                </Flex>
                {!rootCollapsed && children.length > 0 && <ul className="json-tree">{children}</ul>}
            </div>
        </ul>
    )
}
