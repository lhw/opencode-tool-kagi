import { z } from "zod"
import { searchKagi, formatSearchResults } from "./_kagi"

const tool = Object.assign((i: Record<string, unknown>) => i, { schema: z })

export default tool({
  description:
    "Search the web using Kagi's premium search engine. " +
    "Provides high-quality, ad-free, privacy-respecting search results with rich snippets, news, and direct answers.",
  args: {
    query: tool.schema.string().describe("The search query to look up"),
    limit: tool.schema.number().optional().describe("Maximum number of web results to return (1–1024, default 10)"),
    workflow: tool.schema.enum(["search", "images", "videos", "news", "podcasts"]).optional().describe("Type of search results to return"),
    lens_id: tool.schema.string().optional().describe("Kagi Lens identifier for specialized search"),
    safe_search: tool.schema.boolean().optional().describe("Filter NSFW content when true"),
  },
  async execute(args: { query: string; limit?: number; workflow?: string; lens_id?: string; safe_search?: boolean }) {
    const result = await searchKagi(args)
    if (!result.ok) return result.error
    return formatSearchResults(result.data, args.query)
  },
})
