import { Redis } from "ioredis"
import RedisHelper from "./RedisHelper"

type _ExpireMode = "never" | "at" | "inWrite" | "inRead"
type _Options = {
  /** IORedis实例 */
  redis: Redis,
  /** key */
  key: string,
  /**
   * _ExpireMode 数据过期模式
   * - never 永不过期
   * - at 在以{number}为时间戳的时刻过期
   * - inWrite 数据修改后经过{number}秒过期
   * - inRead 数据读取后经过{number}秒过期
   */
  expire: [_ExpireMode, number]
}

declare namespace RedisDataBase {
  type Options = _Options
}

/** redis各种数据结构实例的基类 */
class RedisDataBase extends RedisHelper {
  protected lasUpdExpAt = 0

  constructor(public readonly options: _Options) {
    super()
  }

  /**
   * 删除
   */
  public async del() {
    await this.options.redis.del(this.options.key)
    this.lasUpdExpAt = 0
  }

  /** 更新key的过期时间 */
  protected async _updExp(act: "write" | "read") {
    const [mode, val] = this.options.expire

    if (mode === "at" && act === "write") {
      await this.options.redis.pexpireat(this.options.key, val)
    }

    if (mode === "inWrite" && act === "write") {
      await this.options.redis.expire(this.options.key, val)
    }

    if(
      mode === "inRead" &&
      act === "read" &&
      (Date.now() - this.lasUpdExpAt) > (val / 2) // 减少设置过期时间的频率
      ) {
      await this.options.redis.expire(this.options.key, val)
    }

    this.lasUpdExpAt = Date.now()
  }

  /**
   * 使用管道执行指令
   * 设置过期时间
   * 检测执行异常
   * 返回指令结果
   */
  // protected async runCommands(func: (ppl: Pipeline) => Pipeline): Promise<any[]> {
  //   const ppl = func(this.options.redis.pipeline())

  //   const needSetExpire = this.needSetExpire()

  //   if (needSetExpire) ppl.expire(this.options.key, this.expireIn);

  //   const ret = await this._exec(ppl)

  //   if (needSetExpire) return ret.slice(0, -1)

  //   return ret
  // }

  /**
   * 与runCommands相同，但只返回一个结果
   */
  // protected async runCommand(func: (ppl: Pipeline) => Pipeline): Promise<any> {
  //   const ret = await this.runCommands(func)
  //   return ret[0]
  // }
}

export default RedisDataBase
