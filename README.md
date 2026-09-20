# opencode-tool-kagi

OpenCode plugin powered by the [Kagi API](https://kagi.com/api/docs/openapi) — replaces the built-in `websearch`/`webfetch` with Kagi's premium search and extraction.

| Tool | Replaces built-in | Description |
|------|-------------------|-------------|
| `websearch` | ✅ `websearch` | Premium web search via Kagi (registered as the default websearch provider) |
| `webfetch` | ✅ `webfetch` | Fetch and extract markdown from a URL |
| `kagi_extract` | — | Explicit extract markdown content from 1–10 URLs |

## Setup

### OpenCode v2 (recommended)

Install the plugin through OpenCode:

```bash
opencode plugin add opencode-tool-kagi
```

Or add it to `opencode.jsonc` yourself:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["opencode-tool-kagi"],
}
```

Plugin options can disable individual pieces:

```jsonc
{
  "plugins": [
    {
      "package": "opencode-tool-kagi",
      "options": { "websearch": true, "webfetch": true, "extract": true },
    },
  ],
}
```

### OpenCode v1 (legacy)

```bash
npx opencode-tool-kagi
```

Or locally:

```bash
npm run setup
```

The interactive wizard guides you through:

- **Install scope** — per-project (`.opencode/tools/`) or global (`~/.config/opencode/tools/`)
- **Tools selection** — all tools with built-in overrides, or just `kagi_extract`
- **API key** — optional; set it now or later via `KAGI_API_KEY` env var

### Requirements

- OpenCode v2 (plugin) or v1 (copied tools)
- Node.js >= 18 for the v1 wizard
- A [Kagi API key](https://kagi.com/api/keys)

### API key resolution

The key is looked up in this order:

1. `KAGI_API_KEY` environment variable
2. `~/.config/opencode/kagi-api-key` (global, written by the installer)
3. `.opencode/kagi-api-key` (per-project)

## Usage

Once installed, use the tools directly in opencode:

```
> websearch "latest ai research papers 2026"
> webfetch https://example.com/article
> kagi_extract urls: ["https://example.com/article"]
```

## Tools

### `websearch`

Replaces the built-in `websearch` with Kagi's premium search by registering Kagi as the default websearch provider.

### `webfetch`

Replaces the built-in `webfetch` with Kagi Extract.

| Arg | Type | Required | Description |
|-----|------|----------|-------------|
| `url` | `string` | ✅ | A single URL to fetch |
| `format` | `enum` | — | Accepted for compatibility; Kagi always returns markdown |
| `timeout` | `number` | — | Time budget in seconds for the extraction |

### `kagi_extract`

Explicit extract tool — clean markdown from URLs.

| Arg | Type | Required | Description |
|-----|------|----------|-------------|
| `urls` | `string[]` | ✅ | 1–10 URLs to extract |
| `timeout` | `number` | — | Time budget in seconds for the bulk extraction (clamped by Kagi) |
| `max_chars` | `number` | — | Max characters per URL (truncated locally) |
