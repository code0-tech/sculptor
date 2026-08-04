"use client"

import React from "react";
import {
    DataTable,
    DataTableColumn,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {IdentityProvider, User, UserIdentity} from "@code0-tech/sagittarius-graphql-types";
import {UserService} from "@edition/user/services/User.service";
import {ApplicationService} from "@edition/application/services/Application.service";
import {UserIdentitiesDataTableRowComponent} from "@edition/user/components/UserIdentitiesDataTableRowComponent";

export interface UserIdentitiesDataTableComponentProps {
    userId: User['id']
}

export const UserIdentitiesDataTableComponent: React.FC<UserIdentitiesDataTableComponentProps> = (props) => {

    const {userId} = props

    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const applicationService = useService(ApplicationService)
    const applicationStore = useStore(ApplicationService)

    const providers = React.useMemo<IdentityProvider[]>(
        () => (applicationService.get()?.settings?.identityProviders?.nodes ?? []).filter((node): node is IdentityProvider => !!node),
        [applicationStore]
    )

    const identities = React.useMemo<UserIdentity[]>(
        () => (userService.getById(userId)?.identities?.nodes ?? []).filter((identity): identity is UserIdentity => !!identity),
        [userStore, userId]
    )

    const typeByProviderId = React.useMemo(
        () => new Map(providers.map(provider => [provider.id, provider.type])),
        [providers]
    )

    return <ScrollArea w={"100%"} h={"100%"} type={"scroll"}>
        <ScrollAreaViewport>
            <DataTable filter={{}}
                       sort={{}}
                       emptyComponent={<DataTableColumn>
                           <Text>You haven't linked any accounts yet.</Text>
                       </DataTableColumn>}
                       data={identities}>
                {(identity) => <UserIdentitiesDataTableRowComponent userId={userId}
                                                                    identityId={identity.id}
                                                                    providerType={typeByProviderId.get(identity.providerId)}/>}
            </DataTable>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation={"vertical"}>
            <ScrollAreaThumb/>
        </ScrollAreaScrollbar>
    </ScrollArea>
}
