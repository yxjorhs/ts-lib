import * as assert from "assert"
import { Pipeline } from "ioredis"

class RedisHelper {
  protected async _exec(pip: Pipeline): Promise<any[]> {
    const data = await pip.exec()

    const ret: any[] = []

    for (const [e, v] of data) {
      assert(!e, e ? e.message : "unknow error")

      ret.push(v)
    }

    return ret
  }
}

export default RedisHelper
