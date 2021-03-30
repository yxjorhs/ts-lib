import { assert } from "chai"
import { RedisSortedSet } from "../src/index"
import * as IORedis from "ioredis"

describe("RedisSortedSet", () => {
  const redis = new IORedis()
  const key = "test"
  const rss = new RedisSortedSet({
    redis,
    key,
    refresh: async () => 1
  })

  beforeEach(async () => {
    await redis.flushdb()
  })

  it("zadd", async () => {
    assert.strictEqual(await rss.zadd([{ member: "mb1", score: 1 }]), 1)
    assert.strictEqual(await redis.zscore(key, "mb1"), "1")  
    assert.strictEqual( await redis.ttl(key), 86400 * 7)
  })

  it("zmincrby", async () => {
    assert.deepStrictEqual(await rss.zincrby("mb1", 1), 1)
    assert.deepStrictEqual(await rss.zincrby("mb1", 1), 2)
    assert.strictEqual( await redis.ttl(key), 86400 * 7)
    assert.strictEqual(await redis.zscore(key, "mb1"), "2")  
  })

  it("zmscore", async () => {
    await redis.zadd(key, 1, "mb1", 2, "mb2")

    assert.deepStrictEqual(await rss.zmscore(["mb1", "mb2", "mb3"]), [1, 2, 1]) // mb3没设，但通过refresh获取到了1
    assert.deepStrictEqual(await rss.zmscore([]), [])
  })

  it("zrange", async () => {
    await redis.zadd(key, 1, "mb1", 2, "mb2")

    assert.deepStrictEqual(await rss.zrange(0, -1), ["mb1", "mb2"])
    assert.deepStrictEqual(await rss.zrange(0, -1, true), [{ member: "mb1", score: 1 }, { member: "mb2", score: 2 }])
  })

  it("zrevrange", async () => {
    await redis.zadd(key, 1, "mb1", 2, "mb2")

    assert.deepStrictEqual(await rss.zrevrange(0, -1), ["mb2", "mb1"])
    assert.deepStrictEqual(await rss.zrevrange(0, -1, true), [{ member: "mb2", score: 2 }, { member: "mb1", score: 1 }])
  })

  it("zrank", async () => {
    await redis.zadd(key, 1, "mb1", 2, "mb2")

    assert.strictEqual(await rss.zrank("mb1"), 0)
    assert.strictEqual(await rss.zrank("mb2"), 1)
  })

  it("zrevrank", async () => {
    await redis.zadd(key, 1, "mb1", 2, "mb2")

    assert.strictEqual(await rss.zrevrank("mb1"), 1)
    assert.strictEqual(await rss.zrevrank("mb2"), 0)
  })

  it("没有配置refresh函数", async () => {
    const rssNoRefresh = new RedisSortedSet({
      redis,
      key: "test"
    })
    assert.deepStrictEqual(await rssNoRefresh.zmscore(["mb1"]), [0]) // score默认0
    assert.strictEqual(await rssNoRefresh.zincrby("mb1", 1), 1)
  })
})