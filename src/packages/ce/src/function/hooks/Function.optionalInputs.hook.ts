import React from "react";

export const useShownOptionalInputs = (idsWithValue: string[]): [Set<string>, (id: string) => void] => {

    const [shownIds, setShownIds] = React.useState<Set<string>>(new Set())

    const showId = React.useCallback(
        (id: string) => setShownIds(current => new Set([...current, id])),
        []
    )

    React.useEffect(() => {
        if (idsWithValue.length === 0) return
        setShownIds(current => idsWithValue.every(id => current.has(id)) ? current : new Set([...current, ...idsWithValue]))
    }, [idsWithValue])

    return [shownIds, showId]
}
