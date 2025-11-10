import React from "react";
import Link from "next/link";

interface ProjectLayoutProps {
    children: React.ReactNode
    modal: React.ReactNode
    tabs: React.ReactNode
}

const ProjectLayout: React.FC<ProjectLayoutProps> = ({children, modal, tabs}) => {
    return <div>
        {tabs}
        {modal}
        {children}
    </div>
}

export default ProjectLayout
