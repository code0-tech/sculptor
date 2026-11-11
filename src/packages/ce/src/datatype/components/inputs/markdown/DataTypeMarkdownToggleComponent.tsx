import React from "react";
import {Button, Flex, Icon, IconString, Text} from "@code0-tech/pictor";

export interface DataTypeMarkdownToggleComponentProps {
    markdown: boolean
    plainLabel: string
    plainIcon: IconString
    markdownLabel: string
    onToggle: () => void
}

export const DataTypeMarkdownToggleComponent: React.FC<DataTypeMarkdownToggleComponentProps> = (props) => {

    const {markdown, plainLabel, plainIcon, markdownLabel, onToggle} = props

    return <Button variant={"none"} paddingSize={"xxs"} justify={"start"} onClick={onToggle}>
        <Flex align={"center"} style={{gap: "0.35rem"}}>
            <Icon icon={markdown ? plainIcon : "tabler:markdown"} size={13}/>
            <Text size={"sm"}>{markdown ? plainLabel : markdownLabel}</Text>
        </Flex>
    </Button>
}
