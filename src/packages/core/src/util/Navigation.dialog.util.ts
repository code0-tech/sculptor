const historyIndexKey = "__dialogHistoryIndex"

interface DialogRouter {
    back: () => void
    replace: (url: string) => void
}

let historyIndex = 0
let historyLength = typeof window === "undefined" ? 0 : window.history.length
let closingHref: string | undefined = undefined

export const recordNavigation = () => {
    const stampedIndex = window.history.state?.[historyIndexKey]

    if (typeof stampedIndex === "number") historyIndex = stampedIndex
    else if (window.history.length > historyLength) historyIndex = historyIndex + 1

    historyLength = window.history.length
    closingHref = undefined

    if (window.history.state?.[historyIndexKey] === historyIndex) return
    window.history.replaceState({...window.history.state, [historyIndexKey]: historyIndex}, "")
}

export const closeDialog = (router: DialogRouter, fallbackUrl: string) => {
    if (closingHref === window.location.href) return
    closingHref = window.location.href

    if (historyIndex > 0) return router.back()
    router.replace(fallbackUrl)
}
