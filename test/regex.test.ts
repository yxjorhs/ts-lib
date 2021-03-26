import { assert } from 'chai';
import ytl from "../src"

describe("regex", () => {
  it("checkPassword", () => {
    assert.strictEqual(ytl.regex.checkPassword(""), false)
    assert.strictEqual(ytl.regex.checkPassword("12345678"), false)
    assert.strictEqual(ytl.regex.checkPassword("aa345678"), false)
    assert.strictEqual(ytl.regex.checkPassword("@a345678"), true)
  })

  it("checkPhone", () => {
    assert.strictEqual(ytl.regex.checkPhone("12345678"), false)
  })

  it("checkIDCard", () => {
    assert.strictEqual(ytl.regex.checkIDCard("12345678"), false)
  })
})
