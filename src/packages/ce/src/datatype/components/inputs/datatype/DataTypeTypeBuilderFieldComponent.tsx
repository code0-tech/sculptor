import React from "react"
import {Button, Flex, getSize, Text} from "@code0-tech/pictor"
import {IconChevronRight, IconTrash} from "@tabler/icons-react"
import {DataTypeOption, isContainerKind, TypeNode} from "@edition/datatype/components/inputs/datatype/DataTypeType.node.util"
import {
    DataTypeTypeBuilderPickerComponent
} from "@edition/datatype/components/inputs/datatype/DataTypeTypeBuilderPickerComponent"

export interface DataTypeTypeBuilderFieldComponentProps {
    node: TypeNode
    dataTypeOptions: DataTypeOption[]
    label?: string
    hasNestedErrors?: boolean
    onChange: (node: TypeNode) => void
    onDrillIn: () => void
    onRemove?: () => void
}

export const DataTypeTypeBuilderFieldComponent: React.FC<DataTypeTypeBuilderFieldComponentProps> = (props) => {

    const {node, dataTypeOptions, label, hasNestedErrors, onChange, onDrillIn, onRemove} = props

    const drillIn = isContainerKind(node.kind) || node.kind === "literal" || (node.kind === "datatype" && (node.args?.length ?? 0) > 0)

    return (
        <Flex align={"center"} style={{gap: "0.5rem"}} w={"100%"}>
            {label && <Text size={"sm"} hierarchy={"tertiary"} style={{flex: "0 0 30%"}}>{label}</Text>}
            <div style={{flex: "1 1 auto", minWidth: 0}}>
                <DataTypeTypeBuilderPickerComponent node={node}
                                                    dataTypeOptions={dataTypeOptions}
                                                    onNodeChange={onChange}/>
            </div>
            {drillIn && (
                <Button variant={"none"} color={"secondary"} style={{position: "relative", padding: getSize("xs")}}
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
            {onRemove && (
                <Button variant={"none"} color={"secondary"} style={{padding: getSize("xs")}} onClick={onRemove}>
                    <IconTrash size={13}/>
                </Button>
            )}
        </Flex>
    )
}
