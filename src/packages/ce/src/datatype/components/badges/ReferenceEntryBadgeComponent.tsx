import React from "react";
import {NodeFunction, ReferenceValue, SubFlowValue} from "@code0-tech/sagittarius-graphql-types";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";

export interface ReferenceEntryBadgeComponentProps {
    value: ReferenceValue | SubFlowValue | NodeFunction
}

export const ReferenceEntryBadgeComponent: React.FC<ReferenceEntryBadgeComponentProps> = (props) => {

    const {value} = props

    if (value.__typename === "ReferenceValue") return <ReferenceBadgeComponent value={value}/>
    if (value.__typename === "SubFlowValue") return <NodeBadgeComponent value={value}/>
    if (value.__typename === "NodeFunction") return <NodeBadgeComponent value={{
        __typename: "SubFlowValue",
        functionDefinition: value.functionDefinition
    }}/>

    return null
}
