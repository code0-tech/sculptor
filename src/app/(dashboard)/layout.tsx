import React from "react";
import Link from "next/link";

interface RootLayoutProps {
    children: React.ReactNode
    modal: React.ReactNode
}

const RootLayout: React.FC<RootLayoutProps> = ({children, modal}) => {
    return <div>
        <Link href={"/settings"}>Open Modal</Link>
        {modal}
        {children}
    </div>
}

export default RootLayout
