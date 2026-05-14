import React from "react";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {Button} from "@code0-tech/pictor";
import {IconArrowBackUp, IconArrowForwardUp} from "@tabler/icons-react";
import {Panel} from "@xyflow/react";

export const UIEditorHistoryPanelView: React.FC = () => {
    return <Panel position={"top-right"}>
        <ButtonGroup>
            <Button paddingSize={"xxs"} variant={"none"} color={"secondary"}>
                <IconArrowBackUp size={13}/>
            </Button>
            <Button paddingSize={"xxs"} variant={"none"} color={"secondary"}>
                <IconArrowForwardUp size={13}/>
            </Button>
        </ButtonGroup>
    </Panel>
}