import React from "react";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";
import {
    Badge,
    Button,
    Card,
    CommandDialog,
    CommandEmpty,
    CommandInput,
    CommandItem, CommandList,
    CommandSeparator,
    Flex,
    hashToColor,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Spacing,
    Text
} from "@code0-tech/pictor";
import {IconArrowsUpDown, IconCornerDownLeft, IconSearch} from "@tabler/icons-react";
import {Tab, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {usePuck} from "@edition/ui/components/UIEditorComponent";
import {icon, IconString} from "@core/util/icons";

export interface UIEditorAddDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export const UIEditorAddDialogComponent: React.FC<UIEditorAddDialogComponentProps> = (props) => {

    const {open, onOpenChange} = props

    const [currentTab, setCurrentTab] = React.useState<string>("group-0")
    const [holdCurrentTab, setHoldCurrentTab] = React.useState<string>("group-0")
    const [suggestionDialogOpen, setSuggestionDialogOpen] = React.useState(open)

    React.useEffect(
        () => setSuggestionDialogOpen(open),
        [open]
    )

    const {ui} = usePuck((s) => s.appState)
    const dispatch = usePuck((s) => s.dispatch)

    const modules: ({
        title: string,
        icon: string,
        components: ({
            type: string,
            title: string,
            description: string,
            icon: string,
        })[]
    })[] = Object.entries(ui.componentList).map(([type, module]) => {
        return {
            title: module.title ?? "",
            icon: (module as any).visible.icon ?? "icon",
            components: module.components?.map((component: any) => {
                return {
                    type: component.type ?? "",
                    title: component.title ?? "",
                    description: component.description ?? "",
                    icon: component.icon ?? "",
                }
            }) ?? []
        }
    })

    console.log(modules, ui.componentList)

    //@ts-ignore
    return <CommandDialog p={"0"} open={suggestionDialogOpen} onOpenChange={(open) => onOpenChange?.(open)}
                          contentProps={{h: "75vh", w: "50%"}}>
        <Layout layoutGap={0} showLayoutSplitter={false}
                bottomContent={<div style={{padding: "0.7rem"}}>
                    <Flex style={{gap: "0.7rem"}} justify={"space-between"} align={"center"}>
                        <Flex style={{gap: "0.35rem"}} align={"center"}>
                            <Badge><IconArrowsUpDown size={13}/></Badge>
                            <Text>to navigate and</Text>
                            <Badge><IconCornerDownLeft size={13}/></Badge>
                            <Text>to select a suggestion</Text>
                        </Flex>
                        <Flex style={{gap: "0.35rem"}} align={"center"}>
                            <Badge>ESC</Badge>
                            <Text>to close this dialog</Text>
                        </Flex>
                    </Flex>
                </div>}
                topContent={<div style={{padding: "0.35rem 0.7rem"}}><CommandInput
                    onChange={(event) => {
                        if (event.target.value == "") {
                            setCurrentTab(holdCurrentTab)
                        } else {
                            if (currentTab != "group-0") setHoldCurrentTab(currentTab)
                            if (currentTab != "group-0") setCurrentTab("group-0")
                        }
                    }} left={<IconSearch size={13}/>}
                    placeholder="Search for nodes, variables and more..."/>
                </div>}>
            <Card m={0.1} h={"100%"} paddingSize={"md"}>
                <Tab h={"100%"} orientation={"vertical"} value={currentTab} key={"d"}
                     onValueChange={(value) => {
                         setCurrentTab(value)
                         setHoldCurrentTab(value)
                     }}>
                    <Layout style={{overflow: "hidden"}}
                            layoutGap={"1rem"}
                            leftContent={<ScrollArea h={"100%"} type={"always"} miw={"150px"}>
                                <ScrollAreaViewport h={"100%"} w={"100%"}>
                                    <TabList>
                                        {modules.map((module, index) => {

                                            const DisplayIcon = icon(module.icon as IconString)

                                            return <TabTrigger key={`group-${index}`} value={`group-${index}`} asChild>
                                                <Button w={"100%"} justify={"start"}
                                                        paddingSize={"xxs"}
                                                        variant={"none"}>
                                                    <DisplayIcon color={hashToColor(`group-${index}`)} size={16}/>
                                                    <Text size={"sm"}>{module.title}</Text>
                                                </Button>
                                            </TabTrigger>
                                        })}
                                    </TabList>
                                </ScrollAreaViewport>
                                <ScrollAreaScrollbar orientation={"vertical"}>
                                    <ScrollAreaThumb/>
                                </ScrollAreaScrollbar>
                            </ScrollArea>}>
                        <ScrollArea h={"100%"} w={"100%"} type={"always"}>
                            <ScrollAreaViewport style={{minWidth: "auto"}}>
                                <CommandList w={"100%"}>
                                    <CommandEmpty>No results found.</CommandEmpty>
                                    {modules.map((module, index) => {
                                        return currentTab === `group-${index}` && <>
                                            {module.components.map((component) => {

                                                const DisplayIcon = icon(component.icon as IconString)

                                                return <>
                                                    <CommandItem display={"block"}
                                                                 my={0.7}
                                                                 style={{boxSizing: "border-box", overflow: "hidden"}}
                                                                 value={component.title}
                                                                 onSelect={() => {
                                                                     const id = `${component.type}-${Math.random().toString(36).substr(2, 9)}`;
                                                                     const newComponent = {
                                                                         type: component.type,
                                                                         props: { id },
                                                                     };

                                                                     dispatch({
                                                                         type: "set",
                                                                         state: (prev) => ({
                                                                             ...prev,
                                                                             data: {
                                                                                 ...prev.data,
                                                                                 content: [newComponent, ...prev.data.content]
                                                                             }
                                                                         })
                                                                     });
                                                                     onOpenChange?.(false);
                                                                 }}>
                                                        <Flex style={{gap: "0.35rem"}} align={"center"}>
                                                            <DisplayIcon color={hashToColor(`group-${index}`)}
                                                                         size={16}/>
                                                            <Text size={"sm"}>{component.title}</Text>
                                                        </Flex>
                                                        <Spacing spacing={"xxs"}/>
                                                        <Text hierarchy={"tertiary"}
                                                              size={"sm"}>{component.description}</Text>
                                                    </CommandItem>
                                                    <CommandSeparator/>
                                                </>
                                            })}
                                        </>
                                    })}
                                </CommandList>
                            </ScrollAreaViewport>
                            <ScrollAreaScrollbar orientation={"vertical"}>
                                <ScrollAreaThumb/>
                            </ScrollAreaScrollbar>
                        </ScrollArea>
                    </Layout>
                </Tab>
            </Card>
        </Layout>
    </CommandDialog>

}