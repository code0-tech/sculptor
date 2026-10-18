"use client"

import {ErrorPage} from "@edition/error/pages/ErrorPage";

export default function Error({error, retry}: { error: Error & { digest?: string }, retry: () => void }) {
    return <ErrorPage error={error} retry={retry}/>
}
