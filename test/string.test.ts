import { assert } from 'chai';
import ytl from "../src"

describe("string", () => {
  it("parseNumber", () => {
    assert.strictEqual(ytl.string.parseNumber(0, "char"), "a")
    assert.strictEqual(ytl.string.parseNumber(61, "char"), "9")
    assert.strictEqual(ytl.string.parseNumber(62, "char"), "ba")
  })
  it("toNumber", () => {
    assert.strictEqual(ytl.string.toNumber("a", "char"), 0)
    assert.strictEqual(ytl.string.toNumber("9", "char"), 61)
    assert.strictEqual(ytl.string.toNumber("ba", "char"), 62)
  })
})
