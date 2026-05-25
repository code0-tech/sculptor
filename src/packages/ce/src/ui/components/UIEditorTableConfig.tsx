import {Card, DataTable, DataTableColumn, Flex, Text} from "@code0-tech/pictor";
import {
    columnOptions,
    moduleOptions,
    runtimeOptions,
} from "@edition/ui/components/UIEditorConfigInputs";

const columnLabels = columnOptions.reduce<Record<string, string>>((acc, option) => {
    acc[option.value] = option.label
    return acc
}, {})

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
    render: ({
        columns,
        filter,
        showFilter,
        rows,
    }: {
        columns: string[],
        filter: Record<string, { operator: "isOneOf" | "isNotOneOf", value: string | string[] }>,
        showFilter: boolean,
        rows: Record<string, unknown>[],
    }) => {
        const selectedColumns = columns ?? []

        return (
            <Card color={"secondary"}>
                {selectedColumns.length > 0 ? (
                    <DataTable
                        data={rows ?? []}
                        filter={showFilter ? filter : undefined}
                        emptyComponent={(
                            <DataTableColumn>
                                <Text>No rows found.</Text>
                            </DataTableColumn>
                        )}
                    >
                        {(row) => {
                            return selectedColumns.map((column) => (
                                <DataTableColumn key={column}>
                                    <Text>{String(row[column] ?? "")}</Text>
                                </DataTableColumn>
                            ))
                        }}
                    </DataTable>
                ) : "No columns selected."}
            </Card>
        )
    },
}
