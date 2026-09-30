import React from "react";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {
    InputDescription,
    InputLabel,
    TagInput,
    TagInputMenu,
    TagInputTrigger,
    TagInputValue,
    TagValue,
    useService
} from "@code0-tech/pictor";
import {useDebouncedCallback} from "use-debounce";
import {
    Flow,
    InlineReferenceValue,
    LiteralValue,
    NodeFunction,
    NodeParameterValue,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {ListInput, NodeSchema, Schema} from "@code0-tech/triangulum";
import {useParams} from "next/navigation";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DataTypeInputControlsComponent} from "@edition/datatype/components/inputs/DataTypeInputControlsComponent";
import {DataTypeInputValueComponent} from "@edition/datatype/components/inputs/DataTypeInputValueComponent";
import {
    DataTypeInputMenuSuggestionsComponent
} from "@edition/datatype/components/inputs/DataTypeInputMenuSuggestionsComponent";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";

export type DataTypeListSelectInputComponentProps = DataTypeInputComponentProps

export const DataTypeListSelectInputComponent: React.FC<DataTypeListSelectInputComponentProps> = (props) => {

    const {schema, formValidation, title, initialValue, description, suggestions, onChange} = props

    const params = useParams()
    const flowService = useService(FlowService)
    const flowId: Flow['id'] = props.flowId ?? `gid://sagittarius/Flow/${Number(params.flowId) || 1}`

    const defaultValue: NodeParameterValue | NodeFunction | undefined = React.useMemo(() => initialValue ?? undefined, [initialValue])
    const onChangeDebounced = useDebouncedCallback((value: LiteralValue | SubFlowValue | NodeFunction | ReferenceValue | null) => {
        onChange?.(value)
    }, 400)

    const elementSuggestions = React.useMemo(() => {
        const inner = schema && "schema" in schema ? (schema as NodeSchema).schema : (schema as Schema | undefined)
        const declared = (inner as ListInput | undefined)?.declaredItems ?? []
        const seen = new Set<string>()
        return declared.flatMap(item => item.suggestions ?? []).filter(suggest => {
            const key = JSON.stringify(suggest)
            if (seen.has(key)) return false
            seen.add(key)
            return true
        })
    }, [schema])

    const tagKeys: unknown[] = React.useMemo(() => elementSuggestions.map((suggest, index) =>
        suggest.__typename === "LiteralValue" ? suggest.value : `\${reference_${index}}`
    ), [elementSuggestions])

    const referenceSuggestions = React.useMemo(
        () => (suggestions ?? []).filter(suggest => suggest.__typename !== "LiteralValue"),
        [suggestions]
    )

    const initialLiteral = (initialValue as LiteralValue)?.__typename === "LiteralValue" ? (initialValue as LiteralValue) : undefined
    const initialArray = Array.isArray(initialLiteral?.value) ? initialLiteral.value as unknown[] : []
    const initialKey = JSON.stringify(initialArray)
    const initialTags: TagValue[] = React.useMemo(
        () => initialArray.map(entry => ({value: entry})),
        [initialKey]
    )

    const references = React.useMemo(() => {
        const map = new Map<string, ReferenceValue | SubFlowValue | NodeFunction>()
        elementSuggestions.forEach((suggest, index) => {
            if (suggest.__typename === "LiteralValue") return
            map.set(`\${reference_${index}}`, suggest as ReferenceValue | SubFlowValue | NodeFunction)
        })
        ;(initialLiteral?.references ?? []).forEach(reference => {
            if (!reference?.value) return
            map.set(`\${${reference.signature}}`, reference.value as ReferenceValue | SubFlowValue)
        })
        return map
    }, [elementSuggestions, initialKey])

    const lastValueKey = React.useRef(JSON.stringify([initialArray, initialLiteral?.references ?? []]))

    return React.useMemo(() => <>
        {title && <InputLabel>{title}</InputLabel>}
        {description && <InputDescription>{description}</InputDescription>}
        <DataTypeInputValueComponent initialValue={initialValue} onChange={value => {
            formValidation?.setValue?.(value)
            onChangeDebounced(value)
        }} suggestions={referenceSuggestions}
                                     formValidation={formValidation}>
            <TagInput allowCustomValues={false}
                      placeholder={typeof title === "string" ? title : undefined}
                      initialValue={initialTags}
                      maw={"100%"}
                      tokenRules={[
                          {
                              pattern: /^\$\{.+}$/,
                              void: true,
                              wrap: matchedText => {
                                  const reference = references.get(matchedText)
                                  if (reference?.__typename === "ReferenceValue") return <ReferenceBadgeComponent
                                      value={reference}/>
                                  if (reference?.__typename === "SubFlowValue") return <NodeBadgeComponent
                                      value={reference}/>
                                  if (reference?.__typename === "NodeFunction") return <NodeBadgeComponent value={{
                                      __typename: "SubFlowValue",
                                      functionDefinition: reference.functionDefinition
                                  }}/>
                                  return null
                              }
                          }
                      ]}
                      formValidation={{...formValidation, setValue: undefined}}
                      onChange={tags => {
                          const value: unknown[] = []
                          const inlineReferences: InlineReferenceValue[] = []

                          tags.forEach(tag => {
                              const tagKey = String(tag.value)
                              const reference = references.get(tagKey)

                              if (!reference) {
                                  value.push(tag.value)
                                  return
                              }

                              let resolved = reference
                              if (resolved.__typename === "NodeFunction") {
                                  const addedNodeId = flowService.addPreviousNodeById(flowId, props.nodeId ?? null, resolved)
                                  if (!addedNodeId) return
                                  resolved = {__typename: "ReferenceValue", nodeFunctionId: addedNodeId}
                                  references.set(tagKey, resolved)
                              }

                              const signature = `item_${inlineReferences.length}`
                              references.set(`\${${signature}}`, resolved)
                              inlineReferences.push({
                                  __typename: "InlineReferenceValue",
                                  signature,
                                  value: resolved as ReferenceValue | SubFlowValue
                              })
                              value.push(`\${${signature}}`)
                          })

                          const key = JSON.stringify([value, inlineReferences])
                          if (key === lastValueKey.current) return
                          lastValueKey.current = key
                          const literal: LiteralValue = {
                              __typename: "LiteralValue",
                              value,
                              ...(inlineReferences.length > 0 ? {references: inlineReferences} : {})
                          }
                          formValidation?.setValue?.(literal)
                          onChangeDebounced(literal)
                      }}
                      right={
                          <DataTypeInputControlsComponent suggestions={referenceSuggestions} onSelect={value => {
                              formValidation?.setValue?.(value)
                              onChangeDebounced(value)
                          }}/>
                      }
                      rightType={"action"}>
                {elementSuggestions.length > 0 ? (
                    <TagInputMenu openOn={"focus"}>
                        <DataTypeInputMenuSuggestionsComponent suggestions={elementSuggestions} tagKeys={tagKeys}/>
                    </TagInputMenu>
                ) : null}
                <TagInputValue/>
                <TagInputTrigger/>
            </TagInput>
        </DataTypeInputValueComponent>
    </>, [formValidation, defaultValue, elementSuggestions, tagKeys, references])
}
