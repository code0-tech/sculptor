export const isVoidType = (type?: string): boolean =>
    !type || ["void", "undefined", "null", "never"].includes(type)
