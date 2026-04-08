"use client"

import React from "react";
import {LicensesView} from "@edition/namespace/views/LicensesView";

export const LicensesPage: React.FC = () => {
    return <div style={{
        background: "#070514",
        height: "100%",
        padding: "1rem",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem"
    }}>
        <LicensesView/>
    </div>
}