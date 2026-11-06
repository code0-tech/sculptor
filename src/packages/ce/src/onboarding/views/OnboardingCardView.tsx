"use client"

import React from "react";
import {Button, Card, Flex, getSize, ProgressLinear, Spacing, Text} from "@code0-tech/pictor";
import {IconRocket} from "@tabler/icons-react";
import {useOnboarding} from "@edition/onboarding/hooks/Onboarding.tour.hook";
import "driver.js/dist/driver.css";
import "./OnboardingCardView.style.scss";
import {BotAvatar} from "bot-avatars";

export const OnboardingCardView: React.FC = () => {

    const {running, step, index, total, finish} = useOnboarding()
    const [hopping, setHopping] = React.useState(false)

    React.useEffect(() => {
        setHopping(true)
        const id = window.setTimeout(() => setHopping(false), 2000)
        return () => window.clearTimeout(id)
    }, [index])

    if (!running) return null

    return <div className={"onboarding-card"} style={{
        position: "fixed",
        right: getSize("md"),
        bottom: "3.5rem",
        width: "22rem",
        maxWidth: "calc(100vw - 2rem)",
        zIndex: 1000000001
    }}>
        <div style={{
            position: "absolute",
            top: 0,
            left: "2.5rem",
            lineHeight: 0,
            transform: "translate(-50%, -75%)"
        }}>
            <BotAvatar type={"flower"}
                       shading={"fabric"}
                       color={"#ffffff"}
                       size={44}
                       state={step.key === "done" ? "sleeping" : hopping ? "working" : "default"}/>
        </div>
        <Card color={"secondary"} paddingSize={"lg"}>
            <Flex align={"center"} justify={"space-between"} style={{gap: getSize("sm")}}>
                <Flex align={"center"} style={{gap: getSize("xxs")}}>
                    <IconRocket size={13}/>
                    <Text size={"sm"} hierarchy={"tertiary"}>Getting started</Text>
                </Flex>
                <Text size={"sm"} hierarchy={"tertiary"}>
                    {index + 1} of {total}
                </Text>
            </Flex>
            <Spacing spacing={"sm"}/>
            <ProgressLinear w={"100%"} h={"5px"} max={total} value={index + 1}/>
            <Spacing spacing={"md"}/>
            <Text size={"md"} hierarchy={"primary"} display={"block"}>
                {step.title}
            </Text>
            <Spacing spacing={"xxs"}/>
            <Text size={"sm"} hierarchy={"tertiary"} display={"block"}>
                {step.description}
            </Text>
            <Spacing spacing={"md"}/>
            <Button data-qa-selector={"dashboard-onboarding-finish"}
                    paddingSize={"xxs"}
                    w={"100%"}
                    color={"tertiary"}
                    onClick={finish}>
                <Text size={"sm"} hierarchy={"tertiary"}>
                    {step.key === "done" ? "Finish" : "Skip for now"}
                </Text>
            </Button>
        </Card>
    </div>
}
