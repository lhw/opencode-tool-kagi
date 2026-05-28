import { tool } from "@opencode-ai/plugin/tool"
import { extractPages, formatExtract } from "./_kagi"

export const extract = tool({
  description:
    "Extract clean markdown content from 1–10 URLs using Kagi's Extract API. " +
    "Returns rendered text content stripped of ads and navigation — ideal for reading articles, docs, and web pages.",

  args: {
    urls: tool.schema
      .array(tool.schema.string().url())
      .min(1)
      .max(10)
      .describe("Array of 1–10 HTTP(S) URLs to extract content from"),

    max_chars: tool.schema
      .number()
      .optional()
      .describe("Maximum characters to return per URL (default: no limit)"),
  },

  async execute(args) {
    const result = await extractPages(args.urls)
    if (!result.ok) return result.error

    const pages = result.data.data ?? []
    const trace = result.data.meta?.trace
    const output = formatExtract(pages, args.max_chars)
    if (!trace) return output
    return output + `\n\n---\n*Trace: \`${trace}\`*`
  },
})
