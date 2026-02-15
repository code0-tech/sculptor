"use client"

import React from "react";
import {OrganizationsView} from "@edition/organization/views/OrganizationsView";

export const OrganizationsPage = () => {
    return <div style={{
        background: "#070514",
        height: "100%",
        padding: "1rem",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem"
    }}>
        <OrganizationsView/>
    </div>

}