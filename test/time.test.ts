import { assert } from 'chai';
import ytl from "../src/index"

describe("time", () => {
  it("getWeek", () => {
    let date = new Date("2020/11/23")
    for (let i = 0; i < 7; i++) {
      assert.deepStrictEqual(
        ytl.time.getWeek({ date: new Date(date.getTime() + i * 86400000) }),
        ytl.time.getWeek({ date }),
      )
    }
  })

  it("getMonth", () => {
    assert.deepStrictEqual(
      ytl.time.getMonth({ date: new Date("2020/01/02 18:00:00") }),
      new Date("2020/01/01")
    )
  })
})
