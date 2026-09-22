import React from "react"
import {Button, Flex, Text} from "@code0-tech/pictor"
import {IconForms, IconLetterCase, IconList} from "@tabler/icons-react"
import {createTypeNode, TypeNode} from "@edition/datatype/components/inputs/datatype/DataTypeType.node.util"

export interface DataTypeTypeBuilderStarterComponentProps {
    onStart: (root: TypeNode) => void
}

export const DataTypeTypeBuilderStarterComponent: React.FC<DataTypeTypeBuilderStarterComponentProps> = (props) => {

    const {onStart} = props

    const cardStyle: React.CSSProperties = {
        height: "auto",
        width: "100%",
        textAlign: "left"
    }

    const startSingleValue = () => onStart(createTypeNode("datatype"))

    const startForm = () => {
        const node = createTypeNode("object")
        node.fields = [{key: "", node: createTypeNode("datatype", "TEXT")}]
        onStart(node)
    }

    const startList = () => {
        const node = createTypeNode("datatype", "LIST")
        node.args = [createTypeNode("datatype", "TEXT")]
        onStart(node)
    }

    return (
        <Flex align={"center"} justify={"center"} style={{flexDirection: "column", gap: "0.75rem", minHeight: "60vh"}}>
            <Button color={"secondary"} paddingSize={"md"} style={cardStyle} onClick={startSingleValue}>
                <Flex align={"flex-start"} style={{gap: "0.75rem"}} w={"100%"}>
                    <IconLetterCase size={20}/>
                    <Flex style={{flexDirection: "column", gap: "0.1rem"}}>
                        <Text>A single value</Text>
                        <Text hierarchy={"tertiary"}>text, a number, yes / no…</Text>
                    </Flex>
                </Flex>
            </Button>
            <Button color={"secondary"} paddingSize={"md"} style={cardStyle} onClick={startForm}>
                <Flex align={"flex-start"} style={{gap: "0.75rem"}} w={"100%"}>
                    <IconForms size={20}/>
                    <Flex style={{flexDirection: "column", gap: "0.1rem"}}>
                        <Text>A form</Text>
                        <Text hierarchy={"tertiary"}>several named fields, e.g. name, email, age</Text>
                    </Flex>
                </Flex>
            </Button>
            <Button color={"secondary"} paddingSize={"md"} style={cardStyle} onClick={startList}>
                <Flex align={"flex-start"} style={{gap: "0.75rem"}} w={"100%"}>
                    <IconList size={20}/>
                    <Flex style={{flexDirection: "column", gap: "0.1rem"}}>
                        <Text>A list</Text>
                        <Text hierarchy={"tertiary"}>many of the same thing</Text>
                    </Flex>
                </Flex>
            </Button>
        </Flex>
    )
}
