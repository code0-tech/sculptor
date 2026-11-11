import React from "react";
import {
    Button,
    ButtonGroup,
    Flex,
    Icon,
    Menu,
    MenuContent,
    MenuItem,
    MenuPortal,
    MenuSeparator,
    MenuTrigger,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger
} from "@code0-tech/pictor";
import {NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {SuggestionValue} from "@edition/function/components/suggestion/Suggestion.util";
import {
    DataTypeInputControlsComponent
} from "@edition/datatype/components/inputs/DataTypeInputControlsComponent";
import {
    formatCommands,
    insertCommandGroups,
    MarkdownCommand,
    tableCommandGroups
} from "@edition/datatype/utils/DataTypeMarkdown.commands.util";
import {TableCommand} from "@edition/datatype/utils/DataTypeMarkdown.applyTableCommand.util";
import {CellContext} from "@edition/datatype/utils/DataTypeMarkdown.cellContext.util";

export interface DataTypeMarkdownToolbarComponentProps {
    cellContext: CellContext
    suggestions?: SuggestionValue[]
    nodeId?: NodeFunction['id']
    parameterIndex?: number
    actions?: React.ReactElement
    onCommand: (command: MarkdownCommand) => void
    onTableCommand: (command: TableCommand) => void
    onSelect?: (value: SuggestionValue) => void
    onClear: () => void
}

export const DataTypeMarkdownToolbarComponent: React.FC<DataTypeMarkdownToolbarComponentProps> = (props) => {

    const {
        cellContext,
        suggestions,
        nodeId,
        parameterIndex,
        actions,
        onCommand,
        onTableCommand,
        onSelect,
        onClear
    } = props

    return <div className={"data-type-markdown-input__toolbar"}>
        <ButtonGroup color={"primary"}>
            {[...formatCommands.map(command => <Tooltip key={command.label}>
                <TooltipTrigger asChild>
                    <Button paddingSize={"xxs"}
                            variant={"none"}
                            aria-label={command.label}
                            onMouseDown={event => event.preventDefault()}
                            onClick={() => onCommand(command)}>
                        <Icon icon={command.icon} size={13}/>
                    </Button>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent color={"primary"} sideOffset={8} style={{zIndex: 51}}>
                        <Text size={"sm"}>{command.label}</Text>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>), <Menu key={"insert"} modal={false}>
                <MenuTrigger asChild>
                    <Button paddingSize={"xxs"}
                            variant={"none"}
                            aria-label={"Insert"}
                            onMouseDown={event => event.preventDefault()}>
                        <Flex align={"center"} style={{gap: "0.15rem"}}>
                            <Icon icon={"tabler:plus"} size={13}/>
                            <Icon icon={"tabler:chevron-down"} size={11}/>
                        </Flex>
                    </Button>
                </MenuTrigger>
                <MenuPortal>
                    <MenuContent color={"primary"}
                                 align={"start"}
                                 sideOffset={8}
                                 style={{zIndex: 51}}
                                 miw={"180px"}
                                 onKeyDown={event => event.stopPropagation()}
                                 onCloseAutoFocus={event => event.preventDefault()}>
                        {insertCommandGroups.map((group, groupIndex) => <React.Fragment key={groupIndex}>
                            {groupIndex > 0 && <MenuSeparator/>}
                            {group.map(command => <MenuItem key={command.label} onSelect={() => onCommand(command)}>
                                <Flex align={"center"} style={{gap: "0.5rem"}}>
                                    <Icon icon={command.icon} size={13}/>
                                    <Text size={"sm"}>{command.label}</Text>
                                </Flex>
                            </MenuItem>)}
                        </React.Fragment>)}
                    </MenuContent>
                </MenuPortal>
            </Menu>]}
        </ButtonGroup>
        {cellContext !== "none" && <Menu modal={false}>
            <MenuTrigger asChild>
                <Button variant={"none"}
                        paddingSize={"xxs"}
                        aria-label={"Table"}
                        onMouseDown={event => event.preventDefault()}>
                    <Flex align={"center"} style={{gap: "0.15rem"}}>
                        <Icon icon={"tabler:table"} size={13}/>
                        <Icon icon={"tabler:chevron-down"} size={11}/>
                    </Flex>
                </Button>
            </MenuTrigger>
            <MenuPortal>
                <MenuContent color={"primary"}
                             align={"start"}
                             sideOffset={8}
                             style={{zIndex: 51}}
                             miw={"180px"}
                             onKeyDown={event => event.stopPropagation()}
                             onCloseAutoFocus={event => event.preventDefault()}>
                    {tableCommandGroups.map((group, groupIndex) => <React.Fragment key={groupIndex}>
                        {groupIndex > 0 && <MenuSeparator/>}
                        {group
                            .filter(command => cellContext === "cell" || !command.bodyOnly)
                            .map(command => <MenuItem key={command.label}
                                                      onSelect={() => onTableCommand(command.command)}>
                                <Flex align={"center"} style={{gap: "0.5rem"}}>
                                    <Icon icon={command.icon} size={13}/>
                                    <Text size={"sm"}>{command.label}</Text>
                                </Flex>
                            </MenuItem>)}
                    </React.Fragment>)}
                </MenuContent>
            </MenuPortal>
        </Menu>}
        <Flex className={"data-type-markdown-input__actions"} align={"center"}>
            <DataTypeInputControlsComponent suggestions={suggestions}
                                            nodeId={nodeId}
                                            parameterIndex={parameterIndex}
                                            trailing={actions}
                                            onSelect={suggestion => suggestion ? onSelect?.(suggestion) : onClear()}/>
        </Flex>
    </div>
}
