import {PersonalProjectsView} from "@edition/dashboard/application/PersonalProjectsView";
import {OrganizationsView} from "@edition/dashboard/application/OrganizationsView";
import {Spacing} from "@code0-tech/pictor";

export const ApplicationPage = () => {

    return <>

        <PersonalProjectsView/>
        <Spacing spacing={"xl"}/>
        <OrganizationsView/>

    </>

}