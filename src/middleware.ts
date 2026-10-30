import type {NextRequest} from 'next/server'
import {middleware as editionMiddleware} from "@edition/Middleware";

export function middleware(request: NextRequest) {
    const response = editionMiddleware(request)

    // The policy is set here rather than in next.config so that runtime
    // configured origins (support chat, telemetry, backend) are picked up
    // without a rebuild. Only the playground may be framed.
    const frameAncestors = request.nextUrl.pathname.startsWith('/playground')
        ? (process.env.PLAYGROUND_FRAME_ANCESTORS || "'self'")
        : "'none'"

    const graphqlUrl = process.env.SAGITTARIUS_GRAPHQL_URL || 'http://localhost:3010/graphql'
    const cableUrl = process.env.SAGITTARIUS_CABLE_URL || 'http://localhost:3010/cable'
    const supportUrl = process.env.LIBREDESK_URL || ''

    response.headers.set('Content-Security-Policy', `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: blob: ${supportUrl};
        font-src 'self' data:;
        media-src 'self';
        frame-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors ${frameAncestors};
        worker-src 'self' blob: data: *;
        connect-src 'self' ${graphqlUrl} ${cableUrl.replace("http", "ws")} ${process.env.NEXT_PUBLIC_OTEL_LOGS_ENDPOINT || ''} ${process.env.NEXT_PUBLIC_OTEL_TRACES_ENDPOINT || ''} ${supportUrl.replace(/^http/, "ws")};
    `.replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim())

    return response
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|graphql).*)'],
}
