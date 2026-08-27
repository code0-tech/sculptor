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
    Flex, getSize,
    hashToColor,
    Spacing,
    Text,
    useForm,
    useService
} from "@code0-tech/pictor";
import {IconCloudUpload, IconFileInfoFilled, IconX} from "@tabler/icons-react";
import {FileUploadFileChangeDetails} from "@ark-ui/react";
import {ApplicationService} from "@ee-internal/application/services/Application.service";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";

export const LicenseAddPage: React.FC = () => {

    const applicationService = useService(ApplicationService)
    const router = useRouter()

    const initialValues = React.useMemo(() => ({
        file: undefined
    }), [])

    const [inputs, validate] = useForm<{ file: FileUploadFileChangeDetails | undefined }>({
        initialValues,
        useInitialValidation: false,
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
                        toast({title: "Added license", color: "success"})
                        router.push("/")
                    }
                })
            })
        }
    })

    return <>
        <Text size={"lg"} hierarchy={"primary"}>
            Add a license
        </Text>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            Upload your license file to unlock the Enterprise Edition features.
        </Text>
        <Spacing spacing={"xl"}/>
        {/*@ts-ignore*/}
        <FileInput accept={".czlc"}
                   pos={"relative"}
                   {...inputs.getInputProps("file")}
                   maxFiles={1}>
            <FileInputDropzone asChild>
                <Card color={"primary"} style={{boxShadow: "none", border: "1px dashed rgba(191, 191, 191, 0.25)"}}>
                    <Flex align={"center"} justify={"center"}
                          style={{textAlign: "center", flexDirection: "column", gap: "1rem", padding: "1rem 0"}}>
                        <Flex align={"center"} justify={"center"}
                              style={{
                                  width: "3rem",
                                  height: "3rem",
                                  borderRadius: "50%",
                                  background: "rgba(191, 191, 191, 0.08)"
                              }}>
                            <IconCloudUpload size={24} color={"rgba(191, 191, 191, 0.75)"}/>
                        </Flex>
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
                        <Text size={"sm"} hierarchy={"tertiary"}>
                            Only .czlc files are accepted.
                        </Text>
                    </Flex>
                </Card>
            </FileInputDropzone>
            <FileInputItemGroup>
                <FileInputContext>
                    {({acceptedFiles}) => acceptedFiles?.map((file) => (
                        <FileInputItem file={file} key={file.name} asChild>
                            <Card color={"secondary"} style={{marginTop: getSize("xs")}} paddingSize={"xxs"}>
                                <Flex align={"center"} justify={"space-between"}>
                                    <Flex align={"center"} style={{gap: "0.7rem"}}>
                                        {
                                            file.name.endsWith(".czlc") && (
                                                <FileInputItemPreview type=".*" style={{borderRadius: "0.6rem"}}>
                                                    <IconFileInfoFilled color={hashToColor(file.name)} size={24}/>
                                                </FileInputItemPreview>
                                            )
                                        }
                                        <Flex style={{flexDirection: "column"}}>
                                            <Text>
                                                <FileInputItemName/>
                                            </Text>
                                            <Text>
                                                <FileInputItemSizeText/>
                                            </Text>
                                        </Flex>
                                    </Flex>
                                    <FileInputItemDeleteTrigger asChild>
                                        <Button style={{padding: getSize("xs")}} variant={"none"}>
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
        <Button color={"success"} w={"100%"} onClick={() => validate()}>
            Add license
        </Button>
        <Spacing spacing={"xl"}/>
        <Text display={"flex"} hierarchy={"tertiary"} size={"md"} mb={0.7}>
            Already bought a license?
            <Link href={"https://cloud.codezero.app"} target={"_blank"}>
                <Text ml={0.35} hierarchy={"primary"} display={"flex"} size={"md"}>
                    Download it here
                </Text>
            </Link>
        </Text>
        <Text display={"flex"} hierarchy={"tertiary"} size={"md"}>
            Don't have a license yet?
            <Link href={"https://codezero.build/subscription"} target={"_blank"}>
                <Text ml={0.35} hierarchy={"primary"} display={"flex"} size={"md"}>
                    Buy a license
                </Text>
            </Link>
        </Text>
    </>
}