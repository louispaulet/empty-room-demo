import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.argv[2] ?? "../.env.local");
const envText = readFileSync(envPath, "utf8");
const line = envText
  .split(/\r?\n/)
  .find((candidate) => candidate.trim().startsWith("OPENAI_API_KEY="));

if (!line) {
  console.error(`OPENAI_API_KEY was not found in ${envPath}`);
  process.exit(1);
}

const rawValue = line.slice(line.indexOf("=") + 1).trim();
const apiKey = rawValue.replace(/^['"]|['"]$/g, "");

if (!apiKey) {
  console.error(`OPENAI_API_KEY is empty in ${envPath}`);
  process.exit(1);
}

const child = spawn(
  "npx",
  ["wrangler", "secret", "put", "OPENAI_API_KEY", "--config", "wrangler.jsonc"],
  {
    stdio: ["pipe", "inherit", "inherit"],
    shell: process.platform === "win32",
  },
);

child.stdin.end(`${apiKey}\n`);
child.on("exit", (code) => process.exit(code ?? 1));
