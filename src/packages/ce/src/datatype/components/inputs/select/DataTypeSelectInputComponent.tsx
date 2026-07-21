import {DataTypeInputComponentProps} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import React from "react";
import {useDebouncedCallback} from "use-debounce";
import {
    Button,
    ButtonGroup,
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
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {IconChevronDown, IconX} from "@tabler/icons-react";
import lodash from "lodash"


export type DataTypeSelectInputComponentProps = DataTypeInputComponentProps


export const DataTypeSelectInputComponent: React.FC<DataTypeSelectInputComponentProps> = (props) => {

    const {formValidation, title, initialValue, description, suggestions, onChange} = props

    const defaultValue: number = React.useMemo(() => suggestions?.findIndex(suggest => {
        return initialValue && lodash.isMatch(initialValue, suggest)
    }), [suggestions])!

    const onChangeDebounced = useDebouncedCallback((value: string | null) => {
        onChange?.((!!value ? suggestions?.[Number(value)] : null) ?? null)
    }, 200)

    return React.useMemo(() => <>
        <InputLabel>{title}</InputLabel>
        <InputDescription>{description}</InputDescription>
        <SelectInput value={defaultValue >= 0 ? defaultValue?.toString() : undefined}
                     formValidation={{...formValidation, setValue: undefined}}
                     maw={"100%"}
                     key={defaultValue}
                     onValueChange={(value) => {
                         formValidation?.setValue?.((!!value ? suggestions?.[Number(value)] : null) ?? null)
                         onChangeDebounced?.(value)
                     }}
                     right={
                         <ButtonGroup color={"primary"}>
                             <Button tabIndex={-1} color={"secondary"} onClick={() => {
                                 formValidation?.setValue?.(null)
                                 onChangeDebounced(null)
                             }} paddingSize={"xxs"}>
                                 <IconX size={13}/>
                             </Button>
                         </ButtonGroup>
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

                            if (suggest.__typename === "LiteralValue") {
                                return <SelectItem value={index.toString()}>
                                    <SelectItemText>
                                        <Flex style={{gap: "0.35rem"}} align={"center"}>
                                            {(suggest)?.value}
                                        </Flex>
                                    </SelectItemText>
                                </SelectItem>
                            }

                            if (suggest.__typename === "ReferenceValue") {
                                return <SelectItem value={index.toString()}>
                                    <SelectItemText>
                                        <ReferenceBadgeComponent value={suggest}/>
                                    </SelectItemText>
                                </SelectItem>
                            }
                        })}
                    </SelectViewport>
                </SelectContent>
            </SelectPortal>
        </SelectInput>
    </>, [formValidation, defaultValue])
}