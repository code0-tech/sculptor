"use client"

import React from "react";
import {driver} from "driver.js";
import {useParams, usePathname} from "next/navigation";
import {useService, useStore} from "@code0-tech/pictor";
import {Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {getTutorialLevel, TutorialLevel} from "@edition/tutorial/utils/Tutorial.level.util";
import {getApplicationTutorialSteps} from "@edition/tutorial/utils/Tutorial.applicationSteps.util";
import {getNamespaceTutorialSteps} from "@edition/tutorial/utils/Tutorial.namespaceSteps.util";
import {getProjectTutorialSteps} from "@edition/tutorial/utils/Tutorial.projectSteps.util";
import {getFlowTutorialSteps} from "@edition/tutorial/utils/Tutorial.flowSteps.util";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {useUsageLicense} from "@edition/usage/hooks/Usage.license.hook";
import {useFlowViewStore} from "@edition/flow/hooks/Flow.view.hook";

export interface Tutorial {
    level?: TutorialLevel
    hasSteps: boolean
    start: () => void
}

/**
 * Interactive tour of the level the user is currently on. Permissions come from the
 * same source as the ui that renders the elements, and steps whose element is missing
 * anyway are skipped, so a level renders a shorter tour instead of promising
 * something the user cannot see or do.
 */
export const useTutorial = (): Tutorial => {

    const pathname = usePathname()
    const params = useParams()
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const {accessible} = useUsageLicense()
    const setTab = useFlowViewStore(state => state.setTab)
    const selectNode = useFlowViewStore(state => state.selectNode)

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`

    const level = React.useMemo(() => getTutorialLevel(pathname), [pathname])

    const namespace = React.useMemo(
        () => namespaceIndex ? namespaceService.getById(namespaceId) : undefined,
        [namespaceStore, namespaceIndex, namespaceId]
    )

    const project = React.useMemo(
        () => projectIndex ? projectService.getById(projectId, {namespaceId}) : undefined,
        [projectStore, projectIndex, projectId, namespaceId]
    )

    const context = React.useMemo(() => ({
        usageAccessible: accessible,
        createProject: !!namespace?.userAbilities?.createNamespaceProject,
        createFlow: !!project?.userAbilities?.createFlow,
        openTab: setTab,
        selectNode
    }), [accessible, namespace, project, setTab, selectNode])

    const steps = React.useMemo(() => {
        if (level === "application") return getApplicationTutorialSteps(context)
        if (level === "namespace") return getNamespaceTutorialSteps(context)
        if (level === "project") return getProjectTutorialSteps(context)
        if (level === "flow") return getFlowTutorialSteps(context)
        return []
    }, [level, context])

    const start = React.useCallback(() => {
        if (steps.length <= 0) return

        driver({
            steps,
            allowClose: true,
            advanceOnClick: true,
            overlayClickBehavior: "nextStep",
            disableActiveInteraction: true,
            showProgress: true,
            smoothScroll: true,
            skipMissingElement: true,
            waitForElement: 500,
            stagePadding: 8,
            stageRadius: 16,
            overlayColor: "#070514",
            overlayOpacity: 0.9,
            popoverClass: "tutorial",
            progressText: "{{current}} of {{total}}",
            nextBtnText: "Next",
            prevBtnText: "Back",
            doneBtnText: "Done"
        }).drive()
    }, [steps])

    return {level, hasSteps: steps.length > 0, start}
}
