"use client"

import React from "react";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {useRouter} from "next/navigation";

export interface ApplicationMiddlewareProps {
    children: React.ReactNode
}

export const ApplicationMiddlewareComponent: React.FC<ApplicationMiddlewareProps> = (props) => {

    const router = useRouter()
    const currentSession = useUserSession()

    if (currentSession === null) {
        router.push("/login")
        return null
    }

    return <>{props.children}</>
}