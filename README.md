# opencode-tool-kagi

OpenCode plugin powered by the [Kagi API](https://kagi.com/api/docs/openapi) — adds Kagi as a native OpenCode v2 websearch provider and routes page fetching through Kagi Extract.

> **OpenCode v2 required.** This plugin uses the OpenCode v2 plugin system and stores
> the API key in OpenCode's credential store.

| Tool | How it plugs in | Description |
|------|-----------------|-------------|
| `websearch` | native search provider | Premium web search via Kagi, registered alongside the bundled providers |
| `webfetch` | overrides the built-in tool | Fetch and extract markdown from a URL |
| `kagi_extract` | plugin tool | Extract markdown content from 1–10 URLs in one call (prefer this over repeated `webfetch` calls) |

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

### Selecting Kagi for web search

The plugin registers Kagi as a websearch provider but does not choose it for you — OpenCode's normal provider
selection applies. The first web search asks which provider to use, and OpenCode remembers that choice for later
sessions.

To pin Kagi and skip the prompt, set the provider in `opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "websearch": { "provider": "kagi" },
}
```

Use `"provider": "random"` to rotate through the available providers and retry with another one when the current
provider is rate limited, or set `"websearch": false` to remove web search entirely.

Kagi is listed next to `exa`, `firecrawl`, `parallel`, `tavily`, and `tinyfish`, so you can switch provider at any
time without reinstalling anything.

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

Kagi is registered through OpenCode's websearch provider API (`ctx.websearch.transform`), the same mechanism the
bundled providers use. It runs inside the built-in `websearch` tool, so websearch permissions, provider selection, and
429/cooldown handling all work unchanged — see [Selecting Kagi for web search](#selecting-kagi-for-web-search).

### `webfetch`

OpenCode v2 has no web-fetch provider API, so the plugin overrides the built-in `webfetch` tool with Kagi Extract.

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
