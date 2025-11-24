import {PersonalProjectsView} from "@edition/dashboard/personal-project/PersonalProjectsView";
import {OrganizationsView} from "@edition/dashboard/organization/OrganizationsView";
import {Spacing} from "@code0-tech/pictor";

export const ApplicationPage = () => {

    return <>

        <PersonalProjectsView/>
        <Spacing spacing={"xl"}/>
        <OrganizationsView/>

    </>

}