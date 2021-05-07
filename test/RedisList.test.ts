import { assert } from "chai"
import { RedisList } from "../src"
import * as IORedis from "ioredis"

describe("RedisList", () => {
  const redis = new IORedis()
  const key = "test"
  
  const rl = new RedisList({
    redis,
    key,
    expire: ["inRead", 86400]
  })

  beforeEach(async () => {
    await redis.flushdb()
  })

  it("normal", async () => {
    assert.strictEqual(await rl.lpush("v"), 1)
    assert.deepStrictEqual(await rl.lrange(0, 0), ["v"])
  })

  it("maxLen=1", async() => {
    const rl2 = new RedisList({
      redis,
      key,
      maxLen: 1,
      expire: ["inRead", 86400]
    })
    assert.strictEqual(await rl2.lpush("1"), 1)
    assert.strictEqual(await rl2.lpush("2"), 2)
    assert.deepStrictEqual(await rl2.lrange(0, 0), ["2"])
  })
})