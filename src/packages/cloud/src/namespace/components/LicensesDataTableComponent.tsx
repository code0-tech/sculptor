"use client"

import React from "react";
import {
    AuroraBackground,
    Button,
    ButtonGroup,
    DataTable,
    DataTableColumn,
    Flex,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {Namespace, NamespaceLicense} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {LicensesDataTableRowComponent} from "@edition/namespace/components/LicensesDataTableRowComponent";
import Link from "next/link";

export interface LicensesDataTableComponentProps {
    namespaceId: Namespace['id']
    sort?: DataTableSortProps
    filter?: DataTableFilterProps
    preFilter?: (project: NamespaceLicense, index: number) => boolean
    onSelect?: (item: NamespaceLicense | undefined) => void
}

export const LicensesDataTableComponent: React.FC<LicensesDataTableComponentProps> = (props) => {

    const {namespaceId, sort, filter, preFilter = () => true, onSelect} = props

    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)

    const licenses = React.useMemo(
        () => namespaceService.getById(namespaceId)?.namespaceLicenses?.nodes as NamespaceLicense[] ?? [],
        [namespaceStore]
    )

    return <DataTable filter={{}}
                      sort={{}}
                      emptyComponent={<DataTableColumn>
                          <Flex align={"center"} justify={"center"}
                                style={{textAlign: "center", flexDirection: "column"}}>
                              <Text size={"lg"} hierarchy={"primary"}>
                                  No license connected yet
                              </Text>
                              <Spacing spacing={"xl"}/>
                              <Text>
                                  To use the cloud features, you need to have at least one license connected to your <br/>
                                  namespace.
                              </Text>
                              <Spacing spacing={"xl"}/>
                              <ButtonGroup>
                                  <Link href={"https://codezero.build/subscription"}>
                                      <Button color={"secondary"} variant={"none"}>
                                          Link bought license
                                      </Button>
                                  </Link>
                                  <Link href={"https://codezero.build/subscription"}>
                                      <Button color={"secondary"} variant={"none"}>
                                          <AuroraBackground/>
                                          Buy new license
                                      </Button>
                                  </Link>
                              </ButtonGroup>
                          </Flex>

                      </DataTableColumn>}
                      onSelect={(item) => item && onSelect?.(item)}
                      data={licenses?.filter(preFilter)}>
        {(license, index) => {
            return <LicensesDataTableRowComponent namespaceId={namespaceId} licenseId={license?.id}/>
        }}
    </DataTable>

}