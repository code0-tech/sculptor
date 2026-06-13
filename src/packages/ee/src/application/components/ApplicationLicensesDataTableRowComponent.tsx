import React from "react";
import {License} from "@code0-tech/sagittarius-graphql-types";
import {Badge, Button, DataTableColumn, Flex, Progress, Spacing, Text, useService, useStore} from "@code0-tech/pictor";
import {ApplicationService} from "@ee-internal/application/services/Application.service";
import {formatDistanceToNow, isFuture, isPast} from "date-fns";
import {IconX} from "@tabler/icons-react";
import {addIslandSuccessNotification} from "@code0-tech/pictor/dist/components/island/Island.hook";

export interface LicensesDataTableRowComponentProps {
    licenseId: License['id']
}

export const ApplicationLicensesDataTableRowComponent: React.FC<LicensesDataTableRowComponentProps> = (props) => {

    const {licenseId} = props

    const applicationService = useService(ApplicationService)
    const applicationStore = useStore(ApplicationService)

    const license = React.useMemo(
        () => applicationService.get()?.licenses?.nodes?.find(license => license?.id === licenseId) as License,
        [applicationStore, licenseId]
    )

    const licenseRemove = React.useCallback(() => {
        applicationService.applicationLicenseRemove({
            licenseId: licenseId!
        }).then(payload => {
            if ((payload?.errors?.length ?? 0) <= 0) {
                addIslandSuccessNotification({
                    message: "Deleted license"
                })
            }
        })
    }, [])

    return <>
        <DataTableColumn pr={2.5}>
            <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                <Flex align={"center"} style={{gap: "0.35rem"}}>
                    <Text size={"xl"} hierarchy={"primary"}>
                        Enterprise Edition license
                    </Text>
                    {isPast(license.startDate!) && isFuture(license.endDate!) ? (
                        <Badge color={"success"}>
                            <Text style={{color: "inherit"}}>
                                Active
                            </Text>
                        </Badge>
                    ) : (
                        <Badge>
                            <Text>
                                Not active
                            </Text>
                        </Badge>
                    )}
                </Flex>
                <Flex style={{flexDirection: "column", gap: "0.35rem", textWrap: "nowrap"}}>
                    <Text display={"flex"} align={"center"} style={{gap: "0.35rem"}}>
                        Active since
                        <Badge color={"secondary"}>
                            <Text>
                                {formatDistanceToNow(license.startDate!, {addSuffix: true})}
                            </Text>
                        </Badge>
                    </Text>
                    <Text display={"flex"} align={"center"} style={{gap: "0.35rem"}}>
                        and active until
                        <Badge color={"secondary"}>
                            <Text>
                                {formatDistanceToNow(license.endDate!, {addSuffix: true})}
                            </Text>
                        </Badge>
                    </Text>
                </Flex>
            </Flex>
        </DataTableColumn>
        <DataTableColumn pr={2.5}>
            <Text>
                Workflow usage (2.250)
            </Text>
            <Spacing spacing={"xs"}/>
            <Progress maw={"75%"} value={9} predictionValue={24} max={100}
                      color={"linear-gradient(to right, #29BF12 0%, #D90429 100%)"}/>
            <Spacing spacing={"xs"}/>
            <Text>
                You used 9% of your available workflow executions and will used 24% until its reseted.
            </Text>
        </DataTableColumn>
        <DataTableColumn pr={2.5}>
            <Text>
                AI usage (250)
            </Text>
            <Spacing spacing={"xs"}/>
            <Progress maw={"75%"} value={50} predictionValue={89} max={100} color={"#70ffb2"}/>
            <Spacing spacing={"xs"}/>
            <Text>
                You used 50% of your available workflow executions and will used 89% until its reseted.
            </Text>
        </DataTableColumn>
        <DataTableColumn>
            <Text size={"xl"} hierarchy={"primary"} display={"flex"} align={"center"} style={{gap: "0.35rem"}}>
                350€
                <Text size={"md"} hierarchy={"tertiary"}>
                    /month
                </Text>
            </Text>
        </DataTableColumn>
        <DataTableColumn>
            <Button color={"error"} variant={"none"} onClick={licenseRemove}>
                <IconX size={16}/>
            </Button>
        </DataTableColumn>
    </>
}