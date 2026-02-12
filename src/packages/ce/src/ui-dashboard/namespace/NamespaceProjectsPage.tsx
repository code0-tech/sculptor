"use client"

import {ProjectsView} from "@edition/ui-dashboard/project/ProjectsView";
import React from "react";

export const NamespaceProjectsPage: React.FC = () => {
    return <div style={{
        background: "#070514",
        height: "100%",
        padding: "1rem",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem"
    }}>
        <ProjectsView/>
    </div>
}