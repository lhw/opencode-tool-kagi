import { z } from "zod"
import { extractPages, formatExtract } from "./_kagi"

const tool = Object.assign((i: Record<string, unknown>) => i, { schema: z })

export default tool({
  description:
    "Fetch and extract clean markdown content from URLs using Kagi's Extract API. " +
    "Replaces the built-in webfetch — strips ads, navigation, and cruft, returns proper markdown.",
  args: {
    url: tool.schema.string().describe("A single URL to fetch. Use `urls` to fetch multiple at once."),
    urls: tool.schema.array(tool.schema.string()).optional().describe("Multiple URLs to fetch in a single call (Kagi supports up to 10 per request)."),
    max_chars: tool.schema.number().optional().describe("Maximum characters to return per URL (default: no limit)"),
  },
  async execute(args: Record<string, unknown>) {
    const targets = (args.urls as string[] | undefined) ?? (args.url ? [args.url as string] : [])
    if (targets.length === 0) return "**Error:** Provide at least one URL via `url` or `urls`."
    if (targets.length > 10) return "**Error:** Kagi Extract API supports a maximum of 10 URLs per request."
    const result = await extractPages(targets)
    if (!result.ok) return result.error
    const pages = result.data.data ?? []
    const trace = result.data.meta?.trace
    const output = formatExtract(pages, args.max_chars as number | undefined)
    return trace ? output + `\n\n---\n*Trace: \`${trace}\`*` : output
  },
})
