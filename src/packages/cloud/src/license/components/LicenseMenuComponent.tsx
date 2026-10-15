"use client"

import React from "react";
import {
    Menu,
    MenuContent,
    MenuItem,
    MenuLabel,
    MenuPortal,
    MenuSeparator,
    MenuTrigger,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {useParams} from "next/navigation";
import {License, Namespace} from "@code0-tech/sagittarius-graphql-types";
import {IconCreditCard, IconExternalLink, IconUnlink, IconUserCog} from "@tabler/icons-react";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";
import {NamespaceService} from "@cloud-internal/namespace/services/Namespace.service";
import {LicenseUnlinkDialogComponent} from "@cloud-internal/license/components/LicenseUnlinkDialogComponent";
import {useLicenseUpgrade} from "@edition/license/hooks/License.upgrade.hook";
import {isLicenseActive} from "@core/util/license";

export interface LicenseMenuComponentProps {
    license?: License | null
    trigger: React.ReactNode
}

export const LicenseMenuComponent: React.FC<LicenseMenuComponentProps> = (props) => {

    const {license, trigger} = props

    const params = useParams()
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)

    const [unlinkOpen, setUnlinkOpen] = React.useState(false)

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`

    const manage = useLicenseUpgrade("license_menu_manage", namespaceIndex, {
        target: "subscription",
        action: "license",
        license
    })
    const profile = useLicenseUpgrade("license_menu_profile", namespaceIndex, {
        target: "subscription",
        action: "customer",
        license
    })

    const active = React.useMemo(
        () => isLicenseActive(license) && namespaceService.getById(namespaceId)?.currentLicense?.id === license?.id,
        [namespaceStore, namespaceId, license]
    )

    const licenseUnlink = React.useCallback(() => {
        namespaceService.namespaceLicenseRemove({
            licenseId: license?.id!
        }).then(payload => {
            if ((payload?.errors?.length ?? 0) <= 0) {
                toast({
                    title: "Subscription unlinked from this workspace",
                    color: "success",
                    children: "The subscription itself stays active and is still billed. Cancel it in the subscription dashboard."
                })
            }
        })
    }, [license])

    return <>
        <Menu>
            <MenuTrigger asChild>
                {trigger}
            </MenuTrigger>
            <MenuPortal>
                <MenuContent sideOffset={8} align={"end"}>
                    <MenuLabel>Subscription dashboard</MenuLabel>
                    <MenuItem disabled={manage.pending} onSelect={manage.upgrade}>
                        <IconCreditCard size={13}/>
                        <Text>Manage subscription</Text>
                        <IconExternalLink size={13} style={{marginLeft: "auto", opacity: 0.5}}/>
                    </MenuItem>
                    <MenuItem disabled={profile.pending} onSelect={profile.upgrade}>
                        <IconUserCog size={13}/>
                        <Text>Manage customer profile</Text>
                        <IconExternalLink size={13} style={{marginLeft: "auto", opacity: 0.5}}/>
                    </MenuItem>
                    <MenuSeparator/>
                    <MenuLabel>This workspace</MenuLabel>
                    <MenuItem onSelect={() => setUnlinkOpen(true)}>
                        <IconUnlink size={13}/>
                        <Text>Unlink subscription</Text>
                    </MenuItem>
                </MenuContent>
            </MenuPortal>
        </Menu>
        <LicenseUnlinkDialogComponent license={license}
                                      active={active}
                                      open={unlinkOpen}
                                      onOpenChange={setUnlinkOpen}
                                      onUnlink={licenseUnlink}/>
    </>
}
