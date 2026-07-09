"use client"

import React from "react";
import {Button} from "@code0-tech/pictor";
import {IconBuilding, IconHome} from "@tabler/icons-react";
import {useRouter} from "next/navigation";

export const ApplicationTabView: React.FC = () => {

    const router = useRouter()

    return <>
        <Button variant={"none"} color={"primary"} paddingSize={"xs"} onClick={() => router.push("/")}>
            <IconHome size={16}/>
        </Button>
        <Button variant={"none"} color={"primary"} paddingSize={"xs"}
                onClick={() => router.push("/workspaces")}>
            <IconBuilding size={16}/>
        </Button>
    </>
}
