import {PersonalProjectsView} from "@edition/ui-dashboard/personal-project/PersonalProjectsView";
import {OrganizationsView} from "@edition/ui-dashboard/organization/OrganizationsView";
import {Spacing} from "@code0-tech/pictor";

export const ApplicationPage = () => {

    return <div style={{
        background: "#070514",
        height: "100%",
        padding: "1rem",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem"
    }}>

        <PersonalProjectsView/>
        <Spacing spacing={"xl"}/>
        <OrganizationsView/>

    </div>

}