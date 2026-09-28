import {DataTypeInputComponentProps} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import React from "react";
import {useDebouncedCallback} from "use-debounce";
import {
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
    SelectViewport,
    Text
} from "@code0-tech/pictor";
import {IconChevronDown} from "@tabler/icons-react";
import lodash from "lodash"
import {LiteralValue, NodeFunction, ReferenceValue, SubFlowValue} from "@code0-tech/sagittarius-graphql-types";
import {DataTypeInputControlsComponent} from "@edition/datatype/components/inputs/DataTypeInputControlsComponent";


export type DataTypeSelectInputComponentProps = DataTypeInputComponentProps


export const DataTypeSelectInputComponent: React.FC<DataTypeSelectInputComponentProps> = (props) => {

    const {formValidation, title, initialValue, description, suggestions, onChange} = props

    const defaultValue: number = React.useMemo(() => suggestions?.findIndex(suggest => {
        return initialValue && lodash.isMatch(initialValue, suggest)
    }), [suggestions])!

    const onChangeDebounced = useDebouncedCallback((value: LiteralValue | SubFlowValue | NodeFunction | ReferenceValue | null) => {
        onChange?.(value)
    }, 200)

    return React.useMemo(() => <>
        {title && <InputLabel>{title}</InputLabel>}
        {description && <InputDescription>{description}</InputDescription>}
        <SelectInput value={defaultValue >= 0 ? defaultValue?.toString() : undefined}
                     formValidation={{...formValidation, setValue: undefined}}
                     maw={"100%"}
                     key={defaultValue}
                     onValueChange={(value) => {
                         const suggestion = (!!value ? suggestions?.[Number(value)] : null) ?? null
                         formValidation?.setValue?.(suggestion)
                         onChangeDebounced(suggestion)
                     }}
                     right={
                         <DataTypeInputControlsComponent suggestions={suggestions} onSelect={value => {
                             formValidation?.setValue?.(value)
                             onChangeDebounced(value)
                         }}/>
                     }
                     rightType={"action"}>
            <SelectTrigger asChild>
                <Flex justify={"space-between"} tabIndex={0} align={"center"}>
                    <Text hierarchy={defaultValue < 0 ? "tertiary" : "secondary"}>
                        <SelectValue placeholder={title}/>
                    </Text>
                    <IconChevronDown size={13}/>
                </Flex>
            </SelectTrigger>
            <SelectPortal>
                <SelectContent position={"item-aligned"}>
                    <SelectViewport>
                        {suggestions?.map((suggest, index) => {

                            if (suggest.__typename !== "LiteralValue") return null

                            return <SelectItem key={index} value={index.toString()}>
                                <SelectItemText>
                                    <Flex style={{gap: "0.35rem"}} align={"center"}>
                                        {(suggest)?.value}
                                    </Flex>
                                </SelectItemText>
                            </SelectItem>
                        })}
                    </SelectViewport>
                </SelectContent>
            </SelectPortal>
        </SelectInput>
    </>, [formValidation, defaultValue])
}
