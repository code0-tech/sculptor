import React from "react";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {
    Button,
    ColorInput,
    ColorInputContent,
    ColorInputControl,
    ColorInputSwatch,
    ColorInputTrigger,
    ColorInputValueText,
    InputDescription,
    InputLabel
} from "@code0-tech/pictor";
import {IconColorPicker} from "@tabler/icons-react";
import {useDebouncedCallback} from "use-debounce";
import {
    LiteralValue,
    NodeFunction,
    NodeParameterValue,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {DataTypeInputControlsComponent} from "@edition/datatype/components/inputs/DataTypeInputControlsComponent";
import {DataTypeInputValueComponent} from "@edition/datatype/components/inputs/DataTypeInputValueComponent";

interface HslaColor {
    hue: number
    saturation: number
    lightness: number
    alpha?: number
}

export type DataTypeColorInputComponentProps = DataTypeInputComponentProps

export const DataTypeColorInputComponent: React.FC<DataTypeColorInputComponentProps> = (props) => {

    const {formValidation, title, initialValue, description, suggestions, onChange} = props

    const defaultValue: NodeParameterValue | NodeFunction | undefined = React.useMemo(() => initialValue ?? undefined, [initialValue])
    const onChangeDebounced = useDebouncedCallback((value: LiteralValue | SubFlowValue | NodeFunction | ReferenceValue | null) => {
        onChange?.(value)
    }, 400)

    const color = (defaultValue as LiteralValue)?.value as HslaColor | undefined
    const value = color && typeof color === "object"
        ? `hsla(${color.hue}, ${color.saturation}%, ${color.lightness}%, ${color.alpha ?? 1})`
        : null

    return React.useMemo(() => <>
        <InputLabel>{title}</InputLabel>
        <InputDescription>{description}</InputDescription>
        <DataTypeInputValueComponent initialValue={initialValue} onChange={value => {
            formValidation?.setValue?.(value)
            onChangeDebounced(value)
        }} suggestions={suggestions}
                                     formValidation={formValidation}>
            <ColorInput value={value}
                        maw={"100%"}
                        formValidation={{
                            ...formValidation,
                            setValue: (value: string | undefined) => {
                                if (value == null) {
                                    formValidation?.setValue?.(null)
                                    onChangeDebounced(null)
                                    return
                                }
                                const parts = value.replace(/^hsla?\(|\)$/g, "").split(",").map(part => part.trim())
                                const alpha = parts[3] != null ? Number(parts[3]) : undefined
                                const literal: LiteralValue = {
                                    __typename: "LiteralValue",
                                    value: {
                                        hue: Number(parts[0]),
                                        saturation: Number(parts[1]?.replace("%", "")),
                                        lightness: Number(parts[2]?.replace("%", "")),
                                        ...(alpha != null ? {alpha} : {})
                                    }
                                }
                                formValidation?.setValue?.(literal)
                                onChangeDebounced(literal)
                            }
                        }}
                        right={
                            <DataTypeInputControlsComponent suggestions={suggestions} onSelect={value => {
                                formValidation?.setValue?.(value)
                                onChangeDebounced(value)
                            }}>
                                <ColorInputTrigger asChild>
                                    <Button paddingSize={"xxs"}>
                                        <IconColorPicker size={13}/>
                                    </Button>
                                </ColorInputTrigger>
                            </DataTypeInputControlsComponent>
                        }
                        rightType={"action"}>
                <ColorInputControl>
                    <ColorInputSwatch/>
                    <ColorInputValueText fz={0.8}/>
                </ColorInputControl>
                <ColorInputContent/>
            </ColorInput>
        </DataTypeInputValueComponent>
    </>, [formValidation, defaultValue])
}
