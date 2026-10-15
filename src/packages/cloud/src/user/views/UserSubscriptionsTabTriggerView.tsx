import React from "react";
import {IconSparkles} from "@tabler/icons-react";
import {SettingDialogTab} from "@core/components/SettingDialog";
import {UserSubscriptionsView} from "@cloud-internal/user/views/UserSubscriptionsView";

export const UserSubscriptionsTab: SettingDialogTab | undefined = {
    value: "subscriptions",
    label: "Subscriptions",
    icon: IconSparkles,
    content: <UserSubscriptionsView/>
}
