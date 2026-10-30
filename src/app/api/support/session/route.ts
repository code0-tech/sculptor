import {NextRequest, NextResponse} from "next/server"
import {createHmac} from "node:crypto"
import {isLicenseActive, licensePlanNames} from "@core/util/license"
import {License} from "@code0-tech/sagittarius-graphql-types"

export const dynamic = "force-dynamic"

interface SupportChatWorkspace {
    id: string
    currentLicense?: {
        startDate?: string | null
        endDate?: string | null
        options?: { plan?: string | null } | null
    } | null
}

interface SupportChatUser {
    id: string
    email: string
    firstname?: string | null
    lastname?: string | null
    username?: string | null
    admin?: boolean | null
    createdAt?: string | null
    emailVerifiedAt?: string | null
    mfaStatus?: { enabled?: boolean | null } | null
    namespaceMemberships?: { nodes?: ({ namespace?: SupportChatWorkspace | null } | null)[] | null } | null
}

export async function POST(request: NextRequest) {

    const secret = process.env.LIBREDESK_SECRET
    const supportUrl = process.env.LIBREDESK_URL
    const inboxId = process.env.LIBREDESK_INBOX_ID
    const cloud = (process.env.NEXT_PUBLIC_EDITION || "ce") === "cloud"

    if (!cloud || !secret || !supportUrl || !inboxId) {
        return NextResponse.json({error: "Support chat is not configured"}, {status: 404})
    }

    const authorization = request.headers.get("authorization")

    if (!authorization) return NextResponse.json({error: "Unauthorized"}, {status: 401})

    const queried = await fetch(process.env.SAGITTARIUS_GRAPHQL_URL || "http://localhost:3010/graphql", {
        method: "POST",
        headers: {"Content-Type": "application/json", authorization},
        body: JSON.stringify({
            query: `query SupportUser {
                currentUser {
                    id
                    email
                    firstname
                    lastname
                    username
                    admin
                    createdAt
                    emailVerifiedAt
                    mfaStatus { enabled }
                    namespaceMemberships(first: 50) {
                        nodes {
                            namespace {
                                id
                                currentLicense {
                                    startDate
                                    endDate
                                    options { plan }
                                }
                            }
                        }
                    }
                }
            }`
        }),
        cache: "no-store"
    })
        .then(response => response.json())
        .then(body => body?.data?.currentUser as SupportChatUser | undefined)
        .catch(() => undefined)

    const user = queried?.email ? queried : undefined

    if (!user) return NextResponse.json({error: "Unauthorized"}, {status: 401})

    const forwardedHost = request.headers.get("x-forwarded-host")
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https"
    const appUrl = forwardedHost ? `${forwardedProto}://${forwardedHost}` : request.nextUrl.origin

    const licenses = (user.namespaceMemberships?.nodes ?? [])
        .flatMap(node => node?.namespace?.currentLicense ? [node.namespace.currentLicense] : [])
        .filter(license => isLicenseActive(license as License))

    const plans = licenses
        .map(license => license.options?.plan)
        .flatMap(plan => plan ? [licensePlanNames[plan] ?? plan] : ["Subscription"])

    const claims = {
        external_user_id: user.id,
        email: user.email,
        first_name: user.firstname || user.email.split("@")[0],
        last_name: user.lastname || "",
        exp: Math.floor(Date.now() / 1000) + (Number(process.env.LIBREDESK_TOKEN_TTL_MINUTES) || 720) * 60,
        contact_custom_attributes: {
            account_url: `${appUrl}/users/${user.id.split("/").pop()}`,
            username: user.username ?? "",
            instance_admin: !!user.admin,
            email_verified: !!user.emailVerifiedAt,
            mfa_enabled: !!user.mfaStatus?.enabled,
            member_since: user.createdAt?.slice(0, 10) ?? "",
            workspaces: user.namespaceMemberships?.nodes?.length ?? 0,
            paid_workspaces: licenses.length,
            plans: [...new Set(plans)].join(", ") || "Free",
            edition: process.env.NEXT_PUBLIC_EDITION || "cloud",
            version: process.env.NEXT_PUBLIC_SCULPTOR_VERSION || "0.0.0"
        }
    }

    const header = Buffer.from(JSON.stringify({alg: "HS256", typ: "JWT"})).toString("base64url")
    const payload = Buffer.from(JSON.stringify(claims)).toString("base64url")
    const content = `${header}.${payload}`
    const jwt = `${content}.${createHmac("sha256", secret).update(content).digest("base64url")}`

    const exchange = await fetch(`${supportUrl}/api/v1/widget/chat/auth/exchange`, {
        method: "POST",
        headers: {"Content-Type": "application/json", "X-Libredesk-Inbox-ID": inboxId},
        body: JSON.stringify({jwt}),
        cache: "no-store"
    })
        .then(response => response.ok ? response.json() : undefined)
        .catch(() => undefined)

    if (!exchange?.data?.session_token) {
        return NextResponse.json({error: "Support chat is unavailable"}, {status: 502})
    }

    return NextResponse.json({
        sessionToken: exchange.data.session_token,
        user: exchange.data.user,
        inboxId,
        socketUrl: `${supportUrl.replace(/^http/, "ws")}/widget/ws`
    }, {headers: {"Cache-Control": "no-store"}})
}
