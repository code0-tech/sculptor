import React from "react";
import {IconArrowDown, IconArrowUp, IconCornerDownLeft} from "@tabler/icons-react";
import {DUserView} from "@edition/user/services/User.view";
import {
    Badge,
    Flex,
    InputSuggestion,
    InputSyntaxSegment,
    MenuItem,
    MenuLabel,
    Spacing,
    Text,
    TextInput,
    TextInputProps,
    useService,
    useStore
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";

export interface UserInputComponentProps extends TextInputProps {
    filter?: (user: DUserView, index: number) => boolean
}

export const UserInputComponent: React.FC<UserInputComponentProps> = (props) => {

    const {filter = () => true, ...rest} = props

    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const suggestions: InputSuggestion[] = React.useMemo(() => {
        return userService.values().filter(filter).map(user => ({
            value: user.username || "",
            children: <Flex align={"end"} style={{gap: "0.35rem"}}>
                <Text>{user.username}</Text>
                <Text size={"xs"} hierarchy={"tertiary"}>{user.email}</Text>
            </Flex>,
            insertMode: "insert",
            valueData: user,
            groupBy: "Users"
        }))
    }, [userStore])

    const transformSyntax = (
        _?: string | null,
        appliedParts: (InputSuggestion | any)[] = [],
    ): InputSyntaxSegment[] => {

        let cursor = 0

        return appliedParts.map((part: string | InputSuggestion, index) => {
            if (typeof part === "object") {
                const segment = {
                    type: "block",
                    value: part.valueData,
                    start: cursor,
                    end: cursor + part.value.length,
                    visualLength: 1,
                    content: <Badge color={"info"} border>
                        <Text style={{color: "inherit"}}>
                            @{part.value}
                        </Text>
                    </Badge>,
                }
                cursor += part.value.length
                return segment
            }
            const textString = part ?? ""
            if (!textString.length) return

            if (index == appliedParts.length - 1) {
                const segment = {
                    type: "text",
                    value: textString,
                    start: cursor,
                    end: cursor + textString.length,
                    visualLength: textString.length,
                    content: textString,
                }
                cursor += textString.length
                return segment
            }
            cursor += textString.length
            return {}
        }) as InputSyntaxSegment[]
    }

    return <TextInput placeholder={"Enter users"}
                      suggestionsEmptyState={<MenuItem><Text>No user found</Text></MenuItem>}
                      onLastTokenChange={token => {
                          userService.getByUsername(token)
                      }}
                      suggestionsFooter={<MenuLabel>
                          <Flex style={{gap: ".35rem"}}>
                              <Flex align={"center"} style={{gap: "0.35rem"}}>
                                  <Flex>
                                      <Badge border><IconArrowUp size={12}/></Badge>
                                      <Badge border><IconArrowDown size={12}/></Badge>
                                  </Flex>
                                  move
                              </Flex>
                              <Spacing spacing={"xxs"}/>
                              <Flex align={"center"} style={{gap: ".35rem"}}>
                                  <Badge border><IconCornerDownLeft size={12}/></Badge>
                                  insert
                              </Flex>
                          </Flex>
                      </MenuLabel>}
                      filterSuggestionsByLastToken
                      enforceUniqueSuggestions
                      transformSyntax={transformSyntax} {...rest}
                      suggestions={suggestions}/>
}
