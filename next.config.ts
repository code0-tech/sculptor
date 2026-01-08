import type {NextConfig} from "next";
import path from "node:path";

const EDITION = process.env.EDITION ?? "ce";
const SAGITTARIUS_GRAPHQL_URL = process.env.SAGITTARIUS_GRAPHQL_URL ?? 'http://localhost:3010/graphql';

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
`

const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: cspHeader.replace(/\n/g, ''),
                    },
                    {
                        key: "X-Frame-Options",
                        value: "DENY"
                    }
                ],
            },
        ]
    },
    env: {
        NEXT_PUBLIC_edition: EDITION,
        NEXT_PUBLIC_pictorVersion: "11"
    },
    reactStrictMode: true,
    reactCompiler: true,
    turbopack: {
        resolveAlias: {
            "@edition": path.resolve(__dirname, `src/packages/${EDITION}/src`),
            "@core": path.resolve(__dirname, "src/packages/core/src"),
        },
        rules: {
            "*.graphql": {
                loaders: ["graphql-tag/loader"],
                as: "*.js"
            },
        },
    },
    rewrites: () => {
        return [
            {
                source: '/graphql',
                destination: SAGITTARIUS_GRAPHQL_URL // Proxy to Backend
            }
        ];
    }
};

export default nextConfig;
