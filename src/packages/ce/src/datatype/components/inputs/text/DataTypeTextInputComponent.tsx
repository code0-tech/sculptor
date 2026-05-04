import React from "react";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {Button, EditorInput, hashToColor, InputDescription, InputLabel} from "@code0-tech/pictor";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {StreamLanguage} from "@codemirror/language";
import {tags} from "@lezer/highlight";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {IconVariable, IconX} from "@tabler/icons-react";
import {useDebounce, useDebouncedCallback} from "use-debounce";

export type DataTypeTextInputComponentProps = DataTypeInputComponentProps

export const DataTypeTextInputComponent: React.FC<DataTypeTextInputComponentProps> = (props) => {

    const {formValidation, title, initialValue, description, suggestions, onChange} = props

    const defaultValue = React.useMemo(() => initialValue ?? "", [])
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
            <EditorInput value={String(defaultValue)} onChange={onChangeDebounced} formValidation={formValidation} maw={"100%"} placeholder={"sd"} language={StreamLanguage.define({
                token(stream) {
                    stream.next()
                    return null;
                }
            })} tokenStyles={[
                {tag: tags.keyword, color: hashToColor("bracket")},
            ]} right={
                (suggestions?.length ?? 0) > 0 ? (
                    <ButtonGroup bg={"transparent"}>
                        <Button color={"primary"} paddingSize={"xxs"}>
                            <IconVariable size={13}/>
                        </Button>
                        <Button color={"primary"} paddingSize={"xxs"}>
                            <IconX size={13}/>
                        </Button>
                    </ButtonGroup>
                ) : (
                    <Button color={"primary"} paddingSize={"xxs"}>
                        <IconX size={13}/>
                    </Button>
                )
            } rightType={"action"}/>
        )}
    </>, [formValidation])
}
