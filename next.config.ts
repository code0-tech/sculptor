import type {NextConfig} from "next";
import path from "node:path";

const EDITION = process.env.EDITION ?? "ce";

const nextConfig: NextConfig = {
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
                destination: 'http://localhost:3001/graphql' // Proxy to Backend
            }
        ];
    }
};

export default nextConfig;
