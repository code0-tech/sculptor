import {create} from "zustand"
import {OnboardingStepKey} from "@edition/onboarding/utils/Onboarding.steps.util"

/**
 * Where the onboarding currently stands. It survives reloads and the redirect out of
 * the registration pages through local storage, because the run is started in the
 * `(auth)` route group and continues in the dashboard.
 *
 * `running` and `completed` are independent: a run that is stopped early stays
 * restartable, while one that walked through every task is `completed` for good and is
 * never offered again. Only a new registration resets that.
 */
interface OnboardingState {
    running: boolean
    completed: boolean
    step: OnboardingStepKey
    hydrate: () => void
    start: () => void
    goTo: (step: OnboardingStepKey) => void
    markCompleted: () => void
    finish: () => void
}

export const useOnboardingStore = create<OnboardingState>((setState) => ({
    running: false,
    completed: false,
    step: "workspace",
    hydrate: () => setState(() => {
        const stored = window.localStorage.getItem("ide_code-zero_onboarding")
        if (!stored) return {}
        return JSON.parse(stored) as Pick<OnboardingState, "running" | "completed" | "step">
    }),
    start: () => setState(() => {
        const next = {running: true, completed: false, step: "workspace" as OnboardingStepKey}
        window.localStorage.setItem("ide_code-zero_onboarding", JSON.stringify(next))
        return next
    }),
    goTo: (step) => setState((state) => {
        const next = {running: true, completed: state.completed, step}
        window.localStorage.setItem("ide_code-zero_onboarding", JSON.stringify(next))
        return next
    }),
    markCompleted: () => setState((state) => {
        const next = {running: state.running, completed: true, step: state.step}
        window.localStorage.setItem("ide_code-zero_onboarding", JSON.stringify(next))
        return next
    }),
    finish: () => setState((state) => {
        const next = {running: false, completed: state.completed, step: state.step}
        window.localStorage.setItem("ide_code-zero_onboarding", JSON.stringify(next))
        return next
    })
}))
