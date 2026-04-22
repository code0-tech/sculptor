import React from "react";
import {Flow, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {
    Button,
    Menu, MenuContent, MenuItem, MenuLabel, MenuPortal, MenuSeparator,
    MenuTrigger,
    useService,
    useStore
} from "@code0-tech/pictor";
import {FileTabsService} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs.service";
import {FileTabsView} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs.view";
import {
    FileTabs,
    FileTabsContent,
    FileTabsList,
    FileTabsTrigger
} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {IconDotsVertical, IconPlus} from "@tabler/icons-react";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";

export interface FunctionFilesComponentProps {
    flowId: Flow['id']
    namespaceId: Namespace['id']
    projectId: NamespaceProject['id']
}

export const FunctionFilesComponent: React.FC<FunctionFilesComponentProps> = (props) => {

    const {flowId, namespaceId, projectId} = props

    const fileTabsService = useService(FileTabsService)
    const fileTabsStore = useStore(FileTabsService)
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = useStore(FlowTypeService)
    const id = React.useId()

    const flow = React.useMemo(() => flowService.getById(flowId, {namespaceId, projectId}), [flowStore])
    const flowType = React.useMemo(() => flowTypeService.getById(flow?.type?.id!!), [flowTypeStore, flow])
    const activeTabId = React.useMemo(() => {
        return fileTabsStore.find((t: any) => (t as any).active)?.id ?? fileTabsService.getActiveTab()?.id;
    }, [fileTabsStore, fileTabsService])

    const triggerTab = React.useMemo(() => {
        if (!flowType?.id) return undefined
        return fileTabsService.values().find((tab: FileTabsView) => tab.id === flowType.id)
    }, [fileTabsStore, flowType])

    const visibleTabs = React.useMemo(() => {
        return fileTabsService.values().filter((tab: FileTabsView) => tab.show)
    }, [fileTabsStore, triggerTab])

    const hiddenTabs = React.useMemo(() => {
        return fileTabsService.values().filter((tab: FileTabsView) => !tab.show && tab.id !== triggerTab?.id)
    }, [fileTabsStore, triggerTab])

    React.useEffect(() => {
        setTimeout(() => {
            const parent = document.querySelector("[data-id=" + '"' + id + '"' + "]") as HTMLDivElement
            const tabList = parent.querySelector(".file-tabs__list-content") as HTMLDivElement
            const trigger = tabList.querySelector("[data-value=" + '"' + fileTabsService.getActiveTab()?.id + '"' + "]") as HTMLDivElement

            if (tabList && trigger) {
                const offset = (trigger.offsetLeft + (trigger.offsetWidth / 2)) - (tabList.offsetWidth / 2)
                tabList.scrollLeft = 0 //reset to 0
                tabList.scrollBy({
                    left: offset,
                    behavior: 'smooth'
                });
            }
        }, 0)
    }, [activeTabId, id])

    return (
        <FileTabs
            data-id={id}
            value={activeTabId}
            onValueChange={(value) => {
                fileTabsService.activateTab(value);
            }}
        >
            <Layout showLayoutSplitter={false} layoutGap={"0"} topContent={<FileTabsList
                controls={
                    <ButtonGroup color={"primary"} p={0} style={{boxShadow: "none"}}>
                        <Menu>
                            <MenuTrigger asChild>
                                <Button variant="none" paddingSize={"xxs"} color="primary">
                                    <IconPlus size={12}/>
                                </Button>
                            </MenuTrigger>
                            <MenuPortal>
                                <MenuContent align="start" sideOffset={8}>
                                    <MenuLabel>Starting Node</MenuLabel>
                                    {triggerTab &&
                                        <MenuItem onSelect={() => fileTabsService.activateTab(triggerTab.id!!)}>
                                            {triggerTab.children}
                                        </MenuItem>}
                                    <MenuSeparator/>
                                    <MenuLabel>Opened Nodes</MenuLabel>
                                    {visibleTabs.map((tab: FileTabsView) => (
                                        <MenuItem key={`menu-${tab.id}`}
                                                  onSelect={() => {
                                                      fileTabsService.activateTab(tab.id!)
                                                  }}>
                                            {tab.children}
                                        </MenuItem>
                                    ))}
                                    <MenuSeparator/>
                                    <MenuLabel>Available Node</MenuLabel>
                                    {hiddenTabs.map((tab: FileTabsView) => (
                                        <MenuItem key={`menu-${tab.id}`}
                                                  onSelect={() => {
                                                      fileTabsService.activateTab(tab.id!)
                                                  }}>
                                            {tab.children}
                                        </MenuItem>
                                    ))}
                                </MenuContent>
                            </MenuPortal>
                        </Menu>

                        <Menu>
                            <MenuTrigger asChild>
                                <Button variant="none" paddingSize={"xxs"} color="primary">
                                    <IconDotsVertical size={12}/>
                                </Button>
                            </MenuTrigger>
                            <MenuPortal>
                                <MenuContent align="end" sideOffset={8}>
                                    <MenuItem onClick={() => fileTabsService.clearAll()}>Close all tabs</MenuItem>
                                    <MenuItem onClick={() => fileTabsService.clearWithoutActive()}>Close other
                                        tabs</MenuItem>
                                    <MenuSeparator/>
                                    <MenuItem onClick={() => fileTabsService.clearLeft()}>Close all tabs to
                                        left</MenuItem>
                                    <MenuItem onClick={() => fileTabsService.clearRight()}>Close all tabs to
                                        right</MenuItem>
                                </MenuContent>
                            </MenuPortal>
                        </Menu>
                    </ButtonGroup>
                }
            >
                {visibleTabs.map((tab: FileTabsView, _: number) => {
                    return tab.show && <FileTabsTrigger
                        key={`trigger-${tab.id}`}
                        closable={tab.closeable}
                        value={tab.id!}
                        onClose={() => {
                            fileTabsService.removeTabById(tab.id!!)
                        }}
                    >
                        {tab.children}
                    </FileTabsTrigger>
                })}
            </FileTabsList>}>
                <>
                    {fileTabsService.values().map((tab: FileTabsView) => (
                        <FileTabsContent data-qa-selector={"flow-builder-file-content"}
                                         display={tab.active ? "block" : "none"}
                                         key={`content-${tab.id}`}
                                         value={tab.id!}>
                            {tab.content}
                        </FileTabsContent>
                    ))}
                </>
            </Layout>
        </FileTabs>
    );

}