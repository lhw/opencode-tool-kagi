import { Plugin } from "@opencode/plugin"
import {
  searchKagi,
  extractPages,
  formatExtract,
  type KagiResult,
} from "../.opencode/tools/_kagi"

function publishedAt(time?: string): { published?: number } {
  if (!time) return {}
  const ms = Date.parse(time)
  return Number.isNaN(ms) ? {} : { published: ms }
}

export function toWebResults(results: KagiResult[]) {
  return results.map((r) => ({
    url: r.url,
    title: r.title,
    content: r.snippet,
    time: publishedAt(r.time),
  }))
}

const EXTRACT_INPUT = {
  type: "object",
  properties: {
    urls: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      maxItems: 10,
      description: "Array of 1–10 HTTP(S) URLs to extract content from",
    },
    timeout: {
      type: "number",
      description: "Time budget in seconds for the bulk extraction (clamped by Kagi)",
    },
    max_chars: {
      type: "number",
      description: "Maximum characters to return per URL (default: no limit)",
    },
  },
  required: ["urls"],
  additionalProperties: false,
}

const WEBFETCH_INPUT = {
  type: "object",
  properties: {
    url: { type: "string", description: "A single HTTP(S) URL to fetch" },
    format: {
      type: "string",
      enum: ["markdown", "text", "html"],
      description: "Accepted for compatibility with the built-in tool; Kagi always returns markdown",
    },
    timeout: { type: "number", description: "Time budget in seconds for the extraction" },
  },
  required: ["url"],
  additionalProperties: false,
}

export default Plugin.define({
  id: "opencode-tool-kagi",
  async setup(ctx) {
    const cwd = ctx.location.directory
    const options = ctx.options as { websearch?: boolean; webfetch?: boolean; extract?: boolean }

    await ctx.integration.transform((editor) => {
      editor.update("kagi", (integration) => {
        integration.name = "Kagi"
      })
      editor.method.update({
        integrationID: "kagi",
        method: { type: "key", label: "Kagi API key" },
      })
      editor.method.update({
        integrationID: "kagi",
        method: { type: "env", names: ["KAGI_API_KEY"] },
      })
    })

    const resolveKey = async () => {
      const connection = await ctx.integration.connection.active("kagi")
      if (!connection) return undefined
      const credential = await ctx.integration.connection.resolve(connection)
      return credential?.type === "key" ? credential.key : undefined
    }

    if (options.websearch !== false) {
      await ctx.websearch.transform((editor) => {
        editor.add({
          id: "kagi",
          name: "Kagi",
          async execute({ query }) {
            const result = await searchKagi({ query, limit: 10, cwd, key: await resolveKey() })
            if (!result.ok) throw new Error(result.error)
            const d = result.data.data
            const results = d?.search?.length ? d.search : [...(d?.directAnswer ?? []), ...(d?.news ?? [])]
            return toWebResults(results)
          },
        })
        editor.default.set("kagi")
      })
    }

    if (options.webfetch !== false) {
      await ctx.tool.transform((editor) => {
        editor.add({
          name: "webfetch",
          description:
            "Fetch and extract clean markdown content from a URL using Kagi's Extract API. " +
            "Replaces the built-in webfetch — strips ads, navigation, and cruft, returns proper markdown.",
          input: WEBFETCH_INPUT,
          async execute(input) {
            const { url, timeout, max_chars } = input as {
              url: string
              timeout?: number
              max_chars?: number
            }
            const result = await extractPages([url], { timeout, cwd, key: await resolveKey() })
            if (!result.ok) return { content: result.error }
            const pages = result.data.data ?? []
            const trace = result.data.meta?.trace
            const output = formatExtract(pages, max_chars)
            return { content: trace ? output + `\n\n---\n*Trace: \`${trace}\`*` : output }
          },
        })
      })
    }

    if (options.extract !== false) {
      await ctx.tool.transform((editor) => {
        editor.add({
          name: "kagi_extract",
          description:
            "Extract clean markdown content from 1–10 URLs using Kagi's Extract API. " +
            "Returns rendered text content stripped of ads and navigation — ideal for reading articles, docs, and web pages.",
          input: EXTRACT_INPUT,
          async execute(input) {
            const { urls, timeout, max_chars } = input as {
              urls: string[]
              timeout?: number
              max_chars?: number
            }
            const result = await extractPages(urls, { timeout, cwd, key: await resolveKey() })
            if (!result.ok) return { content: result.error }
            const pages = result.data.data ?? []
            const trace = result.data.meta?.trace
            const output = formatExtract(pages, max_chars)
            return { content: trace ? output + `\n\n---\n*Trace: \`${trace}\`*` : output }
          },
        })
      })
    }
  },
})
