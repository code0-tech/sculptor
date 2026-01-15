import {PersonalProjectsView} from "@edition/ui-dashboard/personal-project/PersonalProjectsView";
import {OrganizationsView} from "@edition/ui-dashboard/organization/OrganizationsView";
import {Spacing} from "@code0-tech/pictor";

export const ApplicationPage = () => {

    return <>

        <PersonalProjectsView/>
        <Spacing spacing={"xl"}/>
        <OrganizationsView/>

    </>

}