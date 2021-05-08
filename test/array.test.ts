import ytl from "../src/index"
import { assert } from 'chai';

describe("array", () => {
  it("random", () => {
    assert.strictEqual(ytl.array.random([1,0], v => v), 1)
    assert.strictEqual(ytl.array.random([0,1], v => v), 1)
    assert.strictEqual(ytl.array.random([0,0], v => v), null)
    assert.deepStrictEqual(ytl.array.random([{ r: 1 },{ r: 0 }], v => v.r), { r: 1 })
    assert.deepStrictEqual(ytl.array.random([], () => 1), null)
  })

  it("toOb", () => {
    assert.deepStrictEqual(
      ytl.array.toObj([{ key: "k1", val: "v1" }, { key: "k2", val: "v2" }], v => v.key, v => v.val ),
      { k1: "v1", k2: "v2" }
    )
    assert.deepStrictEqual(
      ytl.array.toObj([{ key: "k1", val: "v1" }, { key: "k2", val: "v2" }], v => v.key, v => v),
      { k1: { key: "k1", val: "v1" }, k2: { key: "k2", val: "v2" }}
    )
  })
})
