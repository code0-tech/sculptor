import React from "react";
import Link from "next/link";

interface NamespaceLayoutProps {
    children: React.ReactNode
    modal: React.ReactNode
}

const NamespaceLayout: React.FC<NamespaceLayoutProps> = ({children, modal}) => {
    return <div>
        {modal}
        {children}
    </div>
}

export default NamespaceLayout
