"use client"

import React from "react";
import {
    Button,
    getSize,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger,
    useService,
    useStore
} from "@code0-tech/pictor";
import {IconRocket} from "@tabler/icons-react";
import {differenceInDays} from "date-fns";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {useOnboardingStore} from "@edition/onboarding/hooks/Onboarding.state.hook";

export const OnboardingButtonView: React.FC = () => {

    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const currentSession = useUserSession()
    const running = useOnboardingStore(state => state.running)
    const completed = useOnboardingStore(state => state.completed)
    const start = useOnboardingStore(state => state.start)

    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, currentSession]
    )

    const isNewAccount = React.useMemo(
        () => !!currentUser?.createdAt && differenceInDays(new Date(), new Date(currentUser.createdAt)) <= 7,
        [currentUser]
    )

    if (running || completed || !isNewAccount) return null

    return <Tooltip>
        <TooltipTrigger asChild>
            <Button data-qa-selector={"dashboard-onboarding"} variant={"none"} style={{padding: getSize("xs")}}
                    onClick={start}>
                <IconRocket color={"#fff"} size={16}/>
            </Button>
        </TooltipTrigger>
        <TooltipPortal>
            <TooltipContent color={"primary"} side={"left"} sideOffset={8}>
                <Text>
                    Build your first automation
                </Text>
            </TooltipContent>
        </TooltipPortal>
    </Tooltip>
}
