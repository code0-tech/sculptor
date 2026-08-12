import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import {isValidRedirect} from "@core/util/redirect";

export function middleware(request: NextRequest) {

    const {searchParams, pathname} = request.nextUrl
    const callbackUrl = searchParams.get('callbackUrl')
    const selectNamespace = searchParams.get('selectNamespace')
    const cancelUrl = searchParams.get('cancelUrl')
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
            if (cancelUrl) redirectUrl.searchParams.set('cancelUrl', cancelUrl)
            const response = NextResponse.redirect(redirectUrl)
            response.cookies.set('codezero_callback', callbackUrl, cookieOptions)
            if (selectNamespace) response.cookies.set('codezero_selectNamespace', selectNamespace, cookieOptions)
            if (cancelUrl) response.cookies.set('codezero_cancel', cancelUrl, cookieOptions)
            return response
        }

        const redirectUrl = request.nextUrl.clone()
        redirectUrl.searchParams.delete('callbackUrl')
        redirectUrl.searchParams.delete('selectNamespace')
        redirectUrl.searchParams.delete('cancelUrl')
        const response = NextResponse.redirect(redirectUrl)
        response.cookies.set('codezero_callback', callbackUrl, cookieOptions)
        if (selectNamespace) response.cookies.set('codezero_selectNamespace', selectNamespace, cookieOptions)
        if (cancelUrl) response.cookies.set('codezero_cancel', cancelUrl, cookieOptions)
        return response
    }

    const callbackCookie = request.cookies.get('codezero_callback')?.value
    const selectNamespaceCookie = request.cookies.get('codezero_selectNamespace')?.value
    const cancelCookie = request.cookies.get('codezero_cancel')?.value

    if (callbackCookie) {
        if (!isAuthPath) {
            const redirectUrl = new URL('/redirect', request.url)
            redirectUrl.searchParams.set('callbackUrl', callbackCookie)
            if (selectNamespaceCookie) redirectUrl.searchParams.set('selectNamespace', selectNamespaceCookie)
            if (cancelCookie) redirectUrl.searchParams.set('cancelUrl', cancelCookie)
            return NextResponse.redirect(redirectUrl)
        }

        if (isRedirectPath && !searchParams.has('callbackUrl')) {
            const url = request.nextUrl.clone()
            url.searchParams.set('callbackUrl', callbackCookie)
            if (selectNamespaceCookie) url.searchParams.set('selectNamespace', selectNamespaceCookie)
            if (cancelCookie) url.searchParams.set('cancelUrl', cancelCookie)
            return NextResponse.redirect(url)
        }
    }

    return NextResponse.next()
}
