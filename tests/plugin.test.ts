import { describe, it } from "node:test"
import assert from "node:assert/strict"
import plugin, { toWebResults } from "../src/plugin"

type Connection = { type: string; id?: string; label?: string; name?: string }
type Credential = { type: string; key?: string }

function mockContext(
  options: Record<string, unknown> = {},
  connection: {
    active: () => Promise<Connection | undefined>
    resolve: (connection: Connection) => Promise<Credential | undefined>
  } = { active: async () => undefined, resolve: async () => undefined },
) {
  const providers: Array<{ id: string; name: string; execute: (input: unknown, ctx: unknown) => Promise<unknown> }> = []
  const tools: Array<{ name: string }> = []
  const integrations: Array<{ id: string; name: string }> = []
  const methods: Array<{ integrationID: string; method: { type: string } }> = []
  const state = { default: undefined as string | false | undefined }
  const ctx = {
    location: { directory: process.cwd() },
    options,
    integration: {
      transform: async (cb: (editor: unknown) => void) => {
        cb({
          update: (id: string, update: (integration: { id: string; name: string }) => void) => {
            let ref = integrations.find((item) => item.id === id)
            if (!ref) {
              ref = { id, name: id }
              integrations.push(ref)
            }
            update(ref)
          },
          method: {
            update: (registration: { integrationID: string; method: { type: string } }) =>
              methods.push(registration),
          },
        })
      },
      connection,
    },
    websearch: {
      transform: async (cb: (editor: unknown) => void) => {
        cb({
          add: (definition: (typeof providers)[number]) => providers.push(definition),
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
  return { ctx, providers, tools, integrations, methods, state }
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

  it("registers a Kagi integration with key and env methods", async () => {
    const { ctx, integrations, methods } = mockContext()
    await plugin.setup(ctx as never)
    assert.deepEqual(integrations, [{ id: "kagi", name: "Kagi" }])
    assert.deepEqual(methods.map((m) => m.method.type).sort(), ["env", "key"])
  })

  it("honours disable options", async () => {
    const { ctx, providers, tools, state } = mockContext({ websearch: false, webfetch: false, extract: false })
    await plugin.setup(ctx as never)
    assert.equal(providers.length, 0)
    assert.equal(state.default, undefined)
    assert.equal(tools.length, 0)
  })

  it("uses the credential stored in opencode's auth system", async () => {
    const { ctx, providers } = mockContext({}, {
      active: async () => ({ type: "credential", id: "cred-1", label: "Kagi" }),
      resolve: async () => ({ type: "key", key: "stored-key" }),
    })
    await plugin.setup(ctx as never)

    const originalFetch = globalThis.fetch
    let authorization: string | undefined
    globalThis.fetch = (async (_url: string, init: RequestInit) => {
      authorization = (init.headers as Record<string, string>).Authorization
      return new Response(
        JSON.stringify({ data: { search: [{ url: "https://a.com", title: "Alpha" }] }, meta: {} }),
        { status: 200, headers: { "content-type": "application/json" } },
      )
    }) as typeof fetch
    try {
      const results = (await providers[0].execute({ query: "hi" }, { signal: new AbortController().signal })) as Array<{
        url: string
      }>
      assert.equal(authorization, "Bearer stored-key")
      assert.equal(results[0].url, "https://a.com")
    } finally {
      globalThis.fetch = originalFetch
    }
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
