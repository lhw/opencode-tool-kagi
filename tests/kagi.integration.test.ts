import { describe, it, before } from "node:test"
import assert from "node:assert/strict"
import { searchKagi, extractPages, formatSearchResults } from "../.opencode/tools/_kagi"

const hasKey = Boolean(process.env.KAGI_API_KEY)

describe("searchKagi (integration)", { skip: !hasKey }, () => {
  it("returns search results for a query", async () => {
    const result = await searchKagi({ query: "hello world", limit: 3 })
    if (!result.ok) throw new Error(result.error)

    assert.ok(result.data.meta?.trace)
    assert.ok(result.data.data?.search)
    assert.ok(result.data.data!.search!.length <= 3)
    assert.ok(result.data.data!.search!.length > 0)

    const r = result.data.data!.search![0]
    assert.ok(r.url)
    assert.ok(r.title)
  })

  it("honours the limit parameter", async () => {
    const result = await searchKagi({ query: "typescript", limit: 5 })
    if (!result.ok) throw new Error(result.error)

    assert.ok(result.data.data?.search)
    assert.ok(result.data.data!.search!.length <= 5)
  })

  it("supports news workflow", async () => {
    const result = await searchKagi({ query: "ai", workflow: "news", limit: 3 })
    if (!result.ok) throw new Error(result.error)

    assert.ok(result.data.data?.news || result.data.data?.search)
  })

  it("formatSearchResults produces valid markdown", async () => {
    const result = await searchKagi({ query: "node.js", limit: 2 })
    if (!result.ok) throw new Error(result.error)

    const out = formatSearchResults(result.data, "node.js")
    assert.match(out, /# Web Search: node\.js/)
    assert.ok(out.length > 50)
  })

  it("fails gracefully without API key", async () => {
    const orig = process.env.KAGI_API_KEY
    delete process.env.KAGI_API_KEY
    try {
      const result = await searchKagi({ query: "x" })
      assert.equal(result.ok, false)
      assert.match(result.ok === false ? result.error : "", /KAGI_API_KEY not set/)
    } finally {
      process.env.KAGI_API_KEY = orig
    }
  })
})

describe("extractPages (integration)", { skip: !hasKey }, () => {
  it("extracts markdown from a real URL", async () => {
    const result = await extractPages(["https://example.com"])
    if (!result.ok) throw new Error(result.error)

    assert.ok(result.data.data)
    // example.com returns "No Content" because it's minimal HTML
    // but we should still get a response entry
    assert.equal(result.data.data.length, 1)
    assert.equal(result.data.data[0].url, "https://example.com")
  })

  it("extracts a real article", async () => {
    const result = await extractPages(["https://en.wikipedia.org/wiki/Hello_world"])
    if (!result.ok) throw new Error(result.error)

    assert.ok(result.data.data)
    assert.equal(result.data.data.length, 1)
    const page = result.data.data[0]
    assert.equal(page.error, null)
    assert.ok(page.markdown)
    assert.ok(page.markdown!.length > 100)
    assert.match(page.markdown!, /Hello/i)
  })

  it("handles multiple URLs", async () => {
    const result = await extractPages([
      "https://en.wikipedia.org/wiki/Hello_world",
      "https://example.com",
    ])
    if (!result.ok) throw new Error(result.error)

    assert.ok(result.data.data)
    assert.equal(result.data.data.length, 2)
  })

  it("reports error for invalid URL", async () => {
    const result = await extractPages(["https://this-does-not-exist-12345.com"])
    if (!result.ok) throw new Error(result.error)

    assert.ok(result.data.data)
    assert.equal(result.data.data.length, 1)
    // should have either an error or empty content
    assert.ok(result.data.data[0].error || !result.data.data[0].markdown)
  })
})
