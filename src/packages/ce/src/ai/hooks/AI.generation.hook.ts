import {create} from "zustand"
import {AiGenerateFlowSubscriptionPayload} from "@code0-tech/sagittarius-graphql-types"

export interface AIGeneration {
    executionIdentifier: string
    onData: (payload: AiGenerateFlowSubscriptionPayload) => string | void
    onError?: (message: string) => void
}

interface AIGenerationState {
    generations: AIGeneration[]
    addGeneration: (generation: AIGeneration) => void
    removeGeneration: (executionIdentifier: string) => void
    hasGeneration: (executionIdentifier: string) => boolean
}

export const useAIGenerationStore = create<AIGenerationState>((setState, getState) => ({
    generations: [],
    addGeneration: (generation) => setState((state) => ({
        generations: state.generations.some(g => g.executionIdentifier === generation.executionIdentifier)
            ? state.generations
            : [...state.generations, generation]
    })),
    removeGeneration: (executionIdentifier) => setState((state) => ({
        generations: state.generations.filter(g => g.executionIdentifier !== executionIdentifier)
    })),
    hasGeneration: (executionIdentifier) =>
        getState().generations.some(g => g.executionIdentifier === executionIdentifier),
}))
