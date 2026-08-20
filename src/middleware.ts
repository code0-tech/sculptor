import type {NextRequest} from 'next/server'
import {middleware as editionMiddleware} from "@edition/Middleware";

const playgroundCsp = () => {
    const frameAncestors = process.env.PLAYGROUND_FRAME_ANCESTORS ?? "'self'"
    const graphqlUrl = process.env.SAGITTARIUS_GRAPHQL_URL ?? 'http://localhost:3010/graphql'
    const cableUrl = process.env.SAGITTARIUS_CABLE_URL ?? 'http://localhost:3010/cable'

    return `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline';
        style-src 'self' 'unsafe-inline';
        img-src 'self';
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors ${frameAncestors};
        worker-src 'self' blob: data: *;
        connect-src 'self' ${graphqlUrl} ${cableUrl.replace("http", "ws")} ${process.env.NEXT_PUBLIC_OTEL_LOGS_ENDPOINT} ${process.env.NEXT_PUBLIC_OTEL_TRACES_ENDPOINT};
    `.replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim()
}

export function middleware(request: NextRequest) {
    const response = editionMiddleware(request)

    if (request.nextUrl.pathname.startsWith('/playground')) {
        response.headers.set('Content-Security-Policy', playgroundCsp())
    }

    return response
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|graphql).*)'],
}
