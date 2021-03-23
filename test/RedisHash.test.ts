import { assert } from "chai"
import { RedisHash } from "../src/index"
import * as IORedis from "ioredis"

describe("RedisHash", () => {
  const redis = new IORedis()
  const key = "test"
  const rh = new RedisHash({
    redis,
    key,
    refresh: async (field: string) => Number(field)
  })

  beforeEach(async () => {
    await redis.flushdb()
  })

  it("hget", async () => {
    await redis.hset(key, "2", "2")
    assert.strictEqual(await rh.hget("1"), 1)
    assert.strictEqual(await rh.hget("2"), 2)
  })

  it("hmget", async () => {
    await redis.hset(key, "1", "1")
    assert.deepStrictEqual(await rh.hmget(["1","2"]), [1,2])
  })

  it("hmincrby", async () => {
    assert.deepStrictEqual(await rh.hmincrby([]), [])
    assert.deepStrictEqual(await rh.hmincrby([{ field: "1", incr: 1 }]), [{ field: "1", val: 1 }])
    assert.deepStrictEqual(await rh.hmincrby([{ field: "1", incr: 1 }]), [{ field: "1", val: 2 }])
  })

  it("del", async () => {
    await redis.hmset(key, "f1", "1", "f2", "2")
    await rh.hdel("f1")

    assert.strictEqual(await redis.hget(key, "f1"), null)
    assert.strictEqual(await redis.hget(key, "f2"), "2")
  })

  it("clear", async () => {
    let num = 1

    const rh = new RedisHash({
      redis,
      key,
      refresh: async () => {
        return num++
      }
    })

    assert.strictEqual(await rh.hget(""), 1)

    await rh.clear()

    // 结果为2说明更新了数据，clear成功
    assert.strictEqual(await rh.hget(""), 2)
  })

  it("无refresh", async () => {
    const rh = new RedisHash({
      redis,
      key
    })

    assert.strictEqual(await rh.hget("1"), null)
  })
})