"use client"

import React from "react";
import {usePathname} from "next/navigation";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {supportChatService} from "@cloud-internal/support/services/Support.chat.service";
import {useSupportChat} from "@cloud-internal/support/hooks/Support.chat.hook";
import {SupportConnection} from "@cloud-internal/support/services/Support.chat.types";

export const useSupportConnection = (): boolean => {

    const userSession = useUserSession()
    const pathname = usePathname()
    const session = useSupportChat(state => state.session)
    const settings = useSupportChat(state => state.settings)
    const visible = useSupportChat(state => state.visible)
    const currentUuid = useSupportChat(state => state.currentUuid)
    const typingUuid = useSupportChat(state => state.typingUuid)
    const selfTyping = useSupportChat(state => state.selfTyping)
    const setSession = useSupportChat(state => state.setSession)
    const setConnection = useSupportChat(state => state.setConnection)
    const applyMessage = useSupportChat(state => state.applyMessage)
    const applyTyping = useSupportChat(state => state.applyTyping)
    const applyConversationUpdate = useSupportChat(state => state.applyConversationUpdate)
    const reportTyping = useSupportChat(state => state.reportTyping)
    const markSeen = useSupportChat(state => state.markSeen)
    const resync = useSupportChat(state => state.resync)

    const socketRef = React.useRef<WebSocket | undefined>(undefined)
    const [connection, setSocketConnection] = React.useState<SupportConnection>("connecting")

    const appSessionToken = userSession?.token

    const send = React.useCallback((payload: object) => {
        if (socketRef.current?.readyState !== WebSocket.OPEN) return
        socketRef.current.send(JSON.stringify(payload))
    }, [])

    React.useEffect(() => {

        if (!session) return

        const state = {
            closed: false,
            lastPong: Date.now(),
            ping: undefined as ReturnType<typeof setInterval> | undefined,
            retry: undefined as ReturnType<typeof setTimeout> | undefined
        }

        const connect = () => {
            if (state.closed) return

            setSocketConnection(previous => previous === "online" ? "connecting" : previous)

            const socket = new WebSocket(session.socketUrl)
            socketRef.current = socket

            socket.onopen = () => {
                state.lastPong = Date.now()
                setSocketConnection("online")
                socket.send(JSON.stringify({
                    type: "join",
                    token: session.sessionToken,
                    data: {inbox_id: session.inboxId}
                }))
                resync()
            }

            socket.onmessage = event => {
                const frame = JSON.parse(event.data)

                if (frame.type === "pong") state.lastPong = Date.now()
                if (frame.type === "new_message" && frame.data) applyMessage(frame.data)
                if (frame.type === "conversation_update" && frame.data) applyConversationUpdate(frame.data)
                if (frame.type === "typing" && frame.data) {
                    applyTyping(frame.data.conversation_uuid, !!frame.data.is_typing)
                }
            }

            socket.onclose = () => {
                if (state.closed || socketRef.current !== socket) return
                setSocketConnection("offline")
                state.retry = setTimeout(connect, 2000)
            }

            socket.onerror = () => socket.close()
        }

        const revive = () => {
            if (socketRef.current?.readyState === WebSocket.OPEN) return
            socketRef.current?.close()
            connect()
        }

        state.ping = setInterval(() => {
            if (socketRef.current?.readyState !== WebSocket.OPEN) return
            send({type: "ping"})
            if (Date.now() - state.lastPong > 30000) socketRef.current.close()
        }, 10000)

        connect()

        window.addEventListener("online", revive)
        document.addEventListener("visibilitychange", revive)

        return () => {
            state.closed = true
            clearInterval(state.ping)
            clearTimeout(state.retry)
            window.removeEventListener("online", revive)
            document.removeEventListener("visibilitychange", revive)
            socketRef.current?.close()
            socketRef.current = undefined
        }
    }, [session, send, resync, applyMessage, applyTyping, applyConversationUpdate])

    React.useEffect(() => {
        if (!appSessionToken) {
            setSession(undefined, undefined)
            return
        }

        supportChatService.openSession(appSessionToken).then(async opened => {
            if (!opened) return
            setSession(opened, await supportChatService.getSettings(opened.sessionToken))
        })
    }, [appSessionToken, setSession])

    React.useEffect(() => setConnection(connection), [connection, setConnection])

    React.useEffect(() => {
        if (!typingUuid) return
        const timeout = setTimeout(() => applyTyping(typingUuid, false), 5000)
        return () => clearTimeout(timeout)
    }, [typingUuid, applyTyping])

    React.useEffect(() => {
        if (!currentUuid) return

        send({type: "typing", data: {conversation_uuid: currentUuid, is_typing: selfTyping}})
        if (!selfTyping) return

        const timeout = setTimeout(() => reportTyping(false), 3000)
        return () => clearTimeout(timeout)
    }, [selfTyping, currentUuid, reportTyping, send])

    React.useEffect(() => {
        if (!visible) return
        markSeen()
    }, [visible, currentUuid, markSeen])

    React.useEffect(() => {
        if (!pathname || connection !== "online") return
        send({type: "page_visit", data: {url: window.location.href, title: document.title}})
    }, [pathname, connection, send])

    return !!session && !!settings
}
