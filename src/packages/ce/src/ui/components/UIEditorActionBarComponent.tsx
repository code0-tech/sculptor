import {Button, ButtonGroup, Flex} from "@code0-tech/pictor";
import React from "react";
import {createPortal} from "react-dom";

type PuckActionProps = {
    label?: string
    onClick?: (event: React.SyntheticEvent) => void
    active?: boolean
    disabled?: boolean
    children?: React.ReactNode
}

type PictorButtonElement = React.ReactElement<React.ComponentProps<typeof Button>>
type ActionBarPosition = {
    top: number
    right: number
}

const actionLabels: Record<string, string> = {
    Duplicate: "Copy",
    Delete: "Delete",
}

const isSelectedOverlay = (overlay: Element | null) => {
    return overlay?.className.toString().includes("isSelected") ?? false
}

const getActionBarPosition = (anchor: HTMLElement): ActionBarPosition => {
    const rect = anchor.getBoundingClientRect()

    return {
        top: Math.max(8, rect.top),
        right: Math.max(8, window.innerWidth - rect.right),
    }
}

const renderAction = (child: React.ReactNode): React.ReactNode => {
    if (!React.isValidElement(child)) {
        return child
    }

    const action = child as React.ReactElement<PuckActionProps>

    if (child.type === React.Fragment) {
        return React.Children.map(action.props.children, renderAction)
    }

    if (!action.props.onClick) {
        return null
    }

    const actionLabel = action.props.label ?? "Action"
    const label = actionLabels[actionLabel] ?? actionLabel

    return (
        <Button
            key={actionLabel}
            type={"button"}
            title={label}
            aria-label={label}
            active={action.props.active}
            disabled={action.props.disabled}
            paddingSize={"xxs"}
            variant={"none"}
            color={actionLabel === "Delete" ? "error" : "secondary"}
            onClick={action.props.onClick}
        >
            {action.props.children}
        </Button>
    )
}

const useActionBarPortalState = (anchorRef: React.RefObject<HTMLDivElement | null>) => {
    const [position, setPosition] = React.useState<ActionBarPosition>()
    const [visible, setVisible] = React.useState(false)

    React.useLayoutEffect(() => {
        const anchor = anchorRef.current

        if (!anchor) {
            return
        }

        const syncState = () => {
            const overlay = anchor.closest("[data-puck-overlay]")

            setVisible(isSelectedOverlay(overlay))
            setPosition(getActionBarPosition(anchor))
        }

        const frame = requestAnimationFrame(syncState)
        const observer = new MutationObserver(syncState)
        const overlay = anchor.closest("[data-puck-overlay]")

        if (overlay) {
            observer.observe(overlay, {attributes: true, attributeFilter: ["class"]})
        }

        window.addEventListener("scroll", syncState, true)
        window.addEventListener("resize", syncState)

        return () => {
            cancelAnimationFrame(frame)
            observer.disconnect()
            window.removeEventListener("scroll", syncState, true)
            window.removeEventListener("resize", syncState)
        }
    }, [anchorRef])

    return {
        position,
        visible,
    }
}

export const UIEditorActionBarComponent = (props: {
    label?: string
    children: React.ReactNode
    parentAction: React.ReactNode
}): React.ReactElement => {
    const {children, parentAction} = props
    const anchorRef = React.useRef<HTMLDivElement>(null)
    const {position, visible} = useActionBarPortalState(anchorRef)
    const parentActions = React.Children.toArray(renderAction(parentAction)).filter(Boolean) as PictorButtonElement[]
    const elementActions = React.Children.toArray(React.Children.map(children, renderAction)).filter(Boolean) as PictorButtonElement[]

    const actionBar = (
        <Flex
            align={"center"}
            style={{
                gap: "0.35rem",
                position: "fixed",
                top: position?.top ?? 8,
                right: position?.right ?? 8,
                zIndex: 10000,
                pointerEvents: "auto",
            }}
        >
            {parentActions.length > 0 && <ButtonGroup children={parentActions}/>}
            {elementActions.length > 0 && <ButtonGroup children={elementActions}/>}
        </Flex>
    )

    return (
        <>
            <div ref={anchorRef}/>
            {typeof document === "undefined" || !position || !visible ? null : createPortal(actionBar, document.body)}
        </>
    )
}
