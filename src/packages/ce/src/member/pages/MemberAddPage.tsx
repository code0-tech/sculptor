"use client"

import React from "react";
import {Button, Col, Flex, Spacing, Text, useForm, useService, useStore} from "@code0-tech/pictor";
import {MemberService} from "@edition/member/services/Member.service";
import {useParams, useRouter} from "next/navigation";
import {Namespace, User} from "@code0-tech/sagittarius-graphql-types";
import Link from "next/link";
import {UserService} from "@edition/user/services/User.service";
import {InputSyntaxSegment} from "@code0-tech/pictor/dist/components/form/Input.syntax.hook";
import {UserInputComponent} from "@edition/user/components/UserInputComponent";

export const MemberAddPage: React.FC = () => {

    const params = useParams()
    const memberService = useService(MemberService)
    const memberStore = useStore(MemberService)
    const router = useRouter()
    const [, startTransition] = React.useTransition()

    const namespaceIndex = params?.namespaceId as string
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex as unknown as number}`

    const members = React.useMemo(() => memberService.values({namespaceId: namespaceId}), [memberStore])
    const formInitialValues = React.useMemo(() => ({users: null}), [])
    const filteredUsers = React.useMemo(() => {
        return (user: User) => {
            return !members.find(m => m.user?.id === user.id)
        }
    }, [members])

    const [inputs, validate] = useForm<{ users: null | InputSyntaxSegment[] }>({
        initialValues: formInitialValues,
        validate: {
            users: (value) => {
                if (!value) return "Please select at least one user"
                if (value.length <= 0) return "Please select at least one user"
                return null
            }
        },
        onSubmit: (values) => {
            startTransition(async () => {
                for (const value of values.users!!) {
                    await memberService.memberInvite({
                        namespaceId: namespaceId!!,
                        userId: (value.value).id!!
                    })
                }
                router.push(`/namespace/${namespaceIndex}/members`)
            })
        }
    })

    //TODO: user abilities for add user as member within namespace

    return <div style={{
        background: "#070514",
        height: "100%",
        padding: "1rem",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem"
    }}>
        <Flex mih={"100%"} miw={"100%"} align={"center"} justify={"center"}>
            <Col xs={4}>
                <Text size={"xl"} hierarchy={"primary"} display={"block"}>
                    Add new members
                </Text>
                <Spacing spacing={"xs"}/>
                <Text size={"md"} hierarchy={"tertiary"} display={"block"}>
                    Global runtimes are shared runtimes that can be used across multiple organizations.
                </Text>
                <Spacing spacing={"xl"}/>
                {/*@ts-ignore*/}
                <UserInputComponent title={"Description"}
                                    description={"Provide a simple project description"}
                                    filter={filteredUsers}
                                    validationUsesSyntax
                                    {...inputs.getInputProps("users")}/>
                <Spacing spacing={"xl"}/>
                <Flex style={{gap: "0.35rem"}} justify={"space-between"}>
                    <Link href={"/public"}>
                        <Button color={"primary"}>
                            Go back to members
                        </Button>
                    </Link>
                    <Button color={"success"} onClick={validate}>
                        Add members
                    </Button>
                </Flex>
            </Col>
        </Flex>
    </div>
}