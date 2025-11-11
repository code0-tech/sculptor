import React from "react";
import Link from "next/link";

interface ProjectLayoutProps {
    children: React.ReactNode
    tabs: React.ReactNode
}

const ProjectLayout: React.FC<ProjectLayoutProps> = ({children, tabs}) => {
    return <div>
        {tabs}
        {children}
    </div>
}

export default ProjectLayout
