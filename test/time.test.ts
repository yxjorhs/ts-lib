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

    assert.deepStrictEqual(ytl.time.getWeek(), ytl.time.getWeek({ date: new Date() }))
  })

  it("getMonth", () => {
    assert.deepStrictEqual(
      ytl.time.getMonth({ date: new Date("2020/01/02 18:00:00") }),
      new Date("2020/01/01")
    )
    assert.deepStrictEqual(ytl.time.getMonth(), ytl.time.getMonth({ date: new Date() }))
  })

  it("getDate", () => {
    assert.deepStrictEqual(ytl.time.getDate({ date: new Date("2020/01/01 12:00:00")}), new Date("2020/01/01"))
    assert.deepStrictEqual(ytl.time.getDate(), ytl.time.getDate({ date: new Date() }))
  })

  it("format", () => {
    assert.deepStrictEqual(ytl.time.format().length, 19)
    const date = new Date("2020/01/01")
    assert.deepStrictEqual(ytl.time.format(date), "2020/01/01 00:00:00")
    assert.deepStrictEqual(ytl.time.format(date, "M"), "1")
    assert.deepStrictEqual(ytl.time.format(date, "hh:mm:ss"), "00:00:00")
    assert.deepStrictEqual(ytl.time.format(date, "yyyyMMddhhmmss"), "20200101000000")
  })

  it("sleep", async () => {
    const start = Date.now()
    await ytl.time.sleep(10)
    assert.strictEqual((Date.now() - start) >= 10, true)
  })
})
