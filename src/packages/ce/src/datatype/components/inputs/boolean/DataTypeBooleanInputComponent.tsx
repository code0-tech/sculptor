import React from "react";
import {DataTypeInputComponentProps} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {
    Button,
    Card,
    Flex,
    InputDescription,
    InputLabel,
    InputMessage,
    SegmentedControl,
    SegmentedControlItem,
    Text
} from "@code0-tech/pictor";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {FunctionSuggestionMenuComponent} from "@edition/function/components/suggestion/FunctionSuggestionMenuComponent";
import {IconAlignLeft, IconX} from "@tabler/icons-react";

export type DataTypeBooleanInputComponentProps = DataTypeInputComponentProps

export const DataTypeBooleanInputComponent: React.FC<DataTypeBooleanInputComponentProps> = (props) => {

    const {suggestions, value, title, description, formValidation, onChange} = props

    return <>
        <InputLabel>{title}</InputLabel>
        <InputDescription>{description}</InputDescription>

        <Card color="secondary" paddingSize="xs">
            <Flex style={{gap: ".7rem"}} align="center" justify="space-between">
                <Flex style={{gap: ".35rem"}} align="center">
                    <Text>Boolean</Text>
                </Flex>
                <ButtonGroup color={"primary"}>
                    <FunctionSuggestionMenuComponent suggestions={suggestions}
                                                     onSuggestionSelect={suggestion => {
                                                         formValidation?.setValue(suggestion)
                                                         onChange?.({} as any)
                                                     }}
                                                     triggerContent={<Button paddingSize="xxs" variant="filled"
                                                                             color="secondary">
                                                         <IconAlignLeft size={13}/>
                                                     </Button>}/>
                    <Button paddingSize="xxs" variant="filled" color="secondary" onClick={() => {
                        formValidation?.setValue(undefined)
                        onChange?.({} as any)
                    }}>
                        <IconX size={13}/>
                    </Button>
                </ButtonGroup>
            </Flex>
            <Card paddingSize="xs" mt={0.7} mb={-0.55} mx={-0.55}>
                {value?.__typename === "NodeFunction" || value?.__typename === "NodeFunctionIdWrapper" ? (
                    <NodeBadgeComponent value={value}/>
                ) : value?.__typename === "ReferenceValue" ? (
                    <ReferenceBadgeComponent value={value}/>
                ) : (
                    <SegmentedControl type={"single"} onValueChange={(value) => {
                        formValidation?.setValue(value === "true" ? "true" : (value == "false") ? "false" : undefined)
                        onChange?.({} as any)
                    }}>
                        <SegmentedControlItem w={"100%"} value={"true"}>
                            True
                        </SegmentedControlItem>
                        <SegmentedControlItem w={"100%"} value={"false"}>
                            False
                        </SegmentedControlItem>
                    </SegmentedControl>
                )}
            </Card>
        </Card>
        {!formValidation?.valid && formValidation?.notValidMessage && (
            <InputMessage>{formValidation.notValidMessage}</InputMessage>
        )}
    </>

}