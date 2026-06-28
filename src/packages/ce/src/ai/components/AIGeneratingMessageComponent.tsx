"use client"

import React from "react"
import {Text} from "@code0-tech/pictor"
import {motion} from "framer-motion"

const VARIANTS = [
    "Generating...",
    "Thinking...",
    "Analyzing your prompt...",
    "Composing flow...",
    "Crafting nodes...",
    "Wiring it up...",
    "Almost there...",
]

export const AIGeneratingMessageComponent: React.FC = () => {

    const [index, setIndex] = React.useState(0)

    React.useEffect(() => {
        const id = setInterval(() => setIndex(i => (i + 1) % VARIANTS.length), 4000)
        return () => clearInterval(id)
    }, [])

    return <motion.div
        key={VARIANTS[index]}
        initial={{y: 12, opacity: 0}}
        animate={{y: 0, opacity: 1}}
        exit={{y: -12, opacity: 0}}
        transition={{duration: 0.4, ease: [0.4, 0, 0.4, 1]}}
    >
        <motion.div
            style={{
                backgroundImage:
                    "linear-gradient(90deg, rgba(226,112,255,0.45) 0%, rgba(226,112,255,0.45) 40%, rgba(226,112,255,1) 50%, rgba(226,112,255,0.45) 60%, rgba(226,112,255,0.45) 100%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
            }}
            animate={{backgroundPosition: ["200% 0%", "-200% 0%"]}}
            transition={{duration: 3, ease: "linear", repeat: Infinity}}
        >
            <Text>{VARIANTS[index]}</Text>
        </motion.div>
    </motion.div>
}
