import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./UserReadmeComponent.style.scss";

export interface UserReadmeComponentProps {
    readme: string
}

export const UserReadmeComponent: React.FC<UserReadmeComponentProps> = ({readme}) => {
    return <div className={"user-readme"}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {readme}
        </ReactMarkdown>
    </div>
}
