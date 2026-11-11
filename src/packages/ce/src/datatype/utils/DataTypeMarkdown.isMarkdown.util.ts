const MARKDOWN_PATTERN = new RegExp([
    /^\s{0,3}#{1,6}\s/,
    /^\s{0,3}>\s/,
    /^\s{0,3}[-*+]\s/,
    /^\s{0,3}\d+\.\s/,
    /^\s{0,3}(-{3,}|\*{3,})\s*$/,
    /^\s{0,3}\|.*\|\s*$/,
    /```/,
    /\*\*[^*\n]+\*\*/,
    /~~[^~\n]+~~/,
    /`[^`\n]+`/,
    /!?\[[^\]\n]*]\([^)\n]*\)/,
    /(^|\s)_[^_\s][^_\n]*_(\s|$)/
].map(pattern => `(?:${pattern.source})`).join("|"), "m")

export const isMarkdown = (text: string): boolean => MARKDOWN_PATTERN.test(text)
