import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  formatSearchResults,
  formatExtract,
  type KagiSearchResponse,
  type ExtractPage,
} from "../.opencode/tools/_kagi"

describe("formatSearchResults", () => {
  it("handles empty response", () => {
    const resp: KagiSearchResponse = { data: {} }
    const out = formatSearchResults(resp, "test")
    assert.equal(out, "# Web Search: test")
  })

  it("handles null data", () => {
    const resp: KagiSearchResponse = {}
    const out = formatSearchResults(resp, "test")
    assert.equal(out, "# Web Search: test")
  })

  it("formats web results", () => {
    const resp: KagiSearchResponse = {
      data: {
        search: [
          { url: "https://a.com", title: "Alpha", snippet: "desc a" },
          { url: "https://b.com", title: "Beta", snippet: "desc b", time: "2024-01-01" },
        ],
      },
    }
    const out = formatSearchResults(resp, "foo")
    assert.match(out, /# Web Search: foo/)
    assert.match(out, /1\. \[Alpha\]\(https:\/\/a\.com\)/)
    assert.match(out, /desc a/)
    assert.match(out, /2\. \[Beta\]\(https:\/\/b\.com\)/)
    assert.match(out, /desc b/)
    assert.match(out, /Published: 2024-01-01/)
  })

  it("includes direct answer", () => {
    const resp: KagiSearchResponse = {
      data: {
        directAnswer: [{ url: "https://x.com", title: "X", snippet: "42" }],
      },
    }
    const out = formatSearchResults(resp, "answer")
    assert.match(out, /## Direct Answer/)
    assert.match(out, /42/)
  })

  it("includes infobox", () => {
    const resp: KagiSearchResponse = {
      data: {
        infobox: [
          { url: "https://wiki.org", title: "Einstein", snippet: "Physicist" },
        ],
      },
    }
    const out = formatSearchResults(resp, "einstein")
    assert.match(out, /## Infobox/)
    assert.match(out, /\[Einstein\]/)
    assert.match(out, /Physicist/)
  })

  it("includes news", () => {
    const resp: KagiSearchResponse = {
      data: {
        news: [
          { url: "https://news.com", title: "Breaking", snippet: "story" },
        ],
      },
    }
    const out = formatSearchResults(resp, "news")
    assert.match(out, /## News/)
    assert.match(out, /Breaking/)
  })

  it("includes interesting finds", () => {
    const resp: KagiSearchResponse = {
      data: {
        interestingFinds: [{ url: "https://x.com", title: "Cool find", snippet: "neat" }],
      },
    }
    const out = formatSearchResults(resp, "find")
    assert.match(out, /## Interesting Finds/)
    assert.match(out, /Cool find/)
  })

  it("includes adjacent questions", () => {
    const resp: KagiSearchResponse = {
      data: {
        adjacentQuestion: [
          {
            url: "https://q.com",
            title: "Q",
            props: { question: "What is the answer?" },
          },
        ],
      },
    }
    const out = formatSearchResults(resp, "q")
    assert.match(out, /## Related Questions/)
    assert.match(out, /What is the answer\?/)
  })

  it("includes related searches", () => {
    const resp: KagiSearchResponse = {
      data: {
        relatedSearch: [{ url: "https://r.com", title: "related term" }],
      },
    }
    const out = formatSearchResults(resp, "r")
    assert.match(out, /## Related Searches/)
    assert.match(out, /related term/)
  })

  it("includes trace", () => {
    const resp: KagiSearchResponse = {
      data: {},
      meta: { trace: "abc123" },
    }
    const out = formatSearchResults(resp, "trace")
    assert.match(out, /Trace: `abc123`/)
  })
})

describe("formatExtract", () => {
  it("handles empty pages", () => {
    assert.equal(formatExtract([]), "")
  })

  it("formats markdown content", () => {
    const pages: ExtractPage[] = [
      { url: "https://example.com/doc", markdown: "# Hello\n\nWorld" },
    ]
    const out = formatExtract(pages)
    assert.match(out, /# https:\/\/example\.com\/doc/)
    assert.match(out, /# Hello/)
    assert.match(out, /World/)
  })

  it("handles errors", () => {
    const pages: ExtractPage[] = [
      { url: "https://bad.com", error: "Not found" },
    ]
    const out = formatExtract(pages)
    assert.match(out, /# https:\/\/bad\.com/)
    assert.match(out, /\*\*Error:\*\* Not found/)
  })

  it("handles null markdown", () => {
    const pages: ExtractPage[] = [
      { url: "https://empty.com", markdown: null },
    ]
    const out = formatExtract(pages)
    assert.match(out, /\*No content returned\*/)
  })

  it("truncates with max_chars", () => {
    const pages: ExtractPage[] = [
      { url: "https://long.com", markdown: "a".repeat(100) },
    ]
    const out = formatExtract(pages, 10)
    assert.equal(out.split("\n\n*...content truncated...*").length, 2)
    assert.ok(out.length < 150) // truncated + header + ellipsis
  })
})
