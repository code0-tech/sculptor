"use client"

import React from "react"
import {useAIGenerationStore} from "@edition/ai/hooks/AI.generation.hook"
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast"
import {toast as sonnerToast} from "sonner"
import {IconSparkles2Filled} from "@tabler/icons-react"
import {AIGeneratingMessageComponent} from "@edition/ai/components/AIGeneratingMessageComponent"
import {AIGenerationSubscriberComponent} from "@edition/ai/components/AIGenerationSubscriberComponent"

export const AIGenerationWatcherComponent: React.FC = () => {

    const generations = useAIGenerationStore(s => s.generations)
    const toastIdRef = React.useRef<string | number | null>(null)

    const isGenerating = generations.length > 0

    React.useEffect(() => {
        if (isGenerating && toastIdRef.current === null) {
            toastIdRef.current = toast({
                duration: Infinity,
                icon: <IconSparkles2Filled size={16} color={"#e270ff"}/>,
                title: <AIGeneratingMessageComponent/>,
            })
        } else if (!isGenerating && toastIdRef.current !== null) {
            sonnerToast.dismiss(toastIdRef.current)
            toastIdRef.current = null
        }
    }, [isGenerating])

    React.useEffect(() => () => {
        if (toastIdRef.current !== null) {
            sonnerToast.dismiss(toastIdRef.current)
            toastIdRef.current = null
        }
    }, [])

    return <>
        {generations.map(generation => (
            <AIGenerationSubscriberComponent
                key={generation.executionIdentifier}
                generation={generation}
            />
        ))}
    </>
}
