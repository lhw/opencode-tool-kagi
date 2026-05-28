# opencode-tool-kagi

OpenCode custom tools powered by the [Kagi API](https://kagi.com/api/docs/openapi) — replaces built-in `websearch`/`webfetch` with Kagi's premium search and extraction.

| Tool | Replaces built-in | Description |
|------|-------------------|-------------|
| `websearch` | ✅ `websearch` | Premium web search via Kagi |
| `webfetch` | ✅ `webfetch` | Fetch and extract markdown from URLs |
| `kagi_extract` | — | Explicit extract markdown content from URLs |
| `kagi_search` | — | Explicit Kagi premium web search |

## Setup

```bash
npx kagi-tools
```

Or locally:

```bash
npm run setup
```

The interactive wizard guides you through:

- **Install scope** — per-project (`.opencode/tools/`) or global (`~/.config/opencode/tools/`)
- **Tools selection** — all tools with built-in overrides, or just `kagi_search`/`kagi_extract`
- **API key** — optional; set it now or later via `KAGI_API_KEY` env var

### Requirements

- OpenCode (any version)
- Node.js >= 18
- A [Kagi API key](https://kagi.com/api/keys)

## Usage

Once installed, use the tools directly in opencode:

```
> websearch "latest ai research papers 2026"
> webfetch https://example.com/article
> kagi_extract urls: ["https://example.com/article"]
> kagi_search query:"rust programming" limit:20
```

## Tools

### `websearch`

Overrides the built-in `websearch` with Kagi's premium search.

| Arg | Type | Required | Description |
|-----|------|----------|-------------|
| `query` | `string` | ✅ | Search query |
| `limit` | `number` | — | Max results (1–1024, default 10) |
| `workflow` | `enum` | — | `search`, `images`, `videos`, `news`, `podcasts` |
| `lens_id` | `string` | — | Kagi Lens for focused results |
| `safe_search` | `boolean` | — | Filter NSFW content |

### `webfetch`

Overrides the built-in `webfetch` with Kagi Extract.

| Arg | Type | Required | Description |
|-----|------|----------|-------------|
| `url` | `string` | ✅ | A single URL to fetch |

### `kagi_extract`

Explicit extract tool — clean markdown from URLs.

| Arg | Type | Required | Description |
|-----|------|----------|-------------|
| `urls` | `string[]` | ✅ | 1–10 URLs to extract |
| `max_chars` | `number` | — | Max characters per URL |

### `kagi_search`

Explicit search tool — Kagi premium search without overriding the built-in.

| Arg | Type | Required | Description |
|-----|------|----------|-------------|
| `query` | `string` | ✅ | Search query |
| `limit` | `number` | — | Max results (1–1024, default 10) |
| `workflow` | `enum` | — | `search`, `images`, `videos`, `news`, `podcasts` |
| `lens_id` | `string` | — | Kagi Lens for focused results |
| `safe_search` | `boolean` | — | Filter NSFW content |
