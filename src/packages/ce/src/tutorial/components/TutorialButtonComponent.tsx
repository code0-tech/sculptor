"use client"

import React from "react";
import {Button, getSize, Text, Tooltip, TooltipContent, TooltipPortal, TooltipTrigger} from "@code0-tech/pictor";
import {IconHelp} from "@tabler/icons-react";
import {useTutorial} from "@edition/tutorial/hooks/Tutorial.tour.hook";
import "driver.js/dist/driver.css";
import "./TutorialButtonComponent.style.scss";

export const TutorialButtonComponent: React.FC = () => {

    const {level, hasSteps, start} = useTutorial()

    const label = React.useMemo(() => {
        if (level === "application") return "Explore the overview"
        if (level === "namespace") return "Explore this workspace"
        if (level === "project") return "Explore this project"
        return "Explore the flow builder"
    }, [level])

    if (!hasSteps) return null

    return <div style={{
        position: "fixed",
        right: getSize("md"),
        bottom: getSize("md"),
        zIndex: 10
    }}>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button data-qa-selector={"dashboard-tutorial"} style={{padding: getSize("xs")}}
                        color={"secondary"}
                        onClick={start}>
                    <IconHelp size={16}/>
                </Button>
            </TooltipTrigger>
            <TooltipPortal>
                <TooltipContent color={"primary"} side={"left"} sideOffset={8}>
                    <Text>
                        {label}
                    </Text>
                </TooltipContent>
            </TooltipPortal>
        </Tooltip>
    </div>
}
