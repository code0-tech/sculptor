import React from "react";

export interface SuggestionVariantPreviewComponentProps {
    children?: React.ReactNode
    scale?: number
    onFitChange?: (fit: number) => void
}

export const SuggestionVariantPreviewComponent: React.FC<SuggestionVariantPreviewComponentProps> = (props) => {

    const {children, scale, onFitChange} = props

    const frameRef = React.useRef<HTMLDivElement>(null)
    const contentRef = React.useRef<HTMLDivElement>(null)
    const [fit, setFit] = React.useState(0)

    React.useLayoutEffect(() => {

        const frame = frameRef.current
        const content = contentRef.current
        if (!frame || !content) return

        const measure = () => {
            const width = Math.max(content.offsetWidth, content.scrollWidth)
            const height = Math.max(content.offsetHeight, content.scrollHeight)
            if (!width || !height) return
            setFit(Math.min(1, frame.clientWidth / width, frame.clientHeight / height))
        }

        measure()

        const observer = new ResizeObserver(measure)
        observer.observe(frame)
        observer.observe(content)
        return () => observer.disconnect()
    }, [children])

    React.useEffect(() => {
        if (fit > 0) onFitChange?.(fit)
    }, [fit, onFitChange])

    const applied = scale && scale > 0 ? scale : fit

    return <div ref={frameRef} style={{
        position: "relative",
        width: "100%",
        height: "7rem",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }}>
        <div ref={contentRef} style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto",
            whiteSpace: "nowrap",
            transform: `scale(${applied})`,
            transformOrigin: "center",
            opacity: applied === 0 ? 0 : 1
        }}>
            {children}
        </div>
    </div>
}
