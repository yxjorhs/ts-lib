import { array } from "../src/index"
import { assert } from 'chai';

describe("array", () => {
  it("random", () => {
    assert.strictEqual(array.random([1,0], v => v), 1)
    assert.strictEqual(array.random([0,1], v => v), 1)
    assert.strictEqual(array.random([0,0], v => v), null)
    assert.deepStrictEqual(array.random([{ r: 1 },{ r: 0 }], v => v.r), { r: 1 })
  })
})