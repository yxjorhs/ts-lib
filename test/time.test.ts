import { assert } from 'chai';
import { time } from "../src/index"

describe("time", () => {
  it("getWeek", () => {
    let date = new Date("2020/11/23")
    for (let i = 0; i < 7; i++) {
      assert.deepStrictEqual(
        time.getWeek({ date: new Date(date.getTime() + i * 86400000) }),
        time.getWeek({ date }),
      )
    }
  })

  it("getMonth", () => {
    assert.deepStrictEqual(
      time.getMonth({ date: new Date("2020/01/02 18:00:00") }),
      new Date("2020/01/01")
    )
  })
})
