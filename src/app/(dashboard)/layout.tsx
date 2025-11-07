import React from "react";
import Link from "next/link";

interface ApplicationLayoutProps {
    children: React.ReactNode
    modal: React.ReactNode
}

const ApplicationLayout: React.FC<ApplicationLayoutProps> = ({children, modal}) => {
    return <div>
        {modal}
        {children}
    </div>
}

export default ApplicationLayout
