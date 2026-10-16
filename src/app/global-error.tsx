"use client"

import {Inter} from "next/font/google";
import "./global.scss";
import {ErrorPage} from "@edition/error/pages/ErrorPage";

const inter = Inter({
    subsets: ['latin'],
    display: "swap",
})

export default function GlobalError({error, retry}: { error: Error & { digest?: string }, retry: () => void }) {
    return <html suppressHydrationWarning>
    <body className={inter.className}>
    <ErrorPage error={error} retry={retry}/>
    </body>
    </html>
}
