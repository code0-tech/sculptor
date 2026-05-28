import React from "react";
import {TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {Button, Text, useService, useStore} from "@code0-tech/pictor";
import {useParams} from "next/navigation";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";

export const NamespaceTabListView: React.FC = () => {

    const params = useParams()
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`

    const namespace = React.useMemo(
        () => namespaceService.getById(namespaceId),
        [namespaceStore, namespaceId]
    )

    return <TabList>
        {namespace?.parent?.__typename === "Organization" && (
            <>
                <TabTrigger value={"general"} w={"100%"} asChild>
                    <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                        <Text size={"md"} hierarchy={"primary"}>General</Text>
                    </Button>
                </TabTrigger>
                <TabTrigger value={"delete"} w={"100%"} asChild>
                    <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                        <Text size={"md"} hierarchy={"primary"}>Delete organization</Text>
                    </Button>
                </TabTrigger>
            </>
        )}
    </TabList>
}