"use client"

import React from "react";
import {
    Badge,
    Button,
    Card,
    Col,
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    Flex,
    Row,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {
    IconAdjustmentsHorizontal,
    IconArrowRight,
    IconBolt,
    IconDiscount2,
    IconHeadset,
    IconSparkles
} from "@tabler/icons-react";
import BorderBeam from "border-beam";
import {animate, AnimatePresence, motion, useMotionValue, useTransform} from "framer-motion";
import {useSearchParams} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceService} from "@cloud-internal/namespace/services/Namespace.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {UserService} from "@edition/user/services/User.service";
import {getNamespaceName} from "@edition/namespace/util/Namespace.name.util";

const benefits = [
    {
        icon: IconBolt,
        title: "Up to 10k executions",
        text: "Run your flows without hitting the execution cap of this workspace.",
    },
    {
        icon: IconSparkles,
        title: "Up to 4mio AI tokens",
        text: "Higher token limits for AI actions across the whole workspace.",
    },
    {
        icon: IconAdjustmentsHorizontal,
        title: "Limits that fit you",
        text: "Scale executions and AI as you grow. Pro, Max or fully custom.",
    },
    {
        icon: IconHeadset,
        title: "Priority support",
        text: "Get faster help from our team when it matters most.",
    },
]

const discount = {
    code: "HELLO20",
    label: "20% off",
    basePrice: 8.95,
    discountedPrice: 7.16,
    durationMinutes: 30,
}

export interface UpgradeDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export const UpgradeDialogComponent: React.FC<UpgradeDialogComponentProps> = ({open, onOpenChange}) => {

    const searchParams = useSearchParams()
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const organizationService = useService(OrganizationService)
    const userService = useService(UserService)
    const [pending, startTransition] = React.useTransition()
    const [discountVisible, setDiscountVisible] = React.useState(false)
    const [remaining, setRemaining] = React.useState<number | null>(null)

    React.useEffect(() => {
        if (!open) {
            setDiscountVisible(false)
            return
        }
        const timeout = setTimeout(() => setDiscountVisible(true), 1500)
        return () => clearTimeout(timeout)
    }, [open])

    React.useEffect(() => {
        if (!discountVisible) return
        const key = `upgrade-discount-remaining-${discount.code}`
        const stored = window.localStorage.getItem(key)
        const start = stored === null ? discount.durationMinutes * 60_000 : Math.max(0, Number(stored))
        window.localStorage.setItem(key, start.toString())
        setRemaining(start)
        if (start <= 0) return
        const deadline = Date.now() + start
        const interval = setInterval(() => {
            const left = Math.max(0, deadline - Date.now())
            window.localStorage.setItem(key, left.toString())
            setRemaining(left)
            if (left <= 0) clearInterval(interval)
        }, 1000)
        return () => clearInterval(interval)
    }, [discountVisible])

    const price = useMotionValue(discount.basePrice)
    const priceLabel = useTransform(price, value => `${value.toFixed(2).replace(".", ",")}€`)

    const discountActive = discountVisible && remaining !== null && remaining > 0
    React.useEffect(() => {
        const controls = animate(price, discountActive ? discount.discountedPrice : discount.basePrice, {
            duration: 1.1,
            ease: [0.22, 1, 0.36, 1],
            delay: discountActive ? 0.25 : 0
        })
        return () => controls.stop()
    }, [discountActive, price])

    const countdown = remaining === null ? "" :
        `${Math.floor(remaining / 60_000)}:${Math.floor((remaining % 60_000) / 1000).toString().padStart(2, "0")}`

