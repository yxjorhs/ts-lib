import { assert } from "chai"
import RedisHashCache from "../src/RedisHashCache"
import * as IORedis from "ioredis"

describe("RedisHashCache", () => {
  const redis = new IORedis()

  beforeEach(async () => {
    await redis.flushdb()
  })

  it("get", async () => {
    const rhc = new RedisHashCache({
      redis,
      name: "test",
      refresh: async (id: number) => id
    })

    assert.strictEqual(await rhc.get(1), 1)
  })

  it("clear", async () => {
    let num = 1

    const rhc = new RedisHashCache({
      redis: new IORedis(),
      name: "test",
      refresh: async () => {
        return num++
      }
    })

    assert.strictEqual(await rhc.get(1), 1)

    await rhc.clear()

    // 结果为2说明更新了数据，clear成功
    assert.strictEqual(await rhc.get(1), 2)
  })

  it("getMulti", async () => {
    const rhc = new RedisHashCache({
      redis,
      name: "test",
      refresh: async (id: number) => id
    })

    assert.deepStrictEqual(await rhc.mget([1,2]), [1,2])
  })
})