import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import {isValidRedirect} from "@core/util/redirect";

export function middleware(request: NextRequest) {

    const {searchParams, pathname} = request.nextUrl
    const callbackUrl = searchParams.get('callbackUrl')
    const selectNamespace = searchParams.get('selectNamespace')
    const authPaths = ["/email", "/login", "/password", "/redirect", "/register", "/callback"]
    const isAuthPath = authPaths.some(path => pathname.startsWith(path))
    const isRedirectPath = pathname.startsWith("/redirect")

    const cookieOptions = {
        path: '/',
        sameSite: 'lax' as const,
        secure: request.nextUrl.protocol === 'https:',
        maxAge: 60 * 5,
    }

    if (callbackUrl && isValidRedirect(callbackUrl)) {

        if (isRedirectPath) return NextResponse.next()
        if (!isAuthPath) {
            // Any other page: send the user on to the consent screen.
            const redirectUrl = new URL('/redirect', request.url)
            redirectUrl.searchParams.set('callbackUrl', callbackUrl)
            if (selectNamespace) redirectUrl.searchParams.set('selectNamespace', selectNamespace)
            const response = NextResponse.redirect(redirectUrl)
            response.cookies.set('codezero_callback', callbackUrl, cookieOptions)
            if (selectNamespace) response.cookies.set('codezero_selectNamespace', selectNamespace, cookieOptions)
            return response
        }

        const redirectUrl = request.nextUrl.clone()
        redirectUrl.searchParams.delete('callbackUrl')
        redirectUrl.searchParams.delete('selectNamespace')
        const response = NextResponse.redirect(redirectUrl)
        response.cookies.set('codezero_callback', callbackUrl, cookieOptions)
        if (selectNamespace) response.cookies.set('codezero_selectNamespace', selectNamespace, cookieOptions)
        return response
    }

    const callbackCookie = request.cookies.get('codezero_callback')?.value
    const selectNamespaceCookie = request.cookies.get('codezero_selectNamespace')?.value

    if (callbackCookie) {
        if (!isAuthPath) {
            const redirectUrl = new URL('/redirect', request.url)
            redirectUrl.searchParams.set('callbackUrl', callbackCookie)
            if (selectNamespaceCookie) redirectUrl.searchParams.set('selectNamespace', selectNamespaceCookie)
            return NextResponse.redirect(redirectUrl)
        }

        if (isRedirectPath && !searchParams.has('callbackUrl')) {
            const url = request.nextUrl.clone()
            url.searchParams.set('callbackUrl', callbackCookie)
            if (selectNamespaceCookie) url.searchParams.set('selectNamespace', selectNamespaceCookie)
            return NextResponse.redirect(url)
        }
    }

    return NextResponse.next()
}
