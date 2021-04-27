import { assert } from "chai"
import * as IORedis from "ioredis"
import { RedisHashAutRefMulType } from "../src"

describe("RedisHashAutRedMulType", () => {
  const redis = new IORedis()
  const key = "test"
  const rh = new RedisHashAutRefMulType({
    redis,
    key,
    refresh: {
      a: async () => "a",
      b: async () => 1
    }
  })

  beforeEach(async () => {
    await redis.flushdb()
  })

  it("hget", async () => {
    assert.strictEqual(await rh.hget("a"), "a");
    assert.strictEqual(await rh.hget("b"), 1);
  })

  it("hmget", async () => {
    assert.deepStrictEqual(await rh.hmget("a", "b"), { a: "a", b: 1 })
  })

  it("hgetall", async () => {
    assert.deepStrictEqual(await rh.hgetall(), { a: "a", b: 1 })
  })
})
