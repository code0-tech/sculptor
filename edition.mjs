// scripts/set-edition.mjs
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const edition = process.env.EDITION ?? "ce";
const current = path.join(root, "src/packages/ce");
const target = path.join(root, `src/packages/${edition}`);

if (!fs.existsSync(target)) {
    console.error(`[set-edition] Edition not found: ${target}`);
    process.exit(1);
}
try { fs.rmSync(current, { recursive: true, force: true }); } catch {}
fs.symlinkSync(target, current, "junction");
console.log(`[set-edition] current -> ${edition}`);