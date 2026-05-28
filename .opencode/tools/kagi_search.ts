import { searchTool } from "./_factories"

export const search = searchTool(
  "Search the web using Kagi's premium search engine. " +
    "This is the explicit `kagi_search` tool — the same backend that powers the `websearch` override.",
)
