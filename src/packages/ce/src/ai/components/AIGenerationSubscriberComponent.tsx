"use client"

import React from "react"
import {useSubscription} from "@apollo/client/react"
import {AiGenerateFlowSubscriptionPayload, Subscription} from "@code0-tech/sagittarius-graphql-types"
import {AIGeneration, useAIGenerationStore} from "@edition/ai/hooks/AI.generation.hook"
import generateFlowSubscription from "@edition/ai/services/subscriptions/AI.generateFlow.subscription.graphql"

export interface AIGenerationSubscriberComponentProps {
    generation: AIGeneration
}

export const AIGenerationSubscriberComponent: React.FC<AIGenerationSubscriberComponentProps> = ({generation}) => {

    const removeGeneration = useAIGenerationStore(s => s.removeGeneration)

    useSubscription<Subscription>(generateFlowSubscription, {
        variables: {executionIdentifier: generation.executionIdentifier},
        onData: (data) => {
            const payload = data.data.data?.aiGenerateFlow as AiGenerateFlowSubscriptionPayload | undefined
            if (payload?.flow) {
                const result = generation.onData(payload)
                if (typeof result === "string") {
                    generation.onError?.(result)
                }
                removeGeneration(generation.executionIdentifier)
            } else if (payload?.flow === null) {
                generation.onError?.("Generation failed. Try another model.")
                removeGeneration(generation.executionIdentifier)
            }
        },
        onComplete: () => removeGeneration(generation.executionIdentifier),
        onError: () => {
            generation.onError?.("Generation failed. Try another model.")
            removeGeneration(generation.executionIdentifier)
        },
    })

    return null
}
