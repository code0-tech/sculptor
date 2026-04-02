export const isValidRedirect = (url: string | null): boolean => {
    if (!url) return false;

    try {
        const { host } = new URL(url);
        const currentHost = host.toLowerCase();

        const allowedString = process.env.NEXT_PUBLIC_ALLOWED_REDIRECT_DOMAINS || "";
        const allowedPatterns = allowedString.split(',').map(s => s.trim().toLowerCase());

        return allowedPatterns.some(pattern => {
            if (pattern.startsWith('*.')) {
                const baseDomain = pattern.slice(2);
                return currentHost === baseDomain || currentHost.endsWith('.' + baseDomain);
            }
            return currentHost === pattern;
        });
    } catch {
        return false;
    }
};