import React from "react";
import {DataTypeInputComponentProps} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {Button, Flex, InputDescription, InputLabel, Text} from "@code0-tech/pictor";
import {InputWrapper} from "@code0-tech/pictor/dist/components/form/InputWrapper";
import {IconChevronDown, IconFunction, IconPencil} from "@tabler/icons-react";
import {DataTypeJSONInputComponent} from "@edition/datatype/components/inputs/json/DataTypeJSONInputComponent";
import {DataTypeInputControlsComponent} from "@edition/datatype/components/inputs/DataTypeInputControlsComponent";
import {SuggestionDialogComponent} from "@edition/function/components/suggestion/SuggestionDialogComponent";
import {exactProducers} from "@edition/datatype/utils/DataType.exactProducers.util";

export type DataTypeProducerInputComponentProps = DataTypeInputComponentProps

export const DataTypeProducerInputComponent: React.FC<DataTypeProducerInputComponentProps> = (props) => {

    const {
        schema,
        title,
        description,
        formValidation,
        suggestions,
        initialValue,
        flowId,
        nodeId,
        parameterIndex,
        onChange
    } = props

    const [manual, setManual] = React.useState(!!initialValue)
    const [pickerOpen, setPickerOpen] = React.useState(false)

    const producers = React.useMemo(() => exactProducers(schema), [schema])

    const producedName = typeof title === "string" && title.length > 0 ? title.toLowerCase() : null
    const producedTarget = producedName
        ? `${"aeiou".includes(producedName[0]) ? "an" : "a"} ${producedName}`
        : "this value"

    if (manual) return <DataTypeJSONInputComponent {...props} controlButton={
        <Button paddingSize={"xxs"} onClick={() => {
            setManual(false)
            formValidation?.setValue?.(null)
            onChange?.(null)
        }}>
            <IconFunction size={13}/>
        </Button>
    }/>

    return <>
        <SuggestionDialogComponent suggestions={producers}
                                   flowId={flowId}
                                   nodeId={nodeId}
                                   parameterIndex={parameterIndex}
                                   open={pickerOpen}
                                   onOpenChange={open => setPickerOpen(open)}
                                   onSuggestionSelect={value => {
                                       setPickerOpen(false)
                                       formValidation?.setValue?.(value)
                                       onChange?.(value)
                                   }}/>
        {title && <InputLabel>{title}</InputLabel>}
        {description && <InputDescription>{description}</InputDescription>}
        <InputWrapper formValidation={{...formValidation, setValue: undefined}}
                      onClick={() => setPickerOpen(true)}
                      right={
                          <DataTypeInputControlsComponent suggestions={suggestions}
                                                          nodeId={nodeId}
                                                          parameterIndex={parameterIndex}
                                                          onSelect={value => {
                                                              formValidation?.setValue?.(value)
                                                              onChange?.(value)
                                                          }}>
                              <Button paddingSize={"xxs"} onClick={() => setManual(true)}>
                                  <IconPencil size={13}/>
                              </Button>
                          </DataTypeInputControlsComponent>
                      }
                      rightType={"action"}>
            <div style={{alignSelf: "center", flex: "1 1 auto", cursor: "pointer"}}>
                <Flex align={"center"} justify={"space-between"} w={"100%"} style={{gap: "0.7rem"}}>
                    <Text hierarchy={"tertiary"}>
                        {producers.length === 1
                            ? `Choose the function that creates ${producedTarget}`
                            : `Choose a function that creates ${producedTarget}`}
                    </Text>
                    <IconChevronDown size={13}/>
                </Flex>
            </div>
        </InputWrapper>
    </>
}
