import type {NextConfig} from "next";
import path from "node:path";

const EDITION = process.env.EDITION ?? "ce";
const SAGITTARIUS_GRAPHQL_URL = process.env.SAGITTARIUS_GRAPHQL_URL ?? 'http://localhost:3010/graphql';
const SAGITTARIUS_CABLE_URL = process.env.SAGITTARIUS_CABLE_URL ?? 'http://localhost:3010/cable';

const nextConfig: NextConfig = {
    output: "standalone",
    devIndicators: false,
    allowedDevOrigins: (process.env.ALLOWED_DEV_ORIGINS ?? "192.168.*.*,10.*.*.*,*.local")
        .split(",")
        .map(origin => origin.trim())
        .filter(Boolean),
    async headers() {
        return [
            {
                // The Content-Security-Policy is set in src/middleware.ts so that
                // runtime configured origins are honoured. Headers declared here are
                // baked in at build time and cannot reflect them.
                source: '/((?!playground(?:/|$)).*)',
                headers: [
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
    // Rewrite barrel imports from the code0 UI packages into direct submodule
    // imports. Without this, each of the ~186 files importing from
    // "@code0-tech/pictor" pulls the entire dist/index.js barrel (~364 modules)
    // into that route's Turbopack compile graph. This is the dominant dev
    // compile cost. date-fns/lodash/@radix-ui are already optimized by default.
    experimental: {
        optimizePackageImports: [
            "@code0-tech/pictor",
            "@code0-tech/triangulum",
        ],
    },
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
