"use client"

import React from "react"
import {useAIGenerationStore} from "@edition/ai/hooks/AI.generation.hook"
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast"
import {toast as sonnerToast} from "sonner"
import {IconSparkles2Filled} from "@tabler/icons-react"
import {AIGeneratingMessageComponent} from "@edition/ai/components/AIGeneratingMessageComponent"
import {AIGenerationSubscriberComponent} from "@edition/ai/components/AIGenerationSubscriberComponent"
import BorderBeam from "border-beam";

// Owns a single watcher toast for one generation. The toast is shown unless the
// generation is currently displayed inline by a mounted AIChatComponent (i.e. the
// page where it was triggered). Unmounting this component dismisses its toast, so
// removing a generation from the store cleans up automatically.
const AIGenerationToastComponent: React.FC<{ suppressed: boolean }> = ({suppressed}) => {

    const toastIdRef = React.useRef<string | number | null>(null)

    React.useEffect(() => {
        if (!suppressed && toastIdRef.current === null) {
            toastIdRef.current = toast({
                duration: Infinity,
                wrapper: (children) => {
                    return <BorderBeam strength={1} theme={"dark"} duration={2}>
                        {children}
                    </BorderBeam>
                },
                icon: <IconSparkles2Filled size={16}/>,
                title: <AIGeneratingMessageComponent/>,
            })
        } else if (suppressed && toastIdRef.current !== null) {
            sonnerToast.dismiss(toastIdRef.current)
            toastIdRef.current = null
        }
    }, [suppressed])

    React.useEffect(() => () => {
        if (toastIdRef.current !== null) {
            sonnerToast.dismiss(toastIdRef.current)
            toastIdRef.current = null
        }
    }, [])

    return null
}

export const AIGenerationWatcherComponent: React.FC = () => {

    const generations = useAIGenerationStore(s => s.generations)
    const suppressedIdentifiers = useAIGenerationStore(s => s.suppressedIdentifiers)

    return <>
        {generations.map(generation => (
            <React.Fragment key={generation.executionIdentifier}>
                <AIGenerationToastComponent
                    suppressed={suppressedIdentifiers.includes(generation.executionIdentifier)}
                />
                <AIGenerationSubscriberComponent
                    generation={generation}
                />
            </React.Fragment>
        ))}
    </>
}
