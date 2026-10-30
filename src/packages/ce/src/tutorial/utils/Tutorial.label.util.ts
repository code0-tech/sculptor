import {TutorialLevel} from "@edition/tutorial/utils/Tutorial.level.util";

export const getTutorialLabel = (level?: TutorialLevel): string => {
    if (level === "application") return "Explore the overview"
    if (level === "namespace") return "Explore this workspace"
    if (level === "project") return "Explore this project"
    return "Explore the flow builder"
}
