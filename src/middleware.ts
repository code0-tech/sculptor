import type {NextRequest} from 'next/server'
import {middleware as editionMiddleware} from "@edition/Middleware";

export function middleware(request: NextRequest) {
    return editionMiddleware(request)
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|graphql).*)'],
}
