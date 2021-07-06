/**
 * ioredis各种数据结构封装的爸爸
 *
 * 目的:
 * 1.使用key创建指定数据类型的对象，避免对key的错误使用(例如key它是hset，你就没法对这个key使用get)
 * 2.过期模式，提供了永不过期、指定时间过期、修改后经过n秒过期，读取后经过n秒过期等过期模式，使用时自动根据模式修改过期时间(例如: 给hset数据设了[inWrite, 3600]，那么在数据发生set，incr的时候便会将过期时间重置为3600秒后)
 */

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
    await this.redis.del(this.key)
    this.lasUpdExpAt = 0
  }

  protected pipline() {
    return this.redis.pipeline()
  }

  protected get redis() {
    return this.options.redis
  }

  protected get key() {
    return this.options.key
  }

  /** 更新key的过期时间 */
  protected async _updExp(act: "write" | "read") {
    const [mode, val] = this.options.expire

    if (mode === "at" && act === "write") {
      await this.redis.pexpireat(this.key, val)
    }

    if (mode === "inWrite" && act === "write") {
      await this.redis.expire(this.key, val)
    }

    if(
      mode === "inRead" &&
      act === "read" &&
      (Date.now() - this.lasUpdExpAt) > (val / 2) // 减少设置过期时间的频率
      ) {
      await this.redis.expire(this.key, val)
    }

    this.lasUpdExpAt = Date.now()
  }
}

export default RedisDataBase
