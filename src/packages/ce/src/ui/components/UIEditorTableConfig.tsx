import {Card, Flex, Text} from "@code0-tech/pictor";
import {
    columnOptions,
    moduleOptions,
    runtimeOptions,
} from "@edition/ui/components/UIEditorConfigInputs";

export const UIEditorTableConfig = {
    fields: {
        runtime: {
            type: "SelectInput",
            title: "Runtime",
            options: runtimeOptions,
            defaultValue: "default-runtime",
        },
        module: {
            type: "SelectInput",
            title: "Module",
            options: moduleOptions,
            defaultValue: "users",
        },
        columns: {
            type: "MultiSelectInput",
            title: "Columns",
            options: columnOptions,
            defaultValue: ["name", "createdAt"],
        },
        filter: {
            type: "DataTableFilterInput",
            title: "Filter",
            options: columnOptions,
            operators: ["isOneOf", "isNotOneOf"],
        },
        showFilter: {
            type: "SwitchInput",
            title: "Show Filter",
        },
        minItems: {
            type: "NumberInput",
            title: "Minimum Items",
        },
        maxItems: {
            type: "NumberInput",
            title: "Maximum Items",
        },
        itemsPerPage: {
            type: "NumberInput",
            title: "Items per Page",
        },
    },
    defaultProps: {
        runtime: "default-runtime",
        module: "users",
        columns: ["name", "createdAt"],
        filter: {},
        showFilter: true,
        minItems: 0,
        maxItems: 100,
        itemsPerPage: 10,
    },
    render: ({module, columns, itemsPerPage}: { module: string, columns: string[], itemsPerPage: number }) => {
        return (
            <Card color={"secondary"}>
                <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                    <Text hierarchy={"primary"}>Table: {module}</Text>
                    <Text hierarchy={"secondary"}>Columns: {columns?.join(", ")}</Text>
                    <Text hierarchy={"tertiary"}>Items per page: {itemsPerPage}</Text>
                </Flex>
            </Card>
        )
    },
}
