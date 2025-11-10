import React from "react";
import Link from "next/link";

interface FlowsLayoutProps {
    children: React.ReactNode
    folders: React.ReactNode
}

const FlowsLayout: React.FC<FlowsLayoutProps> = ({children, folders}) => {
    return <div>
        {folders}
        {children}
    </div>
}

export default FlowsLayout
