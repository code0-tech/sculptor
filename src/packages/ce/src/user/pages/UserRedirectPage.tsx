import React from "react";
import {
    Alert,
    Button,
    Card,
    CheckboxInput,
    Flex,
    InputDescription,
    InputLabel,
    Spacing,
    Text,
    TextInput
} from "@code0-tech/pictor";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {useRouter, useSearchParams} from "next/navigation";
import {IconApiApp, IconCheck} from "@tabler/icons-react";
import {isValidRedirect} from "@core/util/redirect";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";

export const UserRedirectPage: React.FC = (props) => {

    const userSession = useUserSession()
    const params = useSearchParams()
    const callbackUrl = params.get("callbackUrl")
    const router = useRouter()
    const isValidCallback = isValidRedirect(callbackUrl)

    if (userSession === null) router.push("/login")

    return <>

        <Text size={"lg"} hierarchy={"primary"} display={"block"}>
            Authorize third party application
        </Text>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"} display={"block"}>
            Build high-class workflows, endpoints and software without coding
        </Text>
        <Spacing spacing={"xl"}/>
        {
            !isValidCallback && (
                <>
                    <Alert color={"error"}>
                        This is not a valid and verified application. Please go back if you don't trust the source of this
                        link.
                    </Alert>
                    <Spacing spacing={"xl"}/>
                </>
            )
        }
        <TextInput left={<IconApiApp size={16}/>} disabled value={`${callbackUrl}`}/>
        <Spacing spacing={"xl"}/>
        <Card color={"secondary"}>
            <CardSection border>
                <Flex style={{gap: "0.7rem"}} align={"center"}>
                    <IconCheck style={{minWidth: "1rem"}} size={16}/>
                    <Text>Can access your account information like email, username, and other stored information on your account</Text>
                </Flex>
            </CardSection>
            <CardSection border>
                <Flex style={{gap: "0.7rem"}} align={"center"}>
                    <IconCheck size={16}/>
                    <Text>Can access, manage and edit organizations</Text>
                </Flex>
            </CardSection>
            <CardSection border>
                <Flex style={{gap: "0.7rem"}} align={"center"}>
                    <IconCheck size={16}/>
                    <Text>Can access, manage and edit licenses</Text>
                </Flex>
            </CardSection>
        </Card>
        <Spacing spacing={"xl"}/>
        <Flex style={{gap: "0.7rem"}} align={"center"}>
            <Button type={"submit"} onClick={() => {
                document.cookie = "codezero_callback=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                router.push("/")
            }} data-qa-selector={"auth-login-send"} color={isValidCallback ? "secondary" : "success"} w={"100%"} mb={1.3}>
                No, go back
            </Button>
            <Button type={"submit"} onClick={() => {
                if (callbackUrl && userSession) {
                    const targetURL = new URL(callbackUrl)
                    targetURL.searchParams.set('token', userSession?.token ?? "")
                    router.push(targetURL.toString())
                }
            }} data-qa-selector={"auth-login-send"} color={isValidCallback ? "success" : "error"} w={"100%"} mb={1.3}>
                {isValidCallback ? "Authorize" : "Authorize and ignore warning"}
            </Button>
        </Flex>

    </>

}