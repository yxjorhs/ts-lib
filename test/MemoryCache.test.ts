import { MemoryCache } from "../src/index"
import { assert } from "chai";

describe("MemoryCache", () => {
  it("get", async () => {
    let data = 1
    const memery_chace = new MemoryCache(10, async () => data++)
    assert.deepStrictEqual(await memery_chace.get(), 1)
    memery_chace.expired()
    assert.deepStrictEqual(await memery_chace.get(), 2)
  })
})
