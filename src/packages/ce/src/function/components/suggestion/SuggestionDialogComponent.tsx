import React from "react";
import {FunctionSuggestion} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {getMappedSuggestions, Suggestion} from "@edition/function/components/suggestion/Suggestion.util";
import {
    Badge,
    Button,
    Card,
    CommandDialog,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
    Flex,
    hashToColor,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Text
} from "@code0-tech/pictor";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";
import {Tab, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {icon, IconString} from "@core/util/icons";
import {IconArrowsUpDown, IconCornerDownLeft, IconSearch} from "@tabler/icons-react";

export interface SuggestionDialogComponentProps {
    suggestions?: FunctionSuggestion[]
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onSuggestionSelect?: (suggestion: Suggestion) => void
}

export const SuggestionDialogComponent: React.FC<SuggestionDialogComponentProps> = (props) => {

    const {open, onOpenChange, onSuggestionSelect} = props

    const [suggestionDialogOpen, setSuggestionDialogOpen] = React.useState(open)

    React.useEffect(() => {
        setSuggestionDialogOpen(open)
    }, [open])

    const suggestions = getMappedSuggestions(props.suggestions || [])
    const [currentTab, setCurrentTab] = React.useState<string>("group-0")
    const [holdCurrentTab, setHoldCurrentTab] = React.useState<string>("group-0")

    // @ts-ignore
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
                topContent={<div style={{padding: "0.35rem 0.7rem"}}><CommandInput onChange={(event) => {
                    if (event.target.value == "") {
                        setCurrentTab(holdCurrentTab)
                    } else {
                        if (currentTab != "group-0") setHoldCurrentTab(currentTab)
                        if (currentTab != "group-0") setCurrentTab("group-0")
                    }
                }} left={<IconSearch size={13}/>}
                                                                                   placeholder="Type a command or search..."/>
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
                                        {suggestions.map((group, index) => {

                                            const DisplayIcon = icon(group.icon as IconString)

                                            return <TabTrigger value={`group-${index}`} asChild>
                                                <Button w={"100%"} justify={"start"} paddingSize={"xxs"}
                                                        variant={"none"}>
                                                    <DisplayIcon color={hashToColor(`group-${index}`)} size={16}/>
                                                    <Text size={"sm"}>{group.displayMessage}</Text>
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
                            <ScrollAreaViewport>
                                <CommandList w={"100%"}>
                                    <CommandEmpty>No results found.</CommandEmpty>
                                    {suggestions.map((group, index) => {
                                        return currentTab === `group-${index}` && <>
                                            {group.suggestions.map((suggestion) => {

                                                const DisplayIcon = icon(suggestion.icon as IconString)

                                                return <CommandItem keywords={suggestion.aliases} value={suggestion.displayMessage} onSelect={() => {
                                                    onSuggestionSelect?.(suggestion)
                                                    props.onOpenChange?.(false)

                                                }}>
                                                    <DisplayIcon color={"#70ffb2"} size={16}/>
                                                    <Text size={"sm"}>{suggestion.displayMessage}</Text>
                                                </CommandItem>
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