import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import {isValidRedirect} from "@core/util/redirect";

export function middleware(request: NextRequest) {

    const {searchParams, pathname} = request.nextUrl
    console.log(pathname)
    const callbackUrl = searchParams.get('callbackUrl')
    const authPaths = ["/email", "/login", "/password", "/redirect", "/register"]
    const isAuthPath = authPaths.some(path => pathname.startsWith(path))

    if (callbackUrl && isValidRedirect(callbackUrl)) {
        let response: NextResponse

        if (isAuthPath) {
            response = NextResponse.next()
        } else {
            const redirectUrl = new URL('/redirect', request.url)
            redirectUrl.searchParams.set('callbackUrl', callbackUrl)
            response = NextResponse.redirect(redirectUrl)
        }

        response.cookies.set('codezero_callback', callbackUrl, {
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 5,
        })

        return response
    }

    const callbackCookie = request.cookies.get('codezero_callback')?.value

    if (callbackCookie) {
        if (!isAuthPath) {
            const redirectUrl = new URL('/redirect', request.url)
            redirectUrl.searchParams.set('callbackUrl', callbackCookie)
            return NextResponse.redirect(redirectUrl)
        }

        if (pathname.startsWith("/redirect")) {
            const url = request.nextUrl.clone()
            if (!searchParams.has('callbackUrl')) {
                url.searchParams.set('callbackUrl', callbackCookie)
                return NextResponse.redirect(url)
            }
        }
    }

    return NextResponse.next()

}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|graphql).*)'],
}
