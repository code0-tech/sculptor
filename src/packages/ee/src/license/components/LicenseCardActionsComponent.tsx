"use client"

import React from "react";
import {
    Button,
    ButtonGroup,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger
} from "@code0-tech/pictor";
import {License} from "@code0-tech/sagittarius-graphql-types";
import {IconExternalLink, IconTrash} from "@tabler/icons-react";
import {useLicenseUpgrade} from "@edition/license/hooks/License.upgrade.hook";

export interface LicenseCardActionsComponentProps {
    license?: License | null
    onRemove: () => void
}

export const LicenseCardActionsComponent: React.FC<LicenseCardActionsComponentProps> = (props) => {

    const {license, onRemove} = props

    const {pending, upgrade} = useLicenseUpgrade("license_card_manage", undefined, {
        target: "subscription",
        action: "license",
        license
    })

    return <ButtonGroup style={{flexShrink: 0}}>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant={"none"} paddingSize={"xxs"} disabled={pending} onClick={upgrade}>
                    <IconExternalLink size={13}/>
                </Button>
            </TooltipTrigger>
            <TooltipPortal>
                <TooltipContent sideOffset={8} color={"secondary"}>
                    <Text size={"sm"}>
                        Manage plan and billing in the subscription dashboard
                    </Text>
                </TooltipContent>
            </TooltipPortal>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button color={"error"} variant={"none"} paddingSize={"xxs"} onClick={onRemove}>
                    <IconTrash size={13}/>
                </Button>
            </TooltipTrigger>
            <TooltipPortal>
                <TooltipContent sideOffset={8} color={"secondary"}>
                    <Text size={"sm"}>
                        Remove this subscription from the instance
                    </Text>
                </TooltipContent>
            </TooltipPortal>
        </Tooltip>
    </ButtonGroup>
}
