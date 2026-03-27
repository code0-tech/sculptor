import {NodeFunction, Translation} from "@code0-tech/sagittarius-graphql-types";
import {CSSProperties} from "react";

export enum InspectionSeverity {
    TYPO,
    GRAMMAR,
    WEAK,
    WARNING,
    ERROR
}

export interface ValidationResult {
    nodeId: NodeFunction['id']
    parameterIndex: number
    type: InspectionSeverity
    message: Array<Translation>
}

export const underlineBySeverity: Record<InspectionSeverity, CSSProperties> = {
    [InspectionSeverity.TYPO]: {
        borderBottom: "1px dotted #3b82f6", // blue
    },
    [InspectionSeverity.GRAMMAR]: {
        borderBottom: "1px dashed #8b5cf6", // violet
    },
    [InspectionSeverity.WEAK]: {
        borderBottom: "3px double #9ca3af", // gray
    },
    [InspectionSeverity.WARNING]: {
        borderBottom: "1px dashed orange", // blue
    },
    [InspectionSeverity.ERROR]: {
        borderBottom: "1px dashed red", // blue
    }
}