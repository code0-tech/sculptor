import {NextRequest, NextResponse} from "next/server"

export const dynamic = "force-dynamic"

interface SupportProxyContext {
    params: Promise<{ path: string[] }>
}

const proxy = async (request: NextRequest, path: string[]): Promise<NextResponse> => {

    const supportUrl = process.env.LIBREDESK_URL
    const inboxId = process.env.LIBREDESK_INBOX_ID
    const cloud = (process.env.NEXT_PUBLIC_EDITION || "ce") === "cloud"

    if (!cloud || !supportUrl || !inboxId) {
        return NextResponse.json({error: "Support chat is not configured"}, {status: 404})
    }

    if (!path?.length || !["chat", "media"].includes(path[0])) {
        return NextResponse.json({error: "Not found"}, {status: 404})
    }

    const search = new URLSearchParams(request.nextUrl.searchParams)

    search.set("inbox_id", inboxId)

    const sessionToken = request.headers.get("x-support-session")
    const contentType = request.headers.get("content-type")

    const response = await fetch(`${supportUrl}/api/v1/widget/${path.join("/")}?${search.toString()}`, {
        method: request.method,
        headers: {
            "X-Libredesk-Inbox-ID": inboxId,
            ...(sessionToken ? {authorization: `Bearer ${sessionToken}`} : {}),
            ...(contentType ? {"content-type": contentType} : {})
        },
        body: request.method === "GET" ? undefined : await request.arrayBuffer(),
        cache: "no-store"
    }).catch(() => undefined)

    if (!response) return NextResponse.json({error: "Support chat is unavailable"}, {status: 502})

    const disposition = response.headers.get("content-disposition")

    return new NextResponse(await response.arrayBuffer(), {
        status: response.status,
        headers: {
            "content-type": response.headers.get("content-type") || "application/json",
            "cache-control": "no-store",
            ...(disposition ? {"content-disposition": disposition} : {})
        }
    })
}

export async function GET(request: NextRequest, context: SupportProxyContext) {

    const {path} = await context.params

    return proxy(request, path)
}

export async function POST(request: NextRequest, context: SupportProxyContext) {

    const {path} = await context.params

    return proxy(request, path)
}
