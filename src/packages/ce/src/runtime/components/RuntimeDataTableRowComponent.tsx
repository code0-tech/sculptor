import React from "react";
import {Runtime} from "@code0-tech/sagittarius-graphql-types";
import {Badge, DataTableColumn, Flex, Text, useService, useStore} from "@code0-tech/pictor";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {formatDistanceToNow} from "date-fns";

export interface ProjectDataTableRowComponentProps {
    runtimeId: Runtime['id']
    minimized?: boolean
}

export const RuntimeDataTableRowComponent: React.FC<ProjectDataTableRowComponentProps> = (props) => {

    const {runtimeId, minimized} = props

    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)

    const runtime = React.useMemo(
        () => runtimeService.getById(runtimeId),
        [runtimeStore, runtimeId]
    )

    return <>
        <DataTableColumn>
            <Flex style={{flexDirection: "column", gap: "1.3rem"}}>
                <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                    <Text size={"md"} hierarchy={"primary"}>
                        {runtime?.name}
                    </Text>
                    {!minimized && (
                        <Text>
                            {runtime?.description}
                        </Text>
                    )}
                </Flex>
                {!minimized && (
                    <Text hierarchy={"tertiary"}>
                        Updated {formatDistanceToNow(runtime?.updatedAt!)} ago
                    </Text>
                )}
            </Flex>
        </DataTableColumn>
        <DataTableColumn>
            <Badge color={runtime?.status === "CONNECTED" ? "success" : "error"} border>
                <Text style={{color: "inherit"}}>{runtime?.status}</Text>
            </Badge>
        </DataTableColumn>
    </>
}