import React from "react";
import Link from "next/link";

interface NamespaceLayoutProps {
    children: React.ReactNode
}

const NamespaceLayout: React.FC<NamespaceLayoutProps> = ({children}) => {
    return <div>
        {children}
    </div>
}

export default NamespaceLayout
