import React from "react";

export const useShownOptionalInputs = (idsWithValue: string[]): [Set<string>, (id: string) => void] => {

    const [manualIds, setManualIds] = React.useState<Set<string>>(new Set())

    const showId = React.useCallback(
        (id: string) => setManualIds(current => current.has(id) ? current : new Set([...current, id])),
        []
    )

    const shownIds = React.useMemo(
        () => new Set([...manualIds, ...idsWithValue]),
        [manualIds, idsWithValue]
    )

    return [shownIds, showId]
}
