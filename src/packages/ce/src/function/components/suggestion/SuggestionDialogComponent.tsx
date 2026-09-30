import React from "react";
import {Suggestion, useMappedSuggestions} from "@edition/function/components/suggestion/Suggestion.util";
import {
    SuggestionVariantDialogComponent
} from "@edition/function/components/suggestion/SuggestionVariantDialogComponent";
import {
    Badge,
    Button,
    Card,
    CommandDialog,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
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
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";
import {Tab, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {icon, IconString} from "@core/util/icons";
import {
    IconArrowsUpDown,
    IconChevronLeft,
    IconChevronRight,
    IconCornerDownLeft,
    IconPlus,
    IconSearch
} from "@tabler/icons-react";
import {Flow, LiteralValue, NodeFunction, ReferenceValue, SubFlowValue} from "@code0-tech/sagittarius-graphql-types";

export interface SuggestionDialogComponentProps {
    suggestions?: (NodeFunction | SubFlowValue | ReferenceValue | LiteralValue)[]
    flowId?: Flow['id']
    nodeId?: NodeFunction['id']
    parameterIndex?: number
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onSuggestionSelect?: (suggestion: (NodeFunction | SubFlowValue | ReferenceValue | LiteralValue)) => void
    onCustomLogicGroupSelect?: () => void
    onBackSelect?: () => void
}

export const SuggestionDialogComponent: React.FC<SuggestionDialogComponentProps> = (props) => {

    const {open, onOpenChange, onSuggestionSelect, onCustomLogicGroupSelect, onBackSelect} = props

    const [suggestionDialogOpen, setSuggestionDialogOpen] = React.useState(open)
    const [variantSuggestion, setVariantSuggestion] = React.useState<Suggestion | null>(null)

    React.useEffect(() => {
        setSuggestionDialogOpen(open)
    }, [open])

    const suggestions = useMappedSuggestions(props.suggestions || [])
    const [currentTab, setCurrentTab] = React.useState<string>("group-0")
    const [holdCurrentTab, setHoldCurrentTab] = React.useState<string>("group-0")

    return <>
        <SuggestionVariantDialogComponent suggestion={variantSuggestion}
                                         flowId={props.flowId}
                                         nodeId={props.nodeId}
                                         parameterIndex={props.parameterIndex}
                                         open={!!variantSuggestion}
                                         onOpenChange={open => {
                                             if (!open) setVariantSuggestion(null)
                                         }}
                                         onVariantSelect={value => {
                                             setVariantSuggestion(null)
                                             onSuggestionSelect?.(value)
                                         }}
                                         onBackSelect={() => {
                                             setVariantSuggestion(null)
                                             props.onOpenChange?.(true)
                                         }}/>
        {/* @ts-ignore */}
        <CommandDialog p={"0"} open={suggestionDialogOpen}
                       onOpenChange={(open?: boolean) => onOpenChange?.(open ?? false)}
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
                    }} left={<IconSearch size={13}/>} placeholder="Search for nodes, variables and more..."/>
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
                                <ScrollAreaViewport style={{minWidth: "auto"}}>
                                    <CommandList w={"100%"}>
                                        <CommandEmpty>No results found.</CommandEmpty>
                                        {onBackSelect ? <>
                                            <CommandItem keywords={["back", "previous suggestions"]}
                                                         display={"block"}
                                                         my={0.7}
                                                         style={{boxSizing: "border-box", overflow: "hidden"}}
                                                         value={"back"} onSelect={() => {
                                                onBackSelect()
                                                props.onOpenChange?.(false)
                                            }}>
                                                <Flex style={{gap: "0.35rem"}} align={"center"}>
                                                    <IconChevronLeft size={16}/>
                                                    <Text size={"sm"}>Back</Text>
                                                </Flex>
                                                <Spacing spacing={"xxs"}/>
                                                <Text hierarchy={"tertiary"} size={"sm"}>
                                                    Return to the suggestions for this parameter.
                                                </Text>
                                            </CommandItem>
                                            <CommandSeparator/>
                                        </> : null}
                                        {onCustomLogicGroupSelect ? <>
                                            <CommandItem keywords={["custom logic group", "starting node"]}
                                                         display={"block"}
                                                         my={0.7}
                                                         style={{boxSizing: "border-box", overflow: "hidden"}}
                                                         value={"custom-logic-group"} onSelect={() => {
                                                onCustomLogicGroupSelect()
                                                props.onOpenChange?.(false)
                                            }}>
                                                <Flex style={{gap: "0.35rem"}} align={"center"}>
                                                    <IconPlus size={16}/>
                                                    <Text size={"sm"}>Add custom logic group</Text>
                                                </Flex>
                                                <Spacing spacing={"xxs"}/>
                                                <Text hierarchy={"tertiary"} size={"sm"}>
                                                    Build this sub flow yourself by choosing the function it starts with.
                                                </Text>
                                            </CommandItem>
                                            <CommandSeparator/>
                                        </> : null}
                                        {suggestions.map((group, index) => {
                                            return currentTab === `group-${index}` && <>
                                                {group.suggestions.map((suggestion, suggestionIndex) => {

                                                    const DisplayIcon = icon(suggestion.icon as IconString)
                                                    const directValue = suggestion.variants.find(variant => variant.__typename === "SubFlowValue")
                                                    const resultValue = suggestion.variants.find(variant => variant.__typename === "NodeFunction")

                                                    return <React.Fragment key={suggestionIndex}>
                                                        <CommandItem keywords={[...(suggestion?.aliases ?? []), suggestion.displayMessage].filter((keyword): keyword is string => typeof keyword === "string")}
                                                                     display={"block"}
                                                                     my={0.7}
                                                                     style={{boxSizing: "border-box", overflow: "hidden"}}
                                                                     value={suggestionIndex.toString()} onSelect={() => {
                                                            if (directValue && resultValue) {
                                                                setVariantSuggestion(suggestion)
                                                                props.onOpenChange?.(false)
                                                                return
                                                            }
                                                            onSuggestionSelect?.(suggestion.value)
                                                            props.onOpenChange?.(false)
                                                        }}>
                                                            <Flex style={{gap: "0.35rem"}} align={"center"}>
                                                                <DisplayIcon color={hashToColor(`group-${index}`)}
                                                                             size={16}/>
                                                                <Text size={"sm"}>{suggestion.displayMessage}</Text>
                                                                {directValue && resultValue ?
                                                                    <IconChevronRight size={13}/> : null}
                                                            </Flex>
                                                            <Spacing spacing={"xxs"}/>
                                                            <Text hierarchy={"tertiary"}
                                                                  size={"sm"}>{suggestion.description}</Text>
                                                        </CommandItem>
                                                        <CommandSeparator/>
                                                    </React.Fragment>
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
    </>

}