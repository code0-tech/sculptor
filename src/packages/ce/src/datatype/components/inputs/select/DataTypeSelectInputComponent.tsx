import {DataTypeInputComponentProps} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import React from "react";
import {useDebounce, useDebouncedCallback} from "use-debounce";
import {
    Button,
    Flex,
    InputDescription,
    InputLabel,
    SelectContent,
    SelectInput,
    SelectItem,
    SelectItemText,
    SelectPortal,
    SelectTrigger,
    SelectValue,
    SelectViewport
} from "@code0-tech/pictor";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {IconChevronDown, IconX} from "@tabler/icons-react";


export type DataTypeSelectInputComponentProps = DataTypeInputComponentProps

export const DataTypeSelectInputComponent: React.FC<DataTypeSelectInputComponentProps> = (props) => {

    const {formValidation, title, initialValue, description, suggestions, onChange} = props

    const defaultValue = React.useMemo(() => initialValue, [])
    const onChangeDebounced = useDebouncedCallback(() => {
        onChange?.({} as any)
    }, 200)

    return React.useMemo(() => <>
        <InputLabel>{title}</InputLabel>
        <InputDescription>{description}</InputDescription>
        {initialValue?.__typename === "NodeFunction" || initialValue?.__typename === "NodeFunctionIdWrapper" ? (
            <NodeBadgeComponent value={initialValue}/>
        ) : initialValue?.__typename === "ReferenceValue" ? (
            <ReferenceBadgeComponent value={initialValue}/>
        ) : (
            <SelectInput defaultValue={defaultValue} formValidation={formValidation} maw={"100%"} onValueChange={onChangeDebounced} placeholder={"sd"} right={
                <Button color={"primary"} paddingSize={"xxs"}>
                    <IconX size={13}/>
                </Button>
            } rightType={"action"}>
                <SelectTrigger asChild>
                    <Flex justify={"space-between"} align={"center"}>
                        <SelectValue placeholder={"Select an option"}/>
                        <IconChevronDown size={13}/>
                    </Flex>
                </SelectTrigger>
                <SelectPortal>
                    <SelectContent position={"item-aligned"}>
                        <SelectViewport>
                            {suggestions?.filter((suggest) => suggest?.value.__typename === "LiteralValue").map((suggest) => {
                                return <SelectItem value={suggest?.value?.value}>
                                    <SelectItemText>
                                        <Flex style={{gap: "0.35rem"}} align={"center"}>
                                            {suggest?.children}
                                        </Flex>
                                    </SelectItemText>
                                </SelectItem>
                            })}
                        </SelectViewport>
                    </SelectContent>
                </SelectPortal>
            </SelectInput>
        )}
    </>, [formValidation])
}