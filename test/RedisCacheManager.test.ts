import { assert } from "chai"
import * as IORedis from "ioredis"
import { RedisCacheManager } from "../src"

describe("RedisCacheManager", () => {
  const redis = new IORedis()
  const rcm = new RedisCacheManager({
    redis,
    keyPrefix: "rcmtest",
    cache: {
      a: {
        r: async () => 1,
        re: ["a"]
      },
      b: {
        r: async (field: string) => field,
        re: ["b"]
      }
    }
  })

  beforeEach(async () => {
    await redis.flushdb()
  })

  it("get", async () => {
    assert.strictEqual(await rcm.get("a"), 1)
    assert.strictEqual(await rcm.get("a"), 1)
    assert.deepStrictEqual(await rcm.get("b", ["1"]), { "1": "1" })
    assert.deepStrictEqual(await rcm.get("b", ["1"]), { "1": "1" })
  })

  it("mget", async () => {
    const mget = await rcm.mget("a", ["b", ["1", "2"]])
    assert.strictEqual(mget.a[0], 1)
    assert.strictEqual(mget.b[1]["1"], "1")
    assert.strictEqual(mget.b[1]["2"], "2")

    const mget2 = await rcm.mget("a", ["b", ["1", "2"]])
    assert.deepStrictEqual(mget2, mget)
  })

  it("refresh", async () => {
    let val = 1
    const rcmTestRefresh = new RedisCacheManager({
      redis,
      keyPrefix: "rcmTestRefresh",
      cache: {
        a: {
          r: async () => val++,
          re: ["a"]
        }
      }
    })

    assert.strictEqual(await rcmTestRefresh.get("a"), 1)
    assert.strictEqual(await rcmTestRefresh.get("a"), 1)

    await rcmTestRefresh.refresh("a")

    assert.strictEqual(await rcmTestRefresh.get("a"), 2)
    assert.strictEqual(await rcmTestRefresh.get("a"), 2)
  })
})
