import { describe, it } from "node:test"
import assert from "node:assert/strict"
import plugin, { toWebResults } from "../src/plugin"

function mockContext(options: Record<string, unknown> = {}) {
  const providers: Array<{ id: string; name: string }> = []
  const tools: Array<{ name: string }> = []
  const state = { default: undefined as string | false | undefined }
  const ctx = {
    location: { directory: process.cwd() },
    options,
    websearch: {
      transform: async (cb: (editor: unknown) => void) => {
        cb({
          add: (definition: { id: string; name: string }) => providers.push(definition),
          default: { get: () => state.default, set: (value: string | false) => (state.default = value) },
        })
      },
    },
    tool: {
      transform: async (cb: (editor: unknown) => void) => {
        cb({ add: (definition: { name: string }) => tools.push(definition) })
      },
    },
  }
  return { ctx, providers, tools, state }
}

describe("v2 plugin", () => {
  it("registers Kagi as the default websearch provider", async () => {
    const { ctx, providers, state } = mockContext()
    await plugin.setup(ctx as never)
    assert.equal(providers.length, 1)
    assert.equal(providers[0].id, "kagi")
    assert.equal(state.default, "kagi")
  })

  it("registers webfetch and kagi_extract tools", async () => {
    const { ctx, tools } = mockContext()
    await plugin.setup(ctx as never)
    assert.deepEqual(tools.map((t) => t.name).sort(), ["kagi_extract", "webfetch"])
  })

  it("honours disable options", async () => {
    const { ctx, providers, tools, state } = mockContext({ websearch: false, webfetch: false, extract: false })
    await plugin.setup(ctx as never)
    assert.equal(providers.length, 0)
    assert.equal(state.default, undefined)
    assert.equal(tools.length, 0)
  })
})

describe("toWebResults", () => {
  it("maps Kagi results to websearch results", () => {
    const out = toWebResults([
      { url: "https://a.com", title: "Alpha", snippet: "desc", time: "2024-01-01" },
      { url: "https://b.com", title: "Beta" },
    ])
    assert.deepEqual(out[0], {
      url: "https://a.com",
      title: "Alpha",
      content: "desc",
      time: { published: Date.parse("2024-01-01") },
    })
    assert.deepEqual(out[1].time, {})
  })
})
