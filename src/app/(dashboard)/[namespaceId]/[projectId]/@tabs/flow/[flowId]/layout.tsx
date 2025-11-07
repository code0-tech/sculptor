import React from "react";
import Link from "next/link";

interface FlowLayoutProps {
    children: React.ReactNode
    flow: React.ReactNode
    files: React.ReactNode
}

const FlowLayout: React.FC<FlowLayoutProps> = ({children, flow, files}) => {
    return <div>
        {flow}
        {files}
        {children}
    </div>
}

export default FlowLayout
