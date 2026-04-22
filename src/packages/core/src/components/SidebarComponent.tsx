import React from "react";
import {Button, Color, ComponentProps, Flex, Text} from "@code0-tech/pictor";
import {PanelProps, usePanelRef} from "react-resizable-panels";
import {ResizablePanel} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {IconLayoutSidebar} from "@tabler/icons-react";


type ResizablePanelProps = ComponentProps & PanelProps & { color?: Color }

export interface SidebarComponentProps extends ResizablePanelProps {
    title?: string
    description?: string
}

export const SidebarComponent: React.FC<SidebarComponentProps> = (props) => {

    const {children, title, description, ...rest} = props
    const panelRef = usePanelRef()

    return <ResizablePanel defaultSize={"20%"}
                           collapsedSize={"0%"}
                           collapsible
                           minSize={"10%"}
                           style={{textWrap: "nowrap"}}
                           panelRef={panelRef}
                           {...rest}
    >
        <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
            <Flex style={{gap: "0.7rem"}} align={"center"} justify={"space-between"}>
                {title && <Text size={"md"} hierarchy={"secondary"}>{title}</Text>}

                <Button variant={"none"} paddingSize={"xxs"} onClick={() => panelRef.current?.collapse()}>
                    <IconLayoutSidebar size={16}/>
                </Button>
            </Flex>
            {description && <Text size={"sm"} hierarchy={"tertiary"} style={{textWrap: "wrap"}}>
                {description}
            </Text>}
            {children}
        </Flex>
    </ResizablePanel>

}