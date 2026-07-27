import {create} from "zustand"
import {AiGenerateFlowSubscriptionPayload} from "@code0-tech/sagittarius-graphql-types"

export interface AIGeneration {
    executionIdentifier: string
    onData: (payload: AiGenerateFlowSubscriptionPayload) => string | void
    onError?: (message: string) => void
}

interface AIGenerationState {
    generations: AIGeneration[]
    // Execution identifiers whose generation is currently displayed inline by a
    // mounted AIChatComponent, so the global watcher toast must stay hidden for them.
    suppressedIdentifiers: string[]
    addGeneration: (generation: AIGeneration) => void
    removeGeneration: (executionIdentifier: string) => void
    hasGeneration: (executionIdentifier: string) => boolean
    suppressToast: (executionIdentifier: string) => void
    unsuppressToast: (executionIdentifier: string) => void
}

export const useAIGenerationStore = create<AIGenerationState>((setState, getState) => ({
    generations: [],
    suppressedIdentifiers: [],
    addGeneration: (generation) => setState((state) => ({
        generations: state.generations.some(g => g.executionIdentifier === generation.executionIdentifier)
            ? state.generations
            : [...state.generations, generation]
    })),
    removeGeneration: (executionIdentifier) => setState((state) => ({
        generations: state.generations.filter(g => g.executionIdentifier !== executionIdentifier),
        suppressedIdentifiers: state.suppressedIdentifiers.filter(id => id !== executionIdentifier)
    })),
    hasGeneration: (executionIdentifier) =>
        getState().generations.some(g => g.executionIdentifier === executionIdentifier),
    suppressToast: (executionIdentifier) => setState((state) => ({
        suppressedIdentifiers: state.suppressedIdentifiers.includes(executionIdentifier)
            ? state.suppressedIdentifiers
            : [...state.suppressedIdentifiers, executionIdentifier]
    })),
    unsuppressToast: (executionIdentifier) => setState((state) => ({
        suppressedIdentifiers: state.suppressedIdentifiers.filter(id => id !== executionIdentifier)
    })),
}))
