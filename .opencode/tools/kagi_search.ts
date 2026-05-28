import { tool } from "@opencode-ai/plugin/tool"
import { searchKagi, formatSearchResults } from "./_kagi"

export const search = tool({
  description:
    "Search the web using Kagi's premium search engine. This is the explicit `kagi_search` tool — the same backend that powers the `websearch` override.",

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

  async execute(args) {
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
