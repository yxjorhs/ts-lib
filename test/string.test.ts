import { assert } from 'chai';
import ytl from "../src"

describe("string", () => {
  it("parseNumber", () => {
    assert.strictEqual(ytl.string.parseNumber(0, "char"), "a")
    assert.strictEqual(ytl.string.parseNumber(0, "number"), "0")
    assert.strictEqual(ytl.string.parseNumber(0, "letter"), "a")
    assert.strictEqual(ytl.string.parseNumber(61, "char"), "9")
    assert.strictEqual(ytl.string.parseNumber(62, "char"), "ba")
  })
  it("toNumber", () => {
    assert.strictEqual(ytl.string.toNumber("a", "char"), 0)
    assert.strictEqual(ytl.string.toNumber("9", "char"), 61)
    assert.strictEqual(ytl.string.toNumber("ba", "char"), 62)
    try {
      ytl.string.toNumber("/", "char")
    } catch(e) {
      assert.strictEqual(e.message, "char[/]无效")
    }
  })
  it("random", () => {
    assert.strictEqual(ytl.string.random(10, "char").length, 10)
  })
  it("underscoreToCamelCase", () => {
    assert.strictEqual(ytl.string.underscoreToCamelCase("a_b"), "aB")
  })
})
