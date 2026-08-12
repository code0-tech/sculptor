import React from "react";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {
    Button,
    FileInput,
    FileInputContext,
    FileInputDropzone,
    FileInputHiddenInput,
    FileInputItem,
    FileInputItemDeleteTrigger,
    FileInputItemGroup,
    FileInputItemName,
    FileInputTrigger,
    Flex,
    InputDescription,
    InputLabel,
    Text
} from "@code0-tech/pictor";
import {InputWrapper} from "@code0-tech/pictor/dist/components/form/InputWrapper";
import {IconPaperclip, IconX} from "@tabler/icons-react";
import {FileUploadFileChangeDetails} from "@ark-ui/react";
import {useDebouncedCallback} from "use-debounce";
import {NodeSchema, Schema} from "@code0-tech/triangulum";
import {
    LiteralValue,
    NodeFunction,
    NodeParameterValue,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {DataTypeInputControlsComponent} from "@edition/datatype/components/inputs/DataTypeInputControlsComponent";
import {DataTypeInputValueComponent} from "@edition/datatype/components/inputs/DataTypeInputValueComponent";

export type DataTypeFileInputComponentProps = DataTypeInputComponentProps

export const DataTypeFileInputComponent: React.FC<DataTypeFileInputComponentProps> = (props) => {

    const {schema, formValidation, title, initialValue, description, suggestions, onChange} = props

    const dataSchema = "schema" in (schema ?? {}) ? (schema as NodeSchema)?.schema : (schema as Schema)
    const multiple = dataSchema?.input === "list-file"
    const mimetype = (dataSchema as { mimetype?: string })?.mimetype

    const maxUploadSize = 5 * 1024 * 1024
    const base64ByName = React.useRef<Map<string, string>>(new Map())
    const defaultValue: NodeParameterValue | NodeFunction | undefined = React.useMemo(() => initialValue ?? undefined, [initialValue])
    const defaultAcceptedFiles: File[] = React.useMemo(() => {
        const literal = initialValue?.__typename === "LiteralValue" ? initialValue.value : undefined
        if (literal == null) return []
        const entries = Array.isArray(literal) ? literal : [literal]
        return entries.flatMap((entry, index) => {
            const contentType = (entry as { contentType?: string })?.contentType ?? ""
            const base64 = (entry as { value?: string })?.value
            if (typeof base64 !== "string") return []
            const extension = contentType.includes("/") ? contentType.split("/")[1] : ""
            const name = (entry as { fileName?: string })?.fileName || (extension ? `file-${index}.${extension}` : `file-${index}`)
            base64ByName.current.set(name, base64)
            return [new File([], name, {type: contentType})]
        })
    }, [initialValue])
    const fileKey = defaultAcceptedFiles.map(file => `${file.type}:${file.name}`).join("|") || "empty"
    const onChangeDebounced = useDebouncedCallback((value: LiteralValue | SubFlowValue | NodeFunction | ReferenceValue | null) => {
        onChange?.(value)
    }, 400)

    return React.useMemo(() => <>
        <InputLabel>{title}</InputLabel>
        <InputDescription>{description}</InputDescription>
        <DataTypeInputValueComponent initialValue={initialValue} onChange={value => {
            formValidation?.setValue?.(value)
            onChangeDebounced(value)
        }} suggestions={suggestions} formValidation={formValidation}>
            {/*@ts-ignore*/}
            <FileInput key={fileKey}
                       accept={mimetype && mimetype !== "*/*" ? mimetype : undefined}
                       maxFiles={multiple ? Number.POSITIVE_INFINITY : 1}
                       maxFileSize={maxUploadSize}
                       defaultAcceptedFiles={defaultAcceptedFiles}
                       maw={"100%"}
                       formValidation={{
                           ...formValidation,
                           notValidMessage: undefined,
                           setValue: (details: FileUploadFileChangeDetails | undefined) => {
                               void (async () => {
                                   const files = await Promise.all((details?.acceptedFiles ?? []).map(async file => {
                                       const value = base64ByName.current.get(file.name) ?? await new Promise<string>((resolve, reject) => {
                                           const reader = new FileReader()
                                           reader.onload = () => {
                                               const result = reader.result as string
                                               resolve(result.slice(result.indexOf(",") + 1))
                                           }
                                           reader.onerror = reject
                                           reader.readAsDataURL(file)
                                       })
                                       base64ByName.current.set(file.name, value)
                                       return {
                                           contentType: file.type || (mimetype && mimetype !== "*/*" ? mimetype : ""),
                                           valueType: "base64" as const,
                                           fileName: file.name,
                                           value
                                       }
                                   }))
                                   const literal: LiteralValue | null = files.length <= 0 ? null : {
                                       __typename: "LiteralValue",
                                       value: multiple ? files : files[0]
                                   }
                                   formValidation?.setValue?.(literal)
                                   onChangeDebounced(literal)
                               })()
                           }
                       }}>
                <FileInputDropzone asChild>
                    <div style={{width: "100%", cursor: "pointer"}}>
                        <InputWrapper maw={"100%"}
                                      formValidation={{...formValidation, setValue: undefined}}
                                      rightType={"action"}
                                      right={
                                          <div onClick={event => event.stopPropagation()}>
                                              <DataTypeInputControlsComponent suggestions={suggestions} onSelect={value => {
                                                  formValidation?.setValue?.(value)
                                                  onChangeDebounced(value)
                                              }}>
                                                  <FileInputTrigger asChild>
                                                      <Button paddingSize={"xxs"}>
                                                          <IconPaperclip size={13}/>
                                                      </Button>
                                                  </FileInputTrigger>
                                              </DataTypeInputControlsComponent>
                                          </div>
                                      }>
                            <div style={{alignSelf: "center", flex: "1 1 auto"}}>
                                <FileInputContext>
                                    {({acceptedFiles}) => acceptedFiles.length <= 0 ? (
                                        <Text hierarchy={"tertiary"} fz={0.8}>
                                            {title}
                                        </Text>
                                    ) : !multiple ? (
                                        <Text fz={0.8}>
                                            {acceptedFiles[0]?.name}
                                        </Text>
                                    ) : (
                                        <FileInputItemGroup display={"flex"}
                                                            onClick={event => event.stopPropagation()}
                                                            py={0.7}
                                                            style={{gap: "0.35rem", flexWrap: "wrap", alignItems: "center"}}>
                                            {acceptedFiles.map(file => (
                                                <FileInputItem file={file} key={file.name} asChild>
                                                    <Flex align={"center"} justify={"center"} style={{gap: "0.25rem"}}>
                                                        <Text fz={0.8}>
                                                            <FileInputItemName/>
                                                        </Text>
                                                        {acceptedFiles.length > 1 && (
                                                            <FileInputItemDeleteTrigger asChild>
                                                                <Button variant={"outlined"} p={"0"}
                                                                        onClick={event => event.stopPropagation()}>
                                                                    <IconX size={13}/>
                                                                </Button>
                                                            </FileInputItemDeleteTrigger>
                                                        )}
                                                    </Flex>
                                                </FileInputItem>
                                            ))}
                                        </FileInputItemGroup>
                                    )}
                                </FileInputContext>
                            </div>
                        </InputWrapper>
                    </div>
                </FileInputDropzone>
                <FileInputHiddenInput/>
            </FileInput>
        </DataTypeInputValueComponent>
    </>, [formValidation, defaultValue])
}
