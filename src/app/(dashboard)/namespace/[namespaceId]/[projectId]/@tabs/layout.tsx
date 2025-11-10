import React from "react";
import Link from "next/link";

interface TabsLayoutProps {
    children: React.ReactNode
}

const TabsLayout: React.FC<TabsLayoutProps> = ({children}) => {
    return <div>
        {children}
    </div>
}

export default TabsLayout
