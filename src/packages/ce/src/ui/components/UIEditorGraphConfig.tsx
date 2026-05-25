import {Card, Flex, Text} from "@code0-tech/pictor";
import {
    axisOptions,
    axisTypeOptions,
    moduleOptions,
    runtimeOptions,
} from "@edition/ui/components/UIEditorConfigInputs";

export const UIEditorGraphConfig = {
    fields: {
        runtime: {
            type: "SelectInput",
            title: "Runtime",
            options: runtimeOptions,
            optionsSource: "runtime",
            defaultValue: "default-runtime",
        },
        module: {
            type: "SelectInput",
            title: "Module",
            options: moduleOptions,
            defaultValue: "users",
        },
        xAxis: {
            type: "SelectInput",
            title: "X Axis",
            options: axisOptions,
            defaultValue: "createdAt",
        },
        yAxis: {
            type: "SelectInput",
            title: "Y Axis",
            options: axisOptions,
            defaultValue: "count",
        },
        xAxisType: {
            type: "SelectInput",
            title: "X Axis Type",
            options: axisTypeOptions,
            defaultValue: "date",
        },
        yAxisType: {
            type: "SelectInput",
            title: "Y Axis Type",
            options: axisTypeOptions,
            defaultValue: "number",
        },
    },
    defaultProps: {
        runtime: "default-runtime",
        module: "users",
        xAxis: "createdAt",
        yAxis: "count",
        xAxisType: "date",
        yAxisType: "number",
    },
    render: ({module, xAxis, yAxis}: { module: string, xAxis: string, yAxis: string }) => {
        return (
            <Card color={"secondary"}>
                <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                    <Text hierarchy={"primary"}>Graph: {module}</Text>
                    <Text hierarchy={"secondary"}>X Axis: {xAxis}</Text>
                    <Text hierarchy={"secondary"}>Y Axis: {yAxis}</Text>
                </Flex>
            </Card>
        )
    },
}
