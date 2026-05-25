import { Button, ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@code0-tech/pictor"
import { Render } from "@puckeditor/core"
import { Panel } from "@xyflow/react"
import { useParams, useRouter } from "next/navigation"
import { editorConfig } from "../components/UIEditorComponent"
import { UIEditorSidebarView } from "../views/UIEditorSidebarView"

const renderTestData = {
    root: {
        props: {},
        render: ({children}: { children: React.ReactNode }) => {
            return (
                <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
                    {children}
                </div>
            )
        },
    },
    content: [
        {
            type: "Container",
            props: {
                id: "container-root",
                children: [
                    {
                        type: "Heading",
                        props: { id: "heading-1", content: "UI Preview", size: "h2" },
                    },
                    {
                        type: "Text",
                        props: {
                            id: "text-1",
                            content: "This is demo content for the Render preview.",
                            hierarchy: "secondary",
                        },
                    },
                    {
                        type: "Row",
                        props: {
                            id: "row-1",
                            children: [
                                {
                                    type: "Column",
                                    props: {
                                        id: "column-1",
                                        column_size: "50%",
                                        children: [
                                            {
                                                type: "Card",
                                                props: {
                                                    id: "card-1",
                                                    color: "primary",
                                                    children: [
                                                        {
                                                            type: "Text",
                                                            props: {
                                                                id: "card-1-text-1",
                                                                content: "Card A",
                                                                hierarchy: "primary",
                                                            },
                                                        },
                                                        {
                                                            type: "Link",
                                                            props: {
                                                                id: "card-1-link-1",
                                                                content: "Example link",
                                                                link: "https://example.com",
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    type: "Column",
                                    props: {
                                        id: "column-2",
                                        column_size: "50%",
                                        children: [
                                            {
                                                type: "Card",
                                                props: {
                                                    id: "card-2",
                                                    color: "secondary",
                                                    children: [
                                                        {
                                                            type: "Text",
                                                            props: {
                                                                id: "card-2-text-1",
                                                                content: "Card B",
                                                                hierarchy: "primary",
                                                            },
                                                        },
                                                        {
                                                            type: "Divider",
                                                            props: {
                                                                id: "card-2-divider-1",
                                                                orientation: "horizontal",
                                                            },
                                                        },
                                                        {
                                                            type: "Text",
                                                            props: {
                                                                id: "card-2-text-2",
                                                                content: "A short description inside the card.",
                                                                hierarchy: "secondary",
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        type: "Table",
                        props: {
                            id: "table-1",
                            columns: ["name", "createdAt"],
                            rows: [
                                { id: "table-row-1", name: "Alex", createdAt: "2025-01-14" },
                                { id: "table-row-2", name: "Jamie", createdAt: "2025-02-03" },
                            ],
                            showFilter: true,
                            filter: {},
                        },
                    },
                    {
                        type: "Graph",
                        props: {
                            id: "graph-1",
                            module: "users",
                            xAxis: "createdAt",
                            yAxis: "count",
                        },
                    },
                ],
            },
        },
    ],
}

export const UIEditorPage: React.FC = () => {
    const router = useRouter()
    const params = useParams()

    const namespaceId = params.namespaceId as any
    const projectId = params.projectId as any

    return (
        <ResizablePanelGroup>
            <UIEditorSidebarView/>
            <ResizableHandle/>
            <ResizablePanel id={"2"} color="primary" style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem", padding: "1rem"}}>
                <Render config={editorConfig as any} data={renderTestData} />
                <Panel position={"bottom-center"}>
                    <Button
                        variant={"filled"}
                        color={"secondary"}
                        paddingSize={"xxs"}
                        onClick={() => router.push(`/namespace/${namespaceId}/project/${projectId}/ui/edit`)}
                    >
                        Edit Page
                    </Button>
                </Panel>
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}
