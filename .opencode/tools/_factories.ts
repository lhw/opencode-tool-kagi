import { tool } from "@opencode-ai/plugin/tool"
import { searchKagi, formatSearchResults, extractPages, formatExtract } from "./_kagi"

export function searchTool(description: string) {
  return tool({
    description,
    args: {
      query: tool.schema.string().describe("The search query to look up"),

      limit: tool.schema
        .number()
        .optional()
        .describe("Maximum number of web results to return (1–1024, default 10)"),

      workflow: tool.schema
        .enum(["search", "images", "videos", "news", "podcasts"])
        .optional()
        .describe("Type of search results to return"),

      lens_id: tool.schema
        .string()
        .optional()
        .describe("Kagi Lens identifier for specialized search"),

      safe_search: tool.schema
        .boolean()
        .optional()
        .describe("Filter NSFW content when true"),
    },

    async execute(args: { query: string; limit?: number; workflow?: string; lens_id?: string; safe_search?: boolean }) {
      const result = await searchKagi({
        query: args.query,
        limit: args.limit,
        workflow: args.workflow,
        lens_id: args.lens_id,
        safe_search: args.safe_search,
      })
      if (!result.ok) return result.error
      return formatSearchResults(result.data, args.query)
    },
  })
}

export function extractTool(description: string, includeSingleUrl?: boolean) {
  return tool({
    description,
    args: {
      ...(includeSingleUrl
        ? {
            url: tool.schema
              .string()
              .describe("A single URL to fetch. Use `urls` to fetch multiple at once."),
          }
        : {}),

      urls: (includeSingleUrl
        ? tool.schema.array(tool.schema.string()).optional()
        : tool.schema.array(tool.schema.string().url()).min(1).max(10)
      ).describe("Array of 1–10 HTTP(S) URLs to extract content from"),

      max_chars: tool.schema
        .number()
        .optional()
        .describe("Maximum characters to return per URL (default: no limit)"),
    },

    async execute(args: Record<string, unknown>) {
      const targets = (args.urls as string[] | undefined) ?? (args.url ? [args.url as string] : [])
      if (targets.length === 0) {
        return "**Error:** Provide at least one URL via `url` or `urls`."
      }
      if (targets.length > 10) {
        return "**Error:** Kagi Extract API supports a maximum of 10 URLs per request."
      }

      const result = await extractPages(targets)
      if (!result.ok) return result.error

      const pages = result.data.data ?? []
      const trace = result.data.meta?.trace
      const output = formatExtract(pages, args.max_chars as number | undefined)
      if (!trace) return output
      return output + `\n\n---\n*Trace: \`${trace}\`*`
    },
  })
}
