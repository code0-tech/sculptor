import {ApplicationPersonalProjectView} from "@edition/dashboard/application/ApplicationPersonalProjectView";
import {ApplicationOrganizationView} from "@edition/dashboard/application/ApplicationOrganizationView";
import {Spacing} from "@code0-tech/pictor";

export const ApplicationPage = () => {

    return <>

        <ApplicationPersonalProjectView/>
        <Spacing spacing={"xl"}/>
        <ApplicationOrganizationView/>

    </>

}