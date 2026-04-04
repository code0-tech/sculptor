export const parseHeaders = (headerEnv?: string): Record<string, string> => {
    if (headerEnv?.includes(':')) {
        const [key, ...valueParts] = headerEnv.split(':')
        return {
            [key.trim()]: valueParts.join(':').trim()
        }
    }

    return {}
}