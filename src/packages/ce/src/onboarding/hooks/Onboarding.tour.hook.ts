"use client"

import React from "react";
import {driver} from "driver.js";
import {useParams, usePathname} from "next/navigation";
import {useService, useStore} from "@code0-tech/pictor";
import {Flow, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {getOnboardingSteps, OnboardingStep} from "@edition/onboarding/utils/Onboarding.steps.util";
import {useOnboardingStore} from "@edition/onboarding/hooks/Onboarding.state.hook";
import {UserService} from "@edition/user/services/User.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {useFlowExecutionStore} from "@edition/flow/hooks/Flow.execution.hook";

export interface Onboarding {
    running: boolean
    step: OnboardingStep
    index: number
    total: number
    finish: () => void
}

/**
 * Drives the guided first run. A task is never finished by a click but by the state it
 * asks for, so the user really creates the project, the flow and the execution. The
 * spotlight follows the user: it sits on the element of the current task and moves to
 * its `dialogElement` while a modal dialog is open. `onboarding-active` on the body
 * marks the run for the stylesheet, which lifts the pointer event lock driver.js puts
 * on everything but the highlighted element - here the spotlight only guides the eye
 * and must never make a dialog or a menu unusable.
 */
export const useOnboarding = (): Onboarding => {

    const pathname = usePathname()
    const params = useParams()
    const currentSession = useUserSession()
    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const executions = useFlowExecutionStore(state => state.executions)
    const running = useOnboardingStore(state => state.running)
    const stepKey = useOnboardingStore(state => state.step)
    const hydrate = useOnboardingStore(state => state.hydrate)
    const goTo = useOnboardingStore(state => state.goTo)
    const markCompleted = useOnboardingStore(state => state.markCompleted)
    const finish = useOnboardingStore(state => state.finish)

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const flowIndex = params.flowId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`

    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, currentSession]
    )

    const flow = React.useMemo(
        () => flowIndex ? flowService.getById(flowId, {namespaceId, projectId}) : undefined,
        [flowStore, flowIndex, flowId, namespaceId, projectId]
    )

    const context = React.useMemo(() => ({
        personalNamespaceIndex: currentUser?.namespace?.id?.match(/Namespace\/(\d+)$/)?.[1],
        namespaceIndex,
        projectIndex,
        flowIndex,
        projectCount: namespaceIndex ? projectService.values({namespaceId}).length : 0,
        flowCount: projectIndex ? flowService.values({namespaceId, projectId}).length : 0,
        nodeCount: flow?.nodes?.nodes?.length ?? 0,
        executed: (flow?.executionResults?.count ?? 0) > 0 || executions.some(execution => execution.flowId === flowId)
    }), [currentUser, namespaceIndex, projectIndex, flowIndex, projectStore, flowStore, flow, executions, namespaceId, projectId, flowId])

    const steps = React.useMemo(() => getOnboardingSteps(context), [context])

    const index = React.useMemo(
        () => Math.max(steps.findIndex(step => step.key === stepKey), 0),
        [steps, stepKey]
    )

    const step = steps[index]

    React.useEffect(() => hydrate(), [hydrate])

    React.useEffect(() => {
        if (!running || !step.completed) return
        if (steps[index + 1]) goTo(steps[index + 1].key)
    }, [running, step, steps, index, goTo])

    React.useEffect(() => {
        if (!running || step.key !== "done") return
        markCompleted()
    }, [running, step, markCompleted])

    React.useEffect(() => {
        if (!running) return
        document.body.classList.add("onboarding-active")
        return () => document.body.classList.remove("onboarding-active")
    }, [running])

    React.useEffect(() => {
        if (!running || (!step.element && !step.dialogElement)) return

        const instance = driver({
            allowClose: false,
            smoothScroll: true,
            stagePadding: 8,
            stageRadius: 16,
            overlayColor: "#070514",
            overlayOpacity: 0.75
        })

        const interval = window.setInterval(() => {
            const selector = document.querySelector('[role="dialog"]') ? step.dialogElement : step.element
            const target = selector ? document.querySelector<HTMLElement>(selector) : null
            if (!target && instance.isActive()) instance.destroy()
            if (!target || instance.getActiveElement() === target) return
            instance.highlight({element: target})
        }, 250)

        return () => {
            window.clearInterval(interval)
            instance.destroy()
        }
    }, [running, step, pathname])

    return {running, step, index, total: steps.length, finish}
}
