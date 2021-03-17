import { assert } from 'chai';
import ytl from "../src/index"

describe("encode", () => {
  it("md5", () => {
    assert.deepStrictEqual(
      ytl.encode.md5("1"),
      "c4ca4238a0b923820dcc509a6f75849b"
    )
  })
})