import { assert } from "chai"
import { RedisSet } from "../src"
import * as IORedis from "ioredis"

describe("RedisSet", () => {
  const redis = new IORedis()
  const key = "test"
  const rs = new RedisSet({
    redis,
    key,
  })

  beforeEach(async () => {
    await redis.flushdb()
  })

  it("sadd", async () => {
    assert.strictEqual(
      await rs.sadd("a"),
      1
    )

    assert.deepStrictEqual(
      await redis.smembers(rs.options.key),
      ["a"]
    )
  })

  it("scard", async () => {
    await redis.sadd(rs.options.key, "a")

    assert.strictEqual(
      await rs.scard(),
      1
    )
  })
})