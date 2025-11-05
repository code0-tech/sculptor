import type { NextConfig } from "next";
import path from "node:path";
const EDITION = process.env.EDITION ?? "ce";

const nextConfig: NextConfig = {
    turbopack: {
        resolveAlias: {
            "@edition": path.resolve(__dirname, `src/packages/${EDITION}/src`),
            "@core": path.resolve(__dirname, "src/packages/core/src"),
        },
    }
};

export default nextConfig;
