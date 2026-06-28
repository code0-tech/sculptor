"use client"

import React from "react"
import {useAIGenerationStore} from "@edition/ai/hooks/AI.generation.hook"
import {useIsland} from "@code0-tech/pictor/dist/components/island/Island.hook"
import {IconSparkles2Filled} from "@tabler/icons-react"
import {AIGeneratingMessageComponent} from "@edition/ai/components/AIGeneratingMessageComponent"
import {AIGenerationSubscriberComponent} from "@edition/ai/components/AIGenerationSubscriberComponent"

export const AIGenerationWatcherComponent: React.FC = () => {

    const generations = useAIGenerationStore(s => s.generations)
    const islandToastIdRef = React.useRef<number | null>(null)
    const addToast = useIsland(s => s.addToast)
    const removeToast = useIsland(s => s.removeToast)

    const isGenerating = generations.length > 0

    React.useEffect(() => {
        if (isGenerating && islandToastIdRef.current === null) {
            const id = Date.now()
            islandToastIdRef.current = id
            addToast({
                id,
                duration: Infinity,
                index: 2,
                icon: <IconSparkles2Filled size={16} color={"#e270ff"}/>,
                message: <AIGeneratingMessageComponent/>,
            })
        } else if (!isGenerating && islandToastIdRef.current !== null) {
            removeToast(islandToastIdRef.current)
            islandToastIdRef.current = null
        }
    }, [isGenerating, addToast, removeToast])

    React.useEffect(() => () => {
        if (islandToastIdRef.current !== null) {
            removeToast(islandToastIdRef.current)
            islandToastIdRef.current = null
        }
    }, [removeToast])

    return <>
        {generations.map(generation => (
            <AIGenerationSubscriberComponent
                key={generation.executionIdentifier}
                generation={generation}
            />
        ))}
    </>
}
