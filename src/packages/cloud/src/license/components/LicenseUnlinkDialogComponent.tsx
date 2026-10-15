"use client"

import React from "react";
import {
    Button,
    Card,
    Dialog,
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    Flex,
    getSize,
    Spacing,
    Text
} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {License} from "@code0-tech/sagittarius-graphql-types";
import {IconArrowDown, IconCreditCard, IconUnlink, IconX} from "@tabler/icons-react";
import {getLicenseName} from "@core/util/license";

export interface LicenseUnlinkDialogComponentProps {
    license?: License | null
    active: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onUnlink: () => void
}

export const LicenseUnlinkDialogComponent: React.FC<LicenseUnlinkDialogComponentProps> = (props) => {

    const {license, active, open, onOpenChange, onUnlink} = props

    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
            <DialogOverlay/>
            <DialogContent autoFocus w={"540px"}>
                <Card color={"primary"} mx={-0.9} my={-0.9} style={{borderRadius: "calc(0.9rem)"}}>
                    <Flex align={"center"} justify={"space-between"}>
                        <Text size={"lg"} hierarchy={"primary"} display={"block"}>
                            Unlink subscription
                        </Text>
                        <DialogClose asChild>
                            <Button variant={"none"} style={{padding: getSize("xs")}}>
                                <IconX size={16}/>
                            </Button>
                        </DialogClose>
                    </Flex>
                    <Spacing spacing={"xs"}/>
                    <Text size={"md"} hierarchy={"tertiary"}>
                        Unlinking changes this workspace only. Nothing is cancelled. The subscription stays in your
                        customer profile, so you can link it to this or any other workspace again at any time.
                    </Text>
                    <Spacing spacing={"xl"}/>
                    <Card style={{border: "1px solid rgba(191, 191, 191, 0.1)", boxShadow: "none"}}>
                        <CardSection border>
                            <Flex align={"center"} style={{gap: getSize("md")}}>
                                <IconUnlink style={{minWidth: "1rem"}} size={16}/>
                                <Text size={"md"} hierarchy={"tertiary"}>
                                    <Text size={"md"} hierarchy={"primary"} display={"inline"}
                                          style={{verticalAlign: "baseline"}}>
                                        {getLicenseName(license, "Your cloud subscription")}
                                    </Text> is no longer linked to this workspace
                                </Text>
                            </Flex>
                        </CardSection>
                        {active ? <CardSection border>
                            <Flex align={"center"} style={{gap: getSize("md")}}>
                                <IconArrowDown style={{minWidth: "1rem"}} size={16}/>
                                <Text size={"md"} hierarchy={"tertiary"}>
                                    This workspace falls back to the free plan right away and loses its cloud
                                    entitlements
                                </Text>
                            </Flex>
                        </CardSection> : null}
                        <CardSection border>
                            <Flex align={"center"} style={{gap: getSize("md")}}>
                                <IconCreditCard style={{minWidth: "1rem"}} size={16}/>
                                <Text size={"md"} hierarchy={"tertiary"}>
                                    The subscription stays active and is still billed until you cancel it in the
                                    subscription dashboard
                                </Text>
                            </Flex>
                        </CardSection>
                    </Card>
                    <Spacing spacing={"xl"}/>
                    <Flex align={"center"} style={{gap: getSize("md")}}>
                        <DialogClose asChild>
                            <Button color={"secondary"} w={"100%"} justify={"center"}>
                                No, go back
                            </Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button color={"error"} w={"100%"} justify={"center"} onClick={onUnlink}>
                                Yes, unlink
                            </Button>
                        </DialogClose>
                    </Flex>
                </Card>
            </DialogContent>
        </DialogPortal>
    </Dialog>
}
