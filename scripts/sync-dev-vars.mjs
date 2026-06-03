import { readFileSync, writeFileSync } from "node:fs";
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

writeFileSync(".dev.vars", `OPENAI_API_KEY=${JSON.stringify(apiKey)}\n`, { mode: 0o600 });
console.log("Wrote local Worker secret metadata to .dev.vars");
