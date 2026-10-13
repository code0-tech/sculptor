const dialogPathnames: string[] = []
const pageUrls: string[] = []

export const markDialogPathname = (pathname: string) => {
    if (!dialogPathnames.includes(pathname)) dialogPathnames.push(pathname)
}

export const recordPageUrl = (url: string) => {
    if (dialogPathnames.includes(url.split("?")[0]) || pageUrls[pageUrls.length - 1] === url) return
    pageUrls.push(url)
}

export const lastPageUrl = () => pageUrls[pageUrls.length - 1]
