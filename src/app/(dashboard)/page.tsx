"use client"

import {mutate} from "@core/util/graphql"
import { useApolloClient } from "@apollo/client/react";

export default function ApplicationPage() {

  const client = useApolloClient();
  mutate(client).then(value => {
    console.log(value)
  })

  return <>
    Application page
  </>
}
