export interface ReferenceHost {
    signature: string
    element: HTMLElement
}

export const referenceHosts = (element: HTMLElement): ReferenceHost[] =>
    Array.from(element.querySelectorAll<HTMLElement>("[data-reference]"))
        .map(host => ({signature: host.dataset.reference!, element: host}))
