"use client"

import React from "react";
import {
    Badge,
    Button,
    ButtonGroup,
    Card,
    Flex,
    getSize,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger
} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import Link from "next/link";
import {License} from "@code0-tech/sagittarius-graphql-types";
import {IconPencil, IconTrash} from "@tabler/icons-react";
import {getLicenseName, isLicenseActive} from "@core/util/license";
import {LicenseDetailsComponent} from "@ee-internal/license/components/LicenseDetailsComponent";
import {
    LicenseEntitlementsSectionComponent
} from "@ee-internal/license/components/LicenseEntitlementsSectionComponent";

export interface LicenseCardComponentProps {
    license?: License | null
    fallbackName: string
    onRemove: () => void
}

export const LicenseCardComponent: React.FC<LicenseCardComponentProps> = (props) => {

    const {license, fallbackName, onRemove} = props

    return <Card color={"secondary"} variant={"outlined"}
                 style={{border: "1px solid rgba(191, 191, 191, 0.1)", boxShadow: "none"}}>
        <CardSection border>
            <Flex justify={"space-between"} align={"center"} style={{gap: getSize("md")}}>
                <Flex style={{gap: getSize("xxxs"), flexDirection: "column"}}>
                    <Flex align={"center"} style={{gap: getSize("xs")}}>
                        <Text size={"md"} hierarchy={"primary"}>
                            {getLicenseName(license, fallbackName)}
                        </Text>
                        {isLicenseActive(license) ? <Badge color={"success"}>
                            <Text c={"inherit"}>
                                Active
                            </Text>
                        </Badge> : <Badge>
                            <Text>
                                Not active
                            </Text>
                        </Badge>}
                    </Flex>
                    <LicenseDetailsComponent license={license}/>
                </Flex>
                <ButtonGroup style={{flexShrink: 0}}>
                    <Link target={"_blank"} href={"https://codezero.build/en/subscription"}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant={"none"} paddingSize={"xxs"}>
                                    <IconPencil size={13}/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipPortal>
                                <TooltipContent sideOffset={8} color={"secondary"}>
                                    <Text size={"sm"}>
                                        Edit this subscription
                                    </Text>
                                </TooltipContent>
                            </TooltipPortal>
                        </Tooltip>
                    </Link>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button color={"error"} variant={"none"} paddingSize={"xxs"} onClick={onRemove}>
                                <IconTrash size={13}/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipPortal>
                            <TooltipContent sideOffset={8} color={"secondary"}>
                                <Text size={"sm"}>
                                    Remove this license
                                </Text>
                            </TooltipContent>
                        </TooltipPortal>
                    </Tooltip>
                </ButtonGroup>
            </Flex>
        </CardSection>
        <LicenseEntitlementsSectionComponent license={license}/>
    </Card>
}
