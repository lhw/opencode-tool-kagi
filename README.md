# opencode-tool-kagi

OpenCode plugin powered by the [Kagi API](https://kagi.com/api/docs/openapi) — replaces the built-in `websearch`/`webfetch` with Kagi's premium search and extraction.

> **OpenCode v2 required.** This plugin uses the OpenCode v2 plugin system and stores
> the API key in OpenCode's credential store.

| Tool | Replaces built-in | Description |
|------|-------------------|-------------|
| `websearch` | ✅ `websearch` | Premium web search via Kagi (registered as the default websearch provider) |
| `webfetch` | ✅ `webfetch` | Fetch and extract markdown from a URL |
| `kagi_extract` | — | Extract markdown content from 1–10 URLs in one call (prefer this over repeated `webfetch` calls) |

## Setup

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

Then connect your Kagi account from the TUI — the key is stored in opencode's credential store, not in a plaintext file:

```
/connect
# Select Kagi, then paste your API key.
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

### Requirements

- OpenCode v2
- A [Kagi API key](https://kagi.com/api/keys)

### API key resolution

The key is looked up in this order:

1. The Kagi credential stored by opencode (`/connect`, or `KAGI_API_KEY` exposed as an integration connection)
2. `KAGI_API_KEY` environment variable

The plugin registers a `kagi` integration, so `/connect` manages the key through opencode's auth system.

## Usage

Once installed, use the tools directly in opencode:

```
> websearch "latest ai research papers 2026"
> webfetch https://example.com/article
> kagi_extract urls: ["https://example.com/article", "https://example.com/other"]
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

Extract clean markdown from URLs — batch multiple links into one call.

The tool descriptions tell the model to pass every URL it needs in a single `kagi_extract`
call (up to 10) rather than issuing one `webfetch` per link, so multi-link research uses
one Kagi Extract request instead of many.

| Arg | Type | Required | Description |
|-----|------|----------|-------------|
| `urls` | `string[]` | ✅ | 1–10 URLs to extract |
| `timeout` | `number` | — | Time budget in seconds for the bulk extraction (clamped by Kagi) |
| `max_chars` | `number` | — | Max characters per URL (truncated locally) |
| `format` | `enum` | — | Output format: `markdown` (default) or `json` for the raw structured Kagi response |
