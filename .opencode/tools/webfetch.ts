import { extractTool } from "./_factories"

export default extractTool(
  "Fetch and extract clean markdown content from URLs using Kagi's Extract API. " +
    "Replaces the built-in webfetch — strips ads, navigation, and cruft, returns proper markdown.",
  true,
)
