import React from "react"
import "../type/DataTypeTypeInputComponent.style.scss"
import {LiteralValue} from "@code0-tech/sagittarius-graphql-types";
import {InputDescription, InputLabel, Spacing, useService, useStore} from "@code0-tech/pictor";
import {
    DataTypeTypeInputEditDialogComponent
} from "@edition/datatype/components/inputs/datatype/DataTypeTypeInputEditDialogComponent";
import {DataTypeInputValueComponent} from "@edition/datatype/components/inputs/DataTypeInputValueComponent";
import {useJsonSchemaAction} from "@edition/flow/components/FlowWorkerProvider";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {DataTypeInputComponentProps} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {parseTypeToNode} from "@edition/datatype/components/inputs/datatype/DataTypeType.node.util";
import {
    DataTypeTypeInputTreeComponent
} from "@edition/datatype/components/inputs/datatype/DataTypeTypeInputTreeComponent";

export interface DataTypeTypeInputComponentProps extends DataTypeInputComponentProps {
}

export const DataTypeTypeInputComponent: React.FC<DataTypeTypeInputComponentProps> = (props) => {

    const {title, description, formValidation, suggestions, initialValue, cast, onChange, onCastChange} = props

    const dataTypeService = useService(DatatypeService)
    const dataTypeStore = useStore(DatatypeService)
    const jsonSchemaAction = useJsonSchemaAction()

    const [type, setType] = React.useState<string | null>(cast ?? null)
    const [editDialogOpen, setEditDialogOpen] = React.useState(false)
    const emittedCast = React.useRef<string | null>(cast ?? null)

    const dataTypes = React.useMemo(
        () => dataTypeService.values(),
        [dataTypeStore]
    )

    const dataTypeOptions = React.useMemo(
        () => dataTypes.map(dataType => ({
            identifier: dataType.identifier!,
            generics: dataType.genericKeys?.length ?? 0,
            label: dataType.name?.[0]?.content || dataType.identifier!,
            displayMessage: dataType.displayMessages?.[0]?.content ?? undefined,
            genericKeys: dataType.genericKeys ?? []
        })),
        [dataTypes]
    )

    const root = React.useMemo(() => parseTypeToNode(type), [type])

    React.useEffect(() => {
        if ((cast ?? null) !== emittedCast.current) {
            emittedCast.current = cast ?? null
            setType(cast ?? null)
        }
    }, [cast])

    const handleClear = React.useCallback(() => {
        emittedCast.current = null
        setType(null)
        formValidation?.setValue?.(null)
        onChange?.(null)
        onCastChange?.(null)
    }, [])

    const handleTypeChange = React.useCallback(async (next: string | null) => {
        setType(next)
        if (!next) return handleClear()

        emittedCast.current = next
        onCastChange?.(next)
        const schema = await jsonSchemaAction.execute({type: next, dataTypes})
        if (emittedCast.current !== next) return

        const literal = {__typename: "LiteralValue", value: schema ?? {}} as LiteralValue
        formValidation?.setValue?.(literal)
        onChange?.(literal)
    }, [dataTypes])

    return (
        <>
            <DataTypeTypeInputEditDialogComponent
                key={`edit-dialog-${editDialogOpen}`}
                open={editDialogOpen}
                value={type}
                onOpenChange={open => setEditDialogOpen(open)}
                onTypeClose={v => handleTypeChange(v ?? null)}
            />
            {title && <InputLabel>{title}</InputLabel>}
            {description && <InputDescription>{description}</InputDescription>}
            <DataTypeInputValueComponent inside
                                         initialValue={initialValue}
                                         onChange={(value) => {
                                             if (!value) return handleClear()
                                             formValidation?.setValue?.(value)
                                             onChange?.(value)
                                         }}
                                         onClick={() => setEditDialogOpen(true)}
                                         suggestions={suggestions}
                                         formValidation={formValidation}>
                <DataTypeTypeInputTreeComponent node={root} dataTypeOptions={dataTypeOptions}/>
                <Spacing spacing={"xxs"}/>
            </DataTypeInputValueComponent>
        </>
    )
}
