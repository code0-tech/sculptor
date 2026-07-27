import type {NextConfig} from "next";
import path from "node:path";

const EDITION = process.env.EDITION ?? "ce";
const SAGITTARIUS_GRAPHQL_URL = process.env.SAGITTARIUS_GRAPHQL_URL ?? 'http://localhost:3010/graphql';
const SAGITTARIUS_CABLE_URL = process.env.SAGITTARIUS_CABLE_URL ?? 'http://localhost:3010/cable';

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self';
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    worker-src 'self' blob: data: *;
    connect-src 'self' ${SAGITTARIUS_GRAPHQL_URL} ${SAGITTARIUS_CABLE_URL.replace("http", "ws")} ${process.env.NEXT_PUBLIC_OTEL_LOGS_ENDPOINT} ${process.env.NEXT_PUBLIC_OTEL_TRACES_ENDPOINT};
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
    reactStrictMode: true,
    // Enable React Compiler in production builds only. In dev it forces a
    // per-file Babel pass (the compiler is a Babel plugin) which is the
    // dominant cost of Turbopack dev compile time and memory here.
    reactCompiler: process.env.NODE_ENV === "production",
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
            "*.svg": {
                loaders: ["@svgr/webpack"],
                as: "*.js"
            },
        },
    },
    rewrites: () => {
        return [
            {
                source: '/graphql',
                destination: SAGITTARIUS_GRAPHQL_URL // Proxy to Backend
            },
            {
                source: '/cable',
                destination: SAGITTARIUS_CABLE_URL // Proxy to Backend
            }
        ];
    }
};

export default nextConfig;
