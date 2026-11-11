const REFERENCE_TOKEN = /\$\{[A-Za-z0-9_]+}/

const referenceTextNodes = (node: Node): Text[] => {
    if (node.nodeType === Node.TEXT_NODE) return [node as Text]
    if (node.nodeType !== Node.ELEMENT_NODE) return []
    if ((node as HTMLElement).closest("code, pre, [data-reference]")) return []

    return Array.from(node.childNodes).flatMap(referenceTextNodes)
}

const referenceHost = (signature: string): HTMLSpanElement => {
    const host = document.createElement("span")

    host.className = "data-type-markdown-input__reference"
    host.dataset.reference = signature
    host.contentEditable = "false"

    return host
}

const referenceSignature = (token: string): string | undefined =>
    new RegExp(`^${REFERENCE_TOKEN.source}$`).test(token) ? token.slice(2, -1) : undefined

const referenceFragment = (text: string): DocumentFragment => {
    const fragment = document.createDocumentFragment()

    text.split(new RegExp(`(${REFERENCE_TOKEN.source})`)).forEach(part => {
        const signature = referenceSignature(part)

        if (signature) fragment.appendChild(referenceHost(signature))
        else if (part.length > 0) fragment.appendChild(document.createTextNode(part))
    })

    return fragment
}

export const mountReferenceHosts = (element: HTMLElement): void =>
    referenceTextNodes(element)
        .filter(node => REFERENCE_TOKEN.test(node.textContent ?? ""))
        .forEach(node => node.parentNode?.replaceChild(referenceFragment(node.textContent ?? ""), node))
