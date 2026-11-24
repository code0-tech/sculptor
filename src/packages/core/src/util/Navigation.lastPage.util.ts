const visitedUrls: string[] = []

interface DialogRouter {
    back: () => void
    replace: (url: string) => void
}

export const recordPageUrl = (url: string) => {
    const last = visitedUrls[visitedUrls.length - 1]
    if (last === url) return
    if (last?.split("?")[0] === url.split("?")[0]) visitedUrls[visitedUrls.length - 1] = url
    else visitedUrls.push(url)
    if (visitedUrls.length > 50) visitedUrls.shift()
}

export const closeDialog = (router: DialogRouter, fallbackUrl: string) => {
    if (visitedUrls.length > 1) return router.back()
    router.replace(fallbackUrl)
}
