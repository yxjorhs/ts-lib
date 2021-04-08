import { assert } from "chai"
import * as IORedis from "ioredis"
import { RedisSortedSetMultiScore } from "../src/index"

describe("RedisSortedSetMultiScore", () => {
  const redis = new IORedis()
  const key = "test"
  const cache = new RedisSortedSetMultiScore({
    redis,
    key,
    scoresLen: [1,2,3]
  })

  beforeEach(async () => {
    await redis.flushdb()
  })

  it("update & score", async () => {
    await cache.update("mb1", [{ set: 1 }, { incr: 11 }, { incr: 11 }])

    assert.strictEqual(
      await redis.zscore("test", "mb1"),
      "1111011"
    )

    assert.deepStrictEqual(
      await cache.score("mb1"),
      [1,11,11]
    )

    await cache.update("mb2", [{ set: 0 }, { incr: 8 }, { incr: 9 }])

    assert.strictEqual(
      await redis.zscore("test", "mb2"),
      "1008009"
    )

    assert.deepStrictEqual(
      await cache.score("mb2"),
      [0,8,9]
    )
  })

  it("rank & revrank", async () => {
    await cache.update("mb1", [{ set: 1 }, { incr: 2 }, { incr: 3 }])
    await cache.update("mb2", [{ set: 3 }, { incr: 2 }, { incr: 1 }])
    await cache.update("mb3", [{ set: 9 }, { incr: 99 }, { incr: 99 }])

    assert.strictEqual(
      await cache.rank("mb1"),
      0
    )
    assert.strictEqual(
      await cache.rank("mb2"),
      1
    )
    assert.strictEqual(
      await cache.rank("mb3"),
      2
    )
    assert.strictEqual(
      await cache.revrank("mb3"),
      0
    )
    assert.strictEqual(
      await cache.revrank("mb2"),
      1
    )
    assert.strictEqual(
      await cache.revrank("mb1"),
      2
    )
  })

  it("range & revrange", async () => {
    await cache.update("mb1", [{ set: 1 }, { incr: 2 }, { incr: 3 }])
    await cache.update("mb2", [{ set: 3 }, { incr: 2 }, { incr: 1 }])
    await cache.update("mb3", [{ set: 9 }, { incr: 99 }, { incr: 99 }])

    assert.deepStrictEqual(
      await cache.range(0, 1),
      [
        { member: "mb1", scores: [1,2,3] },
        { member: "mb2", scores: [3,2,1] },
      ]
    )
    assert.deepStrictEqual(
      await cache.revrange(0, 1),
      [
        { member: "mb3", scores: [9,99,99] },
        { member: "mb2", scores: [3,2,1] },
      ]
    )
  })
})