    const namespaceIndex = searchParams.get("namespace") as any as number
    const reference = searchParams.get("ref")
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`

    const namespace = React.useMemo(
        () => namespaceIndex ? namespaceService.getById(namespaceId) : undefined,
        [namespaceStore, namespaceIndex, namespaceId]
    )

    const openSubscription = () => {
        const target = window.open("about:blank", "_blank")
        startTransition(async () => {
            const [config, tokenPayload] = await Promise.all([
                fetch("/api/config").then(response => response.json()),
                userService.usersCreateCraterToken()
            ])
            const checkoutUrl = config?.checkoutUrl as string | null | undefined
            const token = tokenPayload?.token?.token
            if (!checkoutUrl || !token) {
                target?.close()
                return
            }
            const url = new URL(checkoutUrl)
            if (reference) url.searchParams.set("ref", reference)
            if (namespaceIndex) url.searchParams.set("namespace", namespaceIndex.toString())
            url.searchParams.set("token", token)
            if (target) target.location.href = url.toString()
        })
    }

    const name = namespace ? getNamespaceName(namespace, organizationService, userService) : undefined
    const subject = namespace?.parent?.__typename === "Organization"
        ? (name ? `the ${name} workspace` : "your workspace")
        : name ?? "your workspace"

    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
            <DialogOverlay/>
            <DialogContent w={"480px"}>
                <Card color={"primary"} style={{textAlign: "center", borderRadius: "calc(0.9rem)"}} mx={-0.9} mt={-0.9}>
                    <Flex align={"center"} justify={"center"} style={{gap: "0.7rem"}}>
                        <BorderBeam style={{display: "inline-block", transform: "rotate(-10deg)"}} strength={1}
                                    colorVariant={"mono"} size={"sm"} theme={"dark"} duration={5}>
                            <Card w={"50px"} h={"50px"} display={"flex"}
                                  align={"center"} justify={"center"}>
                                <Text style={{fontWeight: "bold"}}>
                                    PRO
                                </Text>
                            </Card>
                        </BorderBeam>
                        <Text>or</Text>
                        <BorderBeam style={{display: "inline-block", transform: "rotate(10deg)"}} strength={1}
                                    colorVariant={"sunset"} size={"sm"} theme={"dark"} duration={5}>
                            <Card w={"50px"} h={"50px"} display={"flex"}
                                  align={"center"} justify={"center"}>
                                <Text style={{fontWeight: "bold"}}>
                                    MAX
                                </Text>
                            </Card>
                        </BorderBeam>
                    </Flex>
                    <Spacing spacing={"xl"}/>
                    <Text size={"xl"} hierarchy={"primary"}>
                        {`Upgrade ${subject}`}
                    </Text>
                    <Spacing spacing={"xs"}/>
                    <Text size={"sm"} hierarchy={"tertiary"}>
                        Unlock higher limits for executions and AI usage.
                        <br/>
                        Pick the plan that fits. Pro, Max or fully custom.
                    </Text>
                </Card>
                <Spacing mb={2.6} spacing={"xl"}/>
                <Row>
                    {benefits.map(benefit => {
                        const Icon = benefit.icon
                        return <Col key={benefit.title} xs={6} mb={1.3}>
                            <Flex style={{gap: "0.7rem"}}>
                                <Icon size={16} style={{minWidth: "16px", minHeight: "16px"}}/>
                                <Flex style={{flexDirection: "column", gap: "0.35rem", minWidth: 0}}>
                                    <Text size={"md"} hierarchy={"primary"} fw={500}>{benefit.title}</Text>
                                    <Text size={"sm"} hierarchy={"tertiary"}>{benefit.text}</Text>
                                </Flex>
                            </Flex>
                        </Col>
                    })}
                </Row>
                <Spacing spacing={"xl"}/>
                <Flex justify={"space-between"} align={"baseline"}>
                    <Text>
                        Full access starts at
                    </Text>
                    <Flex style={{gap: "0.35rem", alignItems: "baseline"}}>
                        <motion.div style={{transformOrigin: "right bottom"}}
                                    animate={discountActive ? {opacity: 0.4, scale: 0.65} : {opacity: 1, scale: 1}}
                                    transition={{duration: 0.5, ease: [0.22, 1, 0.36, 1]}}>
                            <Text fz={1.6} hierarchy={"primary"}
                                  style={{textDecoration: discountActive ? "line-through" : "none"}}>
                                {`${discount.basePrice.toFixed(2).replace(".", ",")}€`}
                            </Text>
                        </motion.div>
                        <AnimatePresence>
                            {discountActive && <motion.div initial={{opacity: 0, x: 10, scale: 0.7}}
                                                            animate={{opacity: 1, x: 0, scale: 1}}
                                                            exit={{opacity: 0, x: 10, scale: 0.7}}
                                                            transition={{type: "spring", stiffness: 420, damping: 22}}>
                                <Text fz={1.6} hierarchy={"primary"}
                                      style={{fontVariantNumeric: "tabular-nums"}}>
                                    <motion.span>{priceLabel}</motion.span>
                                </Text>
                            </motion.div>}
                        </AnimatePresence>
                        <Text hierarchy={"tertiary"}>
                            /per month
                        </Text>
                    </Flex>
                </Flex>
                <AnimatePresence>
                    {discountActive && <motion.div initial={"hidden"} animate={"shown"} exit={"hidden"}
                                                   variants={{
                                                       hidden: {opacity: 0, y: 10},
                                                       shown: {
                                                           opacity: 1,
                                                           y: 0,
                                                           transition: {
                                                               duration: 0.45,
                                                               ease: [0.22, 1, 0.36, 1],
                                                               delay: 0.15,
                                                               when: "beforeChildren",
                                                               staggerChildren: 0.09
                                                           }
                                                       }
                                                   }}>
                        <Spacing spacing={"xs"}/>
                        <Card color={"info"} paddingSize={"md"} style={{overflow: "hidden"}}>
                            <motion.div initial={{x: "-150%"}} animate={{x: "360%"}}
                                        transition={{duration: 1.2, ease: "easeInOut", delay: 0.6}}
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            bottom: 0,
                                            left: 0,
                                            width: "45%",
                                            pointerEvents: "none",
                                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)"
                                        }}/>
                            <Flex align={"center"} justify={"space-between"} style={{gap: "0.7rem"}}>
                                <Flex align={"center"} style={{gap: "0.7rem", minWidth: 0}}>
                                    <motion.div style={{display: "flex", flexShrink: 0}}
                                                variants={{
                                                    hidden: {scale: 0.2, opacity: 0, rotate: -20},
                                                    shown: {
                                                        scale: 1,
                                                        opacity: 1,
                                                        rotate: 0,
                                                        transition: {type: "spring", stiffness: 400, damping: 16}
                                                    }
                                                }}>
                                        <IconDiscount2 size={16}
                                                       style={{minWidth: "16px", minHeight: "16px", flexShrink: 0}}/>
                                    </motion.div>
                                    <motion.div style={{minWidth: 0}}
                                                variants={{
                                                    hidden: {opacity: 0, x: -8},
                                                    shown: {opacity: 1, x: 0}
                                                }}>
                                    <Flex style={{flexDirection: "column", minWidth: 0}}>
                                        <Text display={"inline"} style={{verticalAlign: "baseline"}} size={"md"} hierarchy={"tertiary"} fw={500}>
                                            {"Use "}
                                            <Text display={"inline"} style={{verticalAlign: "baseline"}} size={"md"} hierarchy={"primary"} fw={500}>{discount.code}</Text>
                                            {` for ${discount.label}`}
                                        </Text>
                                        <Text size={"sm"} hierarchy={"tertiary"}>
                                            Once the timer runs out, this code is gone.
                                        </Text>
                                    </Flex>
                                    </motion.div>
                                </Flex>
                                <motion.div style={{flexShrink: 0}}
                                            variants={{
                                                hidden: {opacity: 0, scale: 0.7},
                                                shown: {
                                                    opacity: 1,
                                                    scale: 1,
                                                    transition: {type: "spring", stiffness: 380, damping: 18}
                                                }
                                            }}>
                                    <Text fz={1.6} hierarchy={"primary"}
                                          style={{fontVariantNumeric: "tabular-nums"}}>
                                        {countdown}
                                    </Text>
                                </motion.div>
                            </Flex>
                        </Card>
                    </motion.div>}
                </AnimatePresence>
                <Spacing spacing={"xs"}/>
                <BorderBeam strength={1} size={"line"} theme={"dark"} duration={5} style={{display: "block"}}>
                    <Button color={"tertiary"} paddingSize={"xxs"} disabled={pending}
                            onClick={openSubscription} justify={"center"} w={"100%"}>
                        Choose your plan
                        <IconArrowRight size={16}/>
                    </Button>
                </BorderBeam>
            </DialogContent>
        </DialogPortal>
    </Dialog>
}
