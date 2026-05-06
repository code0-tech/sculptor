import React from "react";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {
    Button,
    EditorInput,
    Flex,
    hashToColor,
    InputDescription,
    InputLabel,
    Menu,
    MenuContent,
    MenuItem,
    MenuPortal,
    MenuTrigger
} from "@code0-tech/pictor";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {StreamLanguage} from "@codemirror/language";
import {tags} from "@lezer/highlight";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {IconVariable, IconX} from "@tabler/icons-react";
import {useDebouncedCallback} from "use-debounce";
import {LiteralValue, NodeFunction, NodeParameterValue} from "@code0-tech/sagittarius-graphql-types";

export type DataTypeTextInputComponentProps = DataTypeInputComponentProps

export const DataTypeTextInputComponent: React.FC<DataTypeTextInputComponentProps> = (props) => {

    const {formValidation, title, initialValue, description, suggestions, onChange} = props

    const defaultValue: NodeParameterValue | NodeFunction | undefined = React.useMemo(() => initialValue ?? undefined, [initialValue])
    const onChangeDebounced = useDebouncedCallback((value: string | undefined) => {
        formValidation?.setValue?.(value ? {__typename: "LiteralValue", value: value} : undefined)
        onChange?.(value ? {__typename: "LiteralValue", value: value} : undefined)
    }, 200)

    return React.useMemo(() => <>
        <InputLabel>{title}</InputLabel>
        <InputDescription>{description}</InputDescription>
        {defaultValue?.__typename === "NodeFunction" || defaultValue?.__typename === "NodeFunctionIdWrapper" ? (
            <NodeBadgeComponent value={defaultValue}/>
        ) : defaultValue?.__typename === "ReferenceValue" ? (
            <ReferenceBadgeComponent value={defaultValue}/>
        ) : (
            <EditorInput value={(defaultValue as LiteralValue)?.value}
                         onChange={onChangeDebounced}
                         formValidation={{...formValidation, setValue: undefined}}
                         maw={"100%"}
                         placeholder={String(title) ?? ""}
                         language={StreamLanguage.define({
                             token(stream) {
                                 stream.next()
                                 return null;
                             }
                         })}
                         tokenStyles={[
                             {tag: tags.keyword, color: hashToColor("bracket")},
                         ]}
                         right={
                             (suggestions?.length ?? 0) > 0 ? (
                                 <ButtonGroup color={"primary"}>
                                     <Menu>
                                         <MenuTrigger asChild>
                                             <Button paddingSize={"xxs"}>
                                                 <IconVariable size={13}/>
                                             </Button>
                                         </MenuTrigger>
                                         <MenuPortal>
                                             <MenuContent>
                                                 {suggestions?.map((suggest, index) => {
                                                     if (suggest.__typename === "LiteralValue") {
                                                         return <MenuItem>
                                                             <Flex style={{gap: "0.35rem"}} align={"center"}>
                                                                 {(suggest)?.value.toString()}
                                                             </Flex>
                                                         </MenuItem>
                                                     }

                                                     if (suggest.__typename === "ReferenceValue") {
                                                         return <MenuItem>
                                                             <ReferenceBadgeComponent value={suggest}/>
                                                         </MenuItem>
                                                     }
                                                 })}
                                             </MenuContent>
                                         </MenuPortal>
                                     </Menu>
                                     <Button paddingSize={"xxs"} onClick={() => {
                                         onChangeDebounced(undefined)
                                     }}>
                                         <IconX size={13}/>
                                     </Button>
                                 </ButtonGroup>
                             ) : (
                                 <Button color={"primary"} paddingSize={"xxs"} onClick={() => {
                                     onChangeDebounced(undefined)
                                 }}>
                                     <IconX size={13}/>
                                 </Button>
                             )
                         }
                         rightType={"action"}/>
        )}
    </>, [formValidation, defaultValue])
}
