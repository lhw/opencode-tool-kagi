import { extractTool } from "./_factories"

export const extract = extractTool(
  "Extract clean markdown content from 1–10 URLs using Kagi's Extract API. " +
    "Returns rendered text content stripped of ads and navigation — ideal for reading articles, docs, and web pages.",
)
