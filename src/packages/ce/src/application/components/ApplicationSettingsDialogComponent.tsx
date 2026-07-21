"use client"

import React from "react";
import {
    Badge,
    Button,
    Card,
    Dialog,
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Spacing,
    Text
} from "@code0-tech/pictor";
import {Tab, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";
import {motion} from "framer-motion";
import {IconServer, IconSettings2, IconShieldLock, IconUsers} from "@tabler/icons-react";
import {ApplicationUsersView} from "@edition/application/views/ApplicationUsersView";
import {ApplicationServersView} from "@edition/application/views/ApplicationServersView";
import {ApplicationGeneralSettingsView} from "@edition/application/views/ApplicationGeneralSettingsView";
import {ApplicationRestrictionsView} from "@edition/application/views/ApplicationRestrictionsView";
import {ApplicationLicensesView} from "@edition/application/views/ApplicationLicensesView";
import {ApplicationLicensesTabTriggerView} from "@edition/application/views/ApplicationLicensesTabTriggerView";

export interface ApplicationSettingsDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export const ApplicationSettingsDialogComponent: React.FC<ApplicationSettingsDialogComponentProps> = (props) => {

    const {open, onOpenChange} = props

    return <Dialog open={open} onOpenChange={(open) => onOpenChange?.(open)}>
        <DialogPortal>
            <DialogOverlay/>
            <DialogContent
                style={{padding: "2px"}}
                w={"75%"} h={"75%"}>
                <Tab orientation={"vertical"} defaultValue={"users"} w={"100%"} h={"100%"}>
                    <Layout layoutGap={0} showLayoutSplitter={false}
                            leftContent={
                                <motion.div layout
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 20,
                                                mass: 0.8
                                            }}
                                            initial={{
                                                width: "200px",
                                            }}
                                            whileInView={{
                                                width: "200px",
                                            }}
                                            whileHover={{
                                                width: "250px",
                                            }}
                                            style={{
                                                padding: "0.7rem",
                                                paddingTop: "1rem",
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column"
                                            }}
                                >
                                    <Text size={"lg"} hierarchy={"secondary"}>
                                        Application settings
                                    </Text>
                                    <Spacing spacing={"xl"}/>
                                    <Text size={"sm"} maw={"150px"} hierarchy={"tertiary"} style={{textWrap: "wrap"}}>
                                        General settings and restrictions for your Sculptor application. These settings
                                        affect all users and organizations.
                                    </Text>
                                    <Spacing spacing={"xl"}/>
                                    <TabList>
                                        <TabTrigger value={"users"} w={"100%"} asChild>
                                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                                <IconUsers size={13}/>
                                                <Text size={"md"}>Users</Text>
                                            </Button>
                                        </TabTrigger>
                                        <TabTrigger value={"servers"} w={"100%"} asChild>
                                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                                <IconServer size={13}/>
                                                <Text size={"md"}>Servers</Text>
                                            </Button>
                                        </TabTrigger>
                                        <TabTrigger value={"general"} w={"100%"} asChild>
                                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                                <IconSettings2 size={13}/>
                                                <Text size={"md"}>Settings</Text>
                                            </Button>
                                        </TabTrigger>
                                        <TabTrigger value={"restrictions"} w={"100%"} asChild>
                                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                                <IconShieldLock size={13}/>
                                                <Text size={"md"}>Restrictions</Text>
                                            </Button>
                                        </TabTrigger>
                                        <ApplicationLicensesTabTriggerView/>
                                    </TabList>
                                    <DialogClose asChild style={{marginTop: "auto"}}>
                                        <Button paddingSize={"xxs"} w={"100%"} variant={"none"}
                                                justify={"space-between"}>
                                            <Text size={"md"}>Close</Text>
                                            <Badge>
                                                ESC
                                            </Badge>
                                        </Button>
                                    </DialogClose>
                                </motion.div>
                            }>
                        <Card color={"primary"} paddingSize={"md"} w={"100%"}
                              style={{height: "100%", display: "flex", flexDirection: "column", overflow: "hidden"}}>
                            <ScrollArea w={"100%"} h={"100%"} type={"scroll"} style={{flex: 1, minHeight: 0}}>
                                <ScrollAreaViewport>
                                    <ApplicationUsersView/>
                                    <ApplicationServersView/>
                                    <ApplicationGeneralSettingsView/>
                                    <ApplicationRestrictionsView/>
                                    <ApplicationLicensesView/>
                                </ScrollAreaViewport>
                                <ScrollAreaScrollbar orientation={"vertical"}>
                                    <ScrollAreaThumb/>
                                </ScrollAreaScrollbar>
                            </ScrollArea>
                        </Card>
                    </Layout>
                </Tab>
            </DialogContent>
        </DialogPortal>
    </Dialog>
}
