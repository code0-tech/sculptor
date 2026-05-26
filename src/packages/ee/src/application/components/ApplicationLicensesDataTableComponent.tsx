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
import {License} from "@code0-tech/sagittarius-graphql-types";
import {
    ApplicationLicensesDataTableRowComponent
} from "@ee/application/components/ApplicationLicensesDataTableRowComponent";
import Link from "next/link";
import {ApplicationService} from "@edition/application/services/Application.service";

export interface LicensesDataTableComponentProps {
    sort?: DataTableSortProps
    filter?: DataTableFilterProps
    preFilter?: (project: License, index: number) => boolean
    onSelect?: (item: License | undefined) => void
}

export const ApplicationLicensesDataTableComponent: React.FC<LicensesDataTableComponentProps> = (props) => {

    const {sort, filter, preFilter = () => true, onSelect} = props

    const applicationService = useService(ApplicationService)
    const applicationStore = useStore(ApplicationService)

    const licenses = React.useMemo(
        () => applicationService.get()?.licenses?.nodes as License[] ?? [],
        [applicationStore]
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
                                  To use the cloud features, you need to have at least one license connected to
                                  your <br/>
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
            return <ApplicationLicensesDataTableRowComponent licenseId={license?.id}/>
        }}
    </DataTable>

}