import { readFileSync } from "node:fs"
import { join } from "node:path"

export const API_BASE = "https://kagi.com/api/v1"

function keyFileFallbacks(): string[] {
  const home = process.env.HOME ?? process.env.USERPROFILE ?? ""
  const cwd = process.cwd()
  return [
    join(home, ".config", "opencode", "kagi-api-key"),
    join(cwd, ".opencode", "kagi-api-key"),
  ]
}

function readKeyFile(path: string): string {
  try {
    return readFileSync(path, "utf-8").trim()
  } catch {
    return ""
  }
}

export function apiKey(): string {
  const env = process.env.KAGI_API_KEY
  if (env) return env
  for (const p of keyFileFallbacks()) {
    const val = readKeyFile(p)
    if (val) return val
  }
  return ""
}

export interface KagiResult {
  url: string
  title: string
  snippet?: string
  time?: string
  props?: Record<string, unknown>
}

export interface KagiData {
  search?: KagiResult[]
  news?: KagiResult[]
  infobox?: KagiResult[]
  directAnswer?: KagiResult[]
  relatedSearch?: KagiResult[]
  adjacentQuestion?: KagiResult[]
  interestingFinds?: KagiResult[]
  interestingNews?: KagiResult[]
}

export interface KagiSearchResponse {
  data?: KagiData
  meta?: { trace?: string }
}

export type SearchParams = {
  query: string
  limit?: number
  workflow?: string
  lens_id?: string
  safe_search?: boolean
}

async function requestKagi<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const key = apiKey()
  if (!key) {
    return {
      ok: false,
      error:
        "**KAGI_API_KEY not set.** Set the `KAGI_API_KEY` environment variable with your key from https://kagi.com/api/keys",
    }
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  } catch (err) {
    return { ok: false, error: `**Network error:** ${err instanceof Error ? err.message : err}` }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "unknown error")
    const trace = res.headers.get("x-kagi-trace") ?? ""
    return {
      ok: false,
      error:
        `**Request failed (HTTP ${res.status})**` +
        (trace ? `\nTrace: \`${trace}\`` : "") +
        `\n\`\`\`\n${text.slice(0, 2000)}\n\`\`\``,
    }
  }

  try {
    const parsed = (await res.json()) as T
    return { ok: true, data: parsed }
  } catch {
    return { ok: false, error: "**Error:** Invalid JSON response from Kagi API" }
  }
}

export async function searchKagi(
  params: SearchParams,
): Promise<{ ok: true; data: KagiSearchResponse } | { ok: false; error: string }> {
  const body: Record<string, unknown> = { query: params.query, limit: params.limit ?? 10 }
  if (params.workflow) body.workflow = params.workflow
  if (params.lens_id) body.lens_id = params.lens_id
  if (params.safe_search !== undefined) body.safe_search = params.safe_search
  return requestKagi<KagiSearchResponse>("/search", body)
}

export function formatSearchResults(resp: KagiSearchResponse, query: string): string {
  const d = resp.data
  const lines: string[] = [`# Web Search: ${query}\n`]

  if (d?.directAnswer?.length) {
    const a = d.directAnswer[0]
    lines.push("## Direct Answer")
    lines.push(a.snippet ?? a.title, "")
  }

  if (d?.infobox?.length) {
    lines.push("## Infobox")
    for (const r of d.infobox) {
      lines.push(`- [${r.title}](${r.url})` + (r.snippet ? ` — ${r.snippet}` : ""))
    }
    lines.push("")
  }

  const web = d?.search ?? []
  if (web.length) {
    lines.push(`## Results (${web.length})`)
    for (const [i, r] of web.entries()) {
      lines.push(`### ${i + 1}. [${r.title}](${r.url})`)
      if (r.snippet) lines.push(r.snippet)
      if (r.time) lines.push(`> Published: ${r.time}`)
      lines.push("")
    }
  }

  if (d?.news?.length) {
    lines.push(`## News (${d.news.length})`)
    for (const r of d.news) {
      lines.push(`- [${r.title}](${r.url})` + (r.snippet ? ` — ${r.snippet}` : ""))
    }
    lines.push("")
  }

  if (d?.interestingFinds?.length) {
    lines.push("## Interesting Finds")
    for (const r of d.interestingFinds) {
      lines.push(`- [${r.title}](${r.url})` + (r.snippet ? ` — ${r.snippet}` : ""))
    }
    lines.push("")
  }

  if (d?.adjacentQuestion?.length) {
    lines.push("## Related Questions")
    for (const r of d.adjacentQuestion) {
      const q = r.props?.question as string | undefined
      if (q) lines.push(`- ${q}`)
    }
    lines.push("")
  }

  if (d?.relatedSearch?.length) {
    lines.push("## Related Searches")
    for (const r of d.relatedSearch) {
      lines.push(`- ${r.title}`)
    }
    lines.push("")
  }

  const trace = resp.meta?.trace
  if (trace) lines.push(`---\n*Trace: \`${trace}\`*`)

  return lines.join("\n").trim()
}

export interface ExtractPage {
  url: string
  markdown?: string | null
  error?: string | null
}

export interface ExtractResult {
  data?: ExtractPage[]
  meta?: { trace?: string }
}

export async function extractPages(
  urls: string[],
): Promise<{ ok: true; data: ExtractResult } | { ok: false; error: string }> {
  return requestKagi<ExtractResult>("/extract", { pages: urls.map((u) => ({ url: u })) })
}

export function formatExtract(pages: ExtractPage[], maxChars?: number): string {
  const lines: string[] = []
  for (const page of pages) {
    lines.push(`# ${page.url}`, "")
    if (page.error) {
      lines.push(`> **Error:** ${page.error}`)
    } else if (page.markdown) {
      const content = maxChars
        ? page.markdown.slice(0, maxChars) +
          (page.markdown.length > maxChars ? "\n\n*...content truncated...*" : "")
        : page.markdown
      lines.push(content)
    } else {
      lines.push("*No content returned*")
    }
    lines.push("")
  }
  return lines.join("\n").trim()
}
