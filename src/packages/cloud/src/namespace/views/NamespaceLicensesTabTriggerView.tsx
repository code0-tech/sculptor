import React from "react";
import {IconSparkles} from "@tabler/icons-react";
import {SettingDialogTab} from "@core/components/SettingDialog";
import {NamespaceLicensesView} from "@edition/namespace/views/NamespaceLicensesView";

export const NamespaceLicensesTab: SettingDialogTab | undefined = {
    value: "subscriptions",
    label: "Subscriptions",
    icon: IconSparkles,
    content: <NamespaceLicensesView/>
}
