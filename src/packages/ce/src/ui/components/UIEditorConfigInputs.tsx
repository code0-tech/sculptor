import React from "react";
import {
    DataTableFilterInput,
    Flex,
    InputLabel,
    Menu,
    MenuCheckboxItem,
    MenuContent,
    MenuItemIndicator,
    MenuPortal,
    MenuTrigger,
    NumberInput,
    SelectContent,
    SelectInput,
    SelectItem,
    SelectItemText,
    SelectPortal,
    SelectTrigger,
    SelectValue,
    SelectViewport,
    SwitchInput,
    Text,
    TextInput,
} from "@code0-tech/pictor";
import {IconCheck, IconChevronDown} from "@tabler/icons-react";

export const headingSizes = Array.from({length: 6}, (_, index) => {
    const level = index + 1

    return {
        label: `Heading ${level}`,
        value: `h${level}`,
    }
})

export const cardColors = [
    {label: "Primary", value: "primary"},
    {label: "Secondary", value: "secondary"},
    {label: "Tertiary", value: "tertiary"},
    {label: "Info", value: "info"},
    {label: "Success", value: "success"},
    {label: "Warning", value: "warning"},
    {label: "Error", value: "error"},
]

export const dividerOrientations = [
    {label: "Horizontal", value: "horizontal"},
    {label: "Vertical", value: "vertical"},
]

export const runtimeOptions = [
    {label: "Default Runtime", value: "default-runtime"},
]

export const moduleOptions = [
    {label: "Users", value: "users"},
    {label: "Projects", value: "projects"},
    {label: "Organizations", value: "organizations"},
]

export const columnOptions = [
    {label: "Name", value: "name"},
    {label: "Description", value: "description"},
    {label: "Created At", value: "createdAt"},
    {label: "Updated At", value: "updatedAt"},
]

export const axisOptions = [
    {label: "Name", value: "name"},
    {label: "Created At", value: "createdAt"},
    {label: "Updated At", value: "updatedAt"},
    {label: "Count", value: "count"},
]

export const axisTypeOptions = [
    {label: "Date", value: "date"},
    {label: "Number", value: "number"},
    {label: "Text", value: "text"},
]

export const textHierarchyOptions = [
    {label: "Primary", value: "primary"},
    {label: "Secondary", value: "secondary"},
    {label: "Tertiary", value: "tertiary"},
]

export const columnSizeOptions = [
    {label: "25%", value: "25%"},
    {label: "33%", value: "33%"},
    {label: "50%", value: "50%"},
    {label: "100%", value: "100%"},
]

export const columnSizeToSpan = {
    "25%": 3,
    "33%": 4,
    "50%": 6,
    "100%": 12,
} as const

export const isValidUrl = (value: string) => {
    try {
        const url = new URL(value)

        return url.protocol === "http:" || url.protocol === "https:"
    } catch {
        return false
    }
}

export const UIEditorTextInputField: React.FC<any> = (props) => {
    const {field, name, value, onChange} = props

    return (
        <TextInput
            title={field.title ?? name}
            description={field.description}
            value={value ?? ""}
            clearable
            onChange={(event) => {
                const nextValue = event.currentTarget.value

                if (!field.validateUrl || isValidUrl(nextValue)) {
                    onChange(nextValue)
                }
            }}
        />
    )
}

export const UIEditorSelectInputField: React.FC<any> = (props) => {
    const {field, value, onChange} = props
    const title = field.title ?? field.label
    const options = field.options ?? []

    return (
        <SelectInput
            title={title}
            value={value}
            onValueChange={(nextValue) => onChange(nextValue)}
            p={0.5}
            label={title}
        >
            <SelectTrigger asChild>
                <Flex justify={"space-between"} align={"center"} p={0.75}>
                    <Text hierarchy={"secondary"}>
                        <SelectValue placeholder={title}/>
                    </Text>
                    <IconChevronDown size={13}/>
                </Flex>
            </SelectTrigger>
            <SelectPortal>
                <SelectContent position={"item-aligned"}>
                    <SelectViewport>
                        {options.map((option: { label: string, value: string }) => {
                            return (
                                <SelectItem key={option.value} value={option.value}>
                                    <SelectItemText>
                                        {option.label}
                                    </SelectItemText>
                                </SelectItem>
                            )
                        })}
                    </SelectViewport>
                </SelectContent>
            </SelectPortal>
        </SelectInput>
    )
}

export const UIEditorNumberInputField: React.FC<any> = (props) => {
    const {field, value, onChange} = props

    return (
        <NumberInput
            title={field.title}
            value={value?.toString() ?? "1"}
            onChange={(event) => onChange(Number(event.currentTarget.value))}
        />
    )
}

export const UIEditorDataTableFilterInputField: React.FC<any> = (props) => {
    const {field, onChange} = props
    const options = field.options ?? []

    return (
        <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
            <InputLabel>{field.title}</InputLabel>
            <DataTableFilterInput
                onChange={(filter) => onChange(filter)}
                filterTokens={options.map((option: { label: string, value: string }) => {
                    return {
                        token: option.label,
                        key: option.value,
                        operators: field.operators ?? ["isOneOf", "isNotOneOf"],
                    }
                })}
            />
        </Flex>
    )
}

export const UIEditorSwitchInputField: React.FC<any> = (props) => {
    const {field, value, onChange} = props

    return (
        <SwitchInput
            title={field.title}
            initialValue={Boolean(value)}
            onChange={(event) => onChange(event.currentTarget.checked)}
        />
    )
}

export const MultipleSelectInput: React.FC<{
    title: string
    value?: string[]
    options: { label: string, value: string }[]
    onChange: (value: string[]) => void
}> = (props) => {
    const {title, value, options, onChange} = props
    const selectedValues = Array.isArray(value) ? value : []
    const triggerValue = selectedValues.length > 0
        ? `${selectedValues.length} selected`
        : title

    return (
        <>
            <InputLabel>{title}</InputLabel>
            <Menu>
                <MenuTrigger asChild>
                    <button
                        type={"button"}
                        className={"input-wrapper"}
                        style={{width: "100%", border: 0, padding: 0, cursor: "pointer"}}
                    >
                        <Flex justify={"space-between"} align={"center"} p={0.75} style={{width: "100%"}}>
                            <Text hierarchy={"secondary"}>
                                {triggerValue}
                            </Text>
                            <IconChevronDown size={13}/>
                        </Flex>
                    </button>
                </MenuTrigger>
                <MenuPortal>
                    <MenuContent align={"start"}>
                        {options.map((option) => {
                            const selected = selectedValues.includes(option.value)

                            return (
                                <MenuCheckboxItem
                                    key={option.value}
                                    checked={selected}
                                    onSelect={(event) => event.preventDefault()}
                                    onCheckedChange={(checked) => {
                                        onChange(checked === true
                                            ? [...selectedValues, option.value]
                                            : selectedValues.filter((selectedValue) => selectedValue !== option.value))
                                    }}
                                >
                                    <MenuItemIndicator>
                                        <IconCheck size={13}/>
                                    </MenuItemIndicator>
                                    {option.label}
                                </MenuCheckboxItem>
                            )
                        })}
                    </MenuContent>
                </MenuPortal>
            </Menu>
        </>
    )
}

export const UIEditorMultiSelectInputField: React.FC<any> = (props) => {
    const {field, value, onChange} = props

    return (
        <MultipleSelectInput
            title={field.title}
            value={value}
            options={field.options ?? []}
            onChange={onChange}
        />
    )
}
