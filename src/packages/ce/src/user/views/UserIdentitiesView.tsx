"use client"

import React from "react";
import {Flex, Spacing, Text, useService, useStore} from "@code0-tech/pictor";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import {UserIdentity} from "@code0-tech/sagittarius-graphql-types";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {IdentityProviderButtonsComponent} from "@edition/user/components/IdentityProviderButtonsComponent";
import {UserIdentitiesDataTableComponent} from "@edition/user/components/UserIdentitiesDataTableComponent";

export const UserIdentitiesView: React.FC = () => {

    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const session = useUserSession()

    const user = React.useMemo(
        () => userService.getById(session?.user?.id),
        [userStore, session]
    )

    const identities = React.useMemo<UserIdentity[]>(
        () => (user?.identities?.nodes ?? []).filter((node): node is UserIdentity => !!node),
        [user]
    )

    const linkedProviderIds = identities
        .map(identity => identity.providerId)
        .filter((id): id is string => !!id)

    const returnTo = typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : undefined

    return <TabContent value={"connections"}
                       style={{
                           overflow: "hidden",
                           height: "100%",
                           display: "flex",
                           flexDirection: "column"
                       }}>
        <Flex justify={"space-between"} align={"center"}>
            <Text size={"lg"} hierarchy={"primary"} display={"block"}>Connected accounts</Text>
        </Flex>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            Link an identity provider to sign in without a password, or unlink one you no longer use.
        </Text>
        <Spacing spacing={"md"}/>
        {identities.length > 0 ? (
            <>
                <div style={{flex: 1, minHeight: 0}}>
                    <UserIdentitiesDataTableComponent userId={user?.id}/>
                </div>
                <Spacing spacing={"md"}/>
            </>
        ) : null}
        <IdentityProviderButtonsComponent intent={"link"}
                                          returnTo={returnTo}
                                          excludeProviderIds={linkedProviderIds}/>
    </TabContent>
}
