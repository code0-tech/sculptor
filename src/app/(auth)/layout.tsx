"use client"

import {ContextStoreProvider, DUserView, Text, useReactiveArrayService} from "@code0-tech/pictor";
import {UserService} from "@core/user/User.service";
import {useApolloClient} from "@apollo/client/react";
import {GraphqlClient} from "@core/util/graphql-client";
import Image from "next/image";
import React from "react";

export default function AuthLayout({children}: Readonly<{ children: React.ReactNode }>) {

    const client = useApolloClient()
    const [store, service] = useReactiveArrayService<DUserView, UserService>((store) => new UserService(new GraphqlClient(client), store))

    return (
        <html>
        <body>
        <ContextStoreProvider services={[[store, service]]}>
            {children}
        </ContextStoreProvider>
        <div style={{
            position: "fixed",
            bottom: "1rem",
            right: 0,
            display: "flex",
            alignItems: "center",
        }}>
            <Text>All rights reserved &copy; Code0 UG (haftungsbeschränkt)</Text>
            <Image src={"/CodeZero_Banner_Transparent.png"} alt={"CodeZero Banner"} width={200} height={0} style={{ width: '200px', height: 'auto' }}/>
        </div>
        </body>
        </html>
    );
}
