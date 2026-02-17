import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const edition = process.env.EDITION ?? "ce";
const target = path.join(root, `./src/packages/${edition}`);

const editionImports = {
    cloud: ["./src/packages/cloud/src/*", "./src/packages/ee/src/*", "./src/packages/ce/src/*"],
    ee: ["./src/packages/ee/src/*", "./src/packages/ce/src/*"],
    ce: ["./src/packages/ce/src/*"],
}

if (!fs.existsSync(target) || !editionImports[edition]) {
    console.error(`[set-edition] Edition not found: ${target}`);
    process.exit(1);
}

const tsconfig = path.join(root, 'tsconfig.json');
const tsconf = JSON.parse(fs.readFileSync(tsconfig));
tsconf.compilerOptions.paths['@edition/*'] = editionImports[edition];
fs.writeFileSync(tsconfig, JSON.stringify(tsconf, null, 2));

console.log(`[set-edition] current -> ${edition}`);

const lockPath = path.join(root, 'package-lock.json');
const lock = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
const sculptorVersion = (lock.packages && lock.packages[""].version) || '0.0.0';
const pictorVersion = (lock.packages && lock.packages["node_modules/@code0-tech/pictor"] && lock.packages["node_modules/@code0-tech/pictor"].version) || '0.0.0';

const envPath = path.join(root, '.env.local');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {}

envContent = envContent
  .replace(/^NEXT_PUBLIC_SCULPTOR_VERSION=.*$/m, `NEXT_PUBLIC_SCULPTOR_VERSION=${sculptorVersion}`)
  .replace(/^NEXT_PUBLIC_PICTOR_VERSION=.*$/m, `NEXT_PUBLIC_PICTOR_VERSION=${pictorVersion}`);

fs.writeFileSync(envPath, envContent.trim(), 'utf-8');
console.log(`[set-edition] Versions written to .env.local`);
