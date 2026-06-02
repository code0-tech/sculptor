"use client"

import React from "react";
import {LicensesView} from "@cloud-internal/license/views/LicensesView";

export const LicensesPage: React.FC = () => {
    return <div style={{
        background: "#070514",
        height: "100%",
        padding: "2rem",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem"
    }}>
        <LicensesView/>
    </div>
}