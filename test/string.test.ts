import { assert } from 'chai';
import { string } from "../src"

describe("string", () => {
  it("parseNumber", () => {
    assert.strictEqual(string.parseNumber(0, "char"), "a")
    assert.strictEqual(string.parseNumber(61, "char"), "9")
    assert.strictEqual(string.parseNumber(62, "char"), "ba")
  })
  it("toNumber", () => {
    assert.strictEqual(string.toNumber("a", "char"), 0)
    assert.strictEqual(string.toNumber("9", "char"), 61)
    assert.strictEqual(string.toNumber("ba", "char"), 62)
  })
})
