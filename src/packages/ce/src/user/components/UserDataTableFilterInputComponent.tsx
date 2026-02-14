import React from "react";
import {
    DataTableFilterInput,
    DataTableFilterSuggestionMenu,
    MenuCheckboxItem,
    useService,
    useStore
} from "@code0-tech/pictor";
import {IconCheck} from "@tabler/icons-react";
import {DataTableFilterProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {UserService} from "@edition/user/services/User.service";

export interface UserDataTableFilterInputComponentProps {
    onChange: (filter: DataTableFilterProps) => void
}

export const UserDataTableFilterInputComponent: React.FC<UserDataTableFilterInputComponentProps> = (props) => {

    const {onChange} = props

    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const users = React.useMemo(
        () => userService.values(),
        [userStore]
    )

    return <DataTableFilterInput onChange={onChange} filterTokens={[
        {
            token: "Username",
            key: "username",
            operators: ["isOneOf"],
            suggestion: (context, operator, currentValue, applySuggestion) => {

                const split = currentValue.split(",").map(s => s.trim()).filter(Boolean)

                return <DataTableFilterSuggestionMenu context={context}>
                    {users.map(user => {

                        const isChecked = split.includes(user?.username!)

                        return <MenuCheckboxItem key={user?.username} checked={isChecked} onSelect={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            const updated = isChecked
                                ? split.filter(name => name !== user?.username)
                                : [...split, user?.username];
                            applySuggestion(updated.join(","), true);
                        }}>
                            {isChecked ? <IconCheck size={13}/> : <IconCheck color={"transparent"} size={13}/>}
                            @{user?.username}
                        </MenuCheckboxItem>
                    })}
                </DataTableFilterSuggestionMenu>
            }
        }, {
            token: "Email",
            key: "email",
            operators: ["isOneOf"],
            suggestion: (context, operator, currentValue, applySuggestion) => {

                const split = currentValue.split(",").map(s => s.trim()).filter(Boolean)

                return <DataTableFilterSuggestionMenu context={context}>
                    {users.map(user => {

                        const isChecked = split.includes(user?.email!)

                        return <MenuCheckboxItem key={user?.email} checked={isChecked} onSelect={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            const updated = isChecked
                                ? split.filter(name => name !== user?.email)
                                : [...split, user?.email];
                            applySuggestion(updated.join(","), true);
                        }}>
                            {isChecked ? <IconCheck size={13}/> : <IconCheck color={"transparent"} size={13}/>}
                            {user?.email}
                        </MenuCheckboxItem>
                    })}
                </DataTableFilterSuggestionMenu>
            }
        }, {
            token: "Owner",
            key: "admin",
            operators: ["isOneOf"],
            suggestion: (context, operator, currentValue, applySuggestion) => {

                const split = currentValue.split(",").map(s => s.trim()).filter(Boolean)

                return <DataTableFilterSuggestionMenu context={context}>
                    {["true", "false"].map(admin => {

                        const isChecked = split.includes(admin)

                        return <MenuCheckboxItem key={admin} checked={isChecked} onSelect={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            const updated = isChecked
                                ? split.filter(name => name !== admin)
                                : [...split, admin];
                            applySuggestion(updated.join(","), true);
                        }}>
                            {isChecked ? <IconCheck size={13}/> : <IconCheck color={"transparent"} size={13}/>}
                            {admin}
                        </MenuCheckboxItem>
                    })}
                </DataTableFilterSuggestionMenu>
            }
        }
    ]}/>
}