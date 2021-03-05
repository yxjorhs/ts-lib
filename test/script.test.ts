import { assert } from "chai"
import * as fs from "fs"
import { script } from "../src/index"

describe("script", () => {
  const dir = `${__dirname}/../temp/testScriptRedDirRecursiveSync`

  const files = [
    `${dir}/sub/file1.txt`,
    `${dir}/sub/file2.txt`,
  ]

  beforeEach(async () => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
      fs.mkdirSync(`${dir}/sub`)
      fs.writeFileSync(files[0], "1")
      fs.writeFileSync(files[1], "2")
    }
  })

  it("readDirRecursiveSync", () => {
    assert.deepStrictEqual(script.readDirRecursiveSync(dir), files)
  })

  it("readLineSync", async () => {
    const res: Array<string> = []

    await script.readLineSync(files, text => res.push(text))

    assert.deepStrictEqual(res, ["1", "2"])
  })
})