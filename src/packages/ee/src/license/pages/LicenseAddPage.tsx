"use client"

import React, {startTransition} from "react";
import {
    Button,
    Card,
    FileInput,
    FileInputContext,
    FileInputDropzone,
    FileInputHiddenInput,
    FileInputItem,
    FileInputItemDeleteTrigger,
    FileInputItemGroup,
    FileInputItemName,
    FileInputItemPreview,
    FileInputItemSizeText,
    FileInputTrigger,
    Flex,
    hashToColor,
    Spacing,
    Text, toast,
    useForm, useService
} from "@code0-tech/pictor";
import {IconFileInfoFilled, IconX} from "@tabler/icons-react";
import {FileUploadFileChangeDetails} from "@ark-ui/react";
import {ApplicationService} from "@ee/application/services/Application.service";
import {useRouter} from "next/navigation";

export const LicenseAddPage: React.FC = () => {

    const applicationService = useService(ApplicationService)
    const router = useRouter()

    const [inputs, validate, values] = useForm<{ file: FileUploadFileChangeDetails | undefined }>({
        initialValues: {
            file: undefined
        },
        validate: {
            file: (value) => {
                if (!value || value.acceptedFiles.length <= 0) return "Please upload a license file"
                return null
            }
        },
        onSubmit: (values) => {
            startTransition(async () => {
                const fileContent = await values.file?.acceptedFiles[0].text()

                applicationService.applicationLicenseAdd({
                    data: fileContent ?? ""
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        toast({
                            title: "The license was successfully added.",
                            color: "success",
                            dismissible: true,
                        })
                        router.push("/")
                    }
                })
            })
        }
    })

    React.useEffect(() => {
        validate("file")
    }, [values])

    return <>
        <Text size={"lg"} hierarchy={"primary"}>
            Add a license
        </Text>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            Build high-class workflows, endpoints and software without coding
        </Text>
        <Spacing spacing={"xl"}/>
        {/*@ts-ignore*/}
        <FileInput title={"License"}
                   description={"Build high-class workflows, endpoints and software without coding"}
                   accept={".czlc"}
                   pos={"relative"}
                   {...inputs.getInputProps("file")}
                   maxFiles={1}>
            <FileInputDropzone asChild>
                <Card color={"tertiary"} style={{boxShadow: "none", border: "1px dashed rgba(191, 191, 191, 0.1)"}}>
                    <Flex align={"center"} justify={"center"}
                          style={{textAlign: "center", flexDirection: "column", gap: "1rem"}}>
                        <Text size={"md"} hierarchy={"primary"} display={"flex"} align={"center"}
                              style={{gap: "0.35rem"}}>
                            Drag license file or
                            <FileInputTrigger asChild>
                                <Button paddingSize={"xxs"}>
                                    <Text hierarchy={"primary"}>Choose file</Text>
                                </Button>
                            </FileInputTrigger>
                            to upload
                        </Text>
                        <Text>
                            Only .czlc files are accepted.
                        </Text>
                    </Flex>
                </Card>
            </FileInputDropzone>
            <FileInputItemGroup display={"flex"} mt={1} style={{flexDirection: "column", gap: "0.35rem"}}>
                <FileInputContext>
                    {({acceptedFiles}) => acceptedFiles?.map((file) => (
                        <FileInputItem file={file} key={file.name} asChild>
                            <Card paddingSize={"xxs"}>
                                <Flex align={"center"} justify={"space-between"}>
                                    <Flex align={"center"} style={{gap: "0.7rem"}}>
                                        {
                                            file.name.endsWith(".czlc") && (
                                                <FileInputItemPreview type=".*" style={{borderRadius: "0.6rem"}}>
                                                    <IconFileInfoFilled color={hashToColor(file.name)} size={24}/>
                                                </FileInputItemPreview>
                                            )
                                        }
                                        <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                                            <Text>
                                                <FileInputItemName/>
                                            </Text>
                                            <Text>
                                                <FileInputItemSizeText/>
                                            </Text>
                                        </Flex>
                                    </Flex>
                                    <FileInputItemDeleteTrigger asChild>
                                        <Button variant={"none"}>
                                            <IconX size={16}/>
                                        </Button>
                                    </FileInputItemDeleteTrigger>
                                </Flex>
                            </Card>
                        </FileInputItem>
                    ))}
                </FileInputContext>
            </FileInputItemGroup>
            <FileInputHiddenInput/>
        </FileInput>
        <Spacing spacing={"xl"}/>
        <Button color={"success"} w={"100%"}>
            Add license
        </Button>
    </>
}