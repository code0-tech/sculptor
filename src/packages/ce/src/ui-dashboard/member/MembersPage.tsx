"use client"

import {MembersView} from "@edition/ui-dashboard/member/MembersView";
import React from "react";

export const MembersPage: React.FC = () => {
    return <div style={{
        background: "#070514",
        height: "100%",
        padding: "1rem",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem"
    }}>
        <MembersView/>
    </div>
}