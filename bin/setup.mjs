#!/usr/bin/env node

import { intro, outro, select, text, isCancel, cancel, note, spinner, confirm } from "@clack/prompts"
import { copyFile, mkdir, writeFile, rm } from "node:fs/promises"
import { existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_TOOLS = join(__dirname, "..", ".opencode", "tools")

const ALL = ["_kagi.ts", "kagi_search.ts", "kagi_extract.ts", "websearch.ts", "webfetch.ts"]
const KAGI_ONLY = ["_kagi.ts", "kagi_search.ts", "kagi_extract.ts"]
const PROJECT_DIR = join(process.cwd(), ".opencode", "tools")
const GLOBAL_DIR = join(process.env.HOME ?? process.env.USERPROFILE, ".config", "opencode", "tools")

if (process.argv.includes("--uninstall")) {
  intro("Uninstall Kagi Tools")
  const s = spinner()
  s.start("Removing...")
  const removed = []
  for (const dir of [PROJECT_DIR, GLOBAL_DIR]) {
    for (const f of ALL) {
      const fp = join(dir, f)
      if (existsSync(fp)) {
        await rm(fp)
        removed.push(fp)
      }
    }
    const keyFile = join(dir, "..", "kagi-api-key")
    if (existsSync(keyFile)) {
      await rm(keyFile)
      removed.push(keyFile)
    }
  }
  s.stop("Removed")
  if (removed.length) {
    note(removed.join("\n"), "Deleted files")
    outro("Restart opencode — tools are gone.")
  } else {
    outro("No Kagi tools found to uninstall.")
  }
  process.exit(0)
}

intro("Kagi Tools for OpenCode")

const location = await select({
  message: "Where do you want to install?",
  options: [
    { value: "project", label: "This project", hint: ".opencode/tools/" },
    { value: "global", label: "Global", hint: "~/.config/opencode/tools/" },
  ],
})
if (isCancel(location)) cancel("Setup cancelled")

const targetDir = location === "global" ? GLOBAL_DIR : PROJECT_DIR

const mode = await select({
  message: "Which tools do you want?",
  options: [
    { value: "all", label: "All (recommended)", hint: "overrides built-in websearch and webfetch" },
    { value: "kagi", label: "Kagi only", hint: "just kagi_search and kagi_extract" },
  ],
})
if (isCancel(mode)) cancel("Setup cancelled")

const apiKey = await text({
  message: "Enter your Kagi API key (optional — set it now or later via env var)",
  placeholder: "Get one at https://kagi.com/api/keys",
})
if (isCancel(apiKey)) cancel("Setup cancelled")

const files = mode === "kagi" ? KAGI_ONLY : ALL
const s = spinner()
s.start("Installing...")

try {
  await mkdir(targetDir, { recursive: true })

  for (const f of files) {
    await copyFile(join(REPO_TOOLS, f), join(targetDir, f))
  }

  if (apiKey) {
    const keyDir = join(targetDir, "..")
    await mkdir(keyDir, { recursive: true })
    await writeFile(join(keyDir, "kagi-api-key"), `${apiKey}\n`, { mode: 0o600 })
  }

  s.stop("Installed")
} catch (e) {
  s.stop("Failed")
  cancel(`Error: ${e.message}`)
}

note(files.map((f) => join(targetDir, f)).join("\n"), "Installed files")

const hasPlugin =
  existsSync(join(targetDir, "..", "node_modules", "@opencode-ai", "plugin")) ||
  existsSync(join(process.cwd(), "node_modules", "@opencode-ai", "plugin"))

if (!hasPlugin) {
  note(
    "If opencode complains about missing imports, install it:\n  npm install @opencode-ai/plugin",
    "Missing @opencode-ai/plugin",
  )
}

outro(
  (apiKey ? "" : "Set KAGI_API_KEY env var or add it to a config file\n") +
    "Restart opencode — Happy searching!",
)
