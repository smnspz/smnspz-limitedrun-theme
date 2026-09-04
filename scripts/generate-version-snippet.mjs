#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Generate `snippets/version.html` with the current theme version, ISO date,
 * and short git SHA embedded in an HTML comment. Included as the first line
 * inside `<head>` so `view-source` on the live storefront always reveals
 * which build is running.
 *
 * @returns {void}
 */
function main() {
  // Initializations
  const here = dirname(fileURLToPath(import.meta.url));
  const repoRoot = resolve(here, "..");
  const pkgPath = resolve(repoRoot, "package.json");
  const snippetPath = resolve(repoRoot, "snippets/version.html");

  // Get the current version from package.json
  const version = JSON.parse(readFileSync(pkgPath, "utf8")).version;

  // Get the current ISO date (UTC-independent yyyy-mm-dd)
  const date = new Date().toISOString().slice(0, 10);

  // Get the short git SHA; fall back to "nogit" if outside a repo
  let sha = "nogit";
  try {
    sha = execSync("git rev-parse --short HEAD", {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {}

  // Set the snippet contents
  const contents = `<!-- smnspz-limitedrun-theme v${version} · ${date} · ${sha} -->\n`;

  mkdirSync(dirname(snippetPath), { recursive: true });
  writeFileSync(snippetPath, contents);

  console.log(`wrote ${snippetPath}`);
}

main();
