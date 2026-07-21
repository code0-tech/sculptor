"use client"
import {FlowFolderView} from "@edition/flow/views/FlowFolderView";
import React from "react";

export default () => {
    return  <div style={{
        height: "100%",
        boxSizing: "border-box",
        maxWidth: "246px"
    }}>
        <FlowFolderView/>
    </div>
}
