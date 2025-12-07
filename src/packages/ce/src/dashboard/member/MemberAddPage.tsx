"use client"

import React from "react";
import {
    Button,
    Col,
    DUserInput,
    DUserView,
    Flex,
    InputSuggestion,
    Spacing,
    Text,
    useForm,
    useService, useStore
} from "@code0-tech/pictor";
import {MemberService} from "@edition/member/Member.service";
import {useParams, useRouter} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import Link from "next/link";
import {UserService} from "@edition/user/User.service";

export const MemberAddPage: React.FC = () => {

    const params = useParams()
    const memberService = useService(MemberService)
    const memberStore = useStore(MemberService)
    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const router = useRouter()
    const [, startTransition] = React.useTransition()

    const namespaceIndex = params?.namespaceId as string
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex as unknown as number}`

    const members = React.useMemo(() => memberService.values({namespaceId: namespaceId}), [memberStore, userStore])
    const formInitialValues = React.useMemo(() => ({ users: null }), [])
    const filteredUsers = React.useMemo(() => {
        return (user: DUserView) => {
            return !members.find(m => m.user?.id === user.id)
        }
    }, [members])

    const [inputs, validate] = useForm<{ users: null | InputSuggestion[] }>({
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
                        userId: (value.valueData as DUserView).id!!
                    })
                }
                router.push(`/namespace/${namespaceIndex}/members`)
            })
        }
    })

    return <Flex mih={"100%"} miw={"100%"} align={"center"} justify={"center"}>
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
            <DUserInput title={"Description"}
                        description={"Provide a simple project description"}
                        filter={filteredUsers}
                        validationUsesSuggestions
                        {...inputs.getInputProps("users")}/>
            <Spacing spacing={"xl"}/>
            <Flex style={{gap: "0.35rem"}} justify={"space-between"}>
                <Link href={"/"}>
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
}