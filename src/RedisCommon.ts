import { Redis, Pipeline } from "ioredis"

declare namespace RedisCommon {
  type Options = {
    /** IORedis实例 */
    redis: Redis,
    /** key */
    key: string,
    /** 缓存多久未使用过期 */
    expireIn?: number
  }
}
class RedisCommon {
  /** 缓存无操作时的过期时间 */
  protected readonly expireIn = 86400 * 7

  /** 上次设置key过期的时间 */
  protected lastSetExpireAt = 0

  constructor(public readonly options: RedisCommon.Options) {
    if (this.options.expireIn) {
      this.expireIn = this.options.expireIn
    }
  }

  protected parseExec(data: [Error | null, any][]): any[] {
    const ret: any[] = []

    for (const [e, v] of data) {
      if (e) {
        throw e
      }

      ret.push(v)
    }

    return ret
  }

  /**
   * 删除
   */
  public async del() {
    await this.options.redis.del(this.options.key)
    this.lastSetExpireAt = 0
  }

  /** 是否需要更新过期时间 */
  protected needSetExpire() {
    return (Date.now() - this.lastSetExpireAt) > (this.expireIn / 2)
  }

  /**
   * 使用管道执行指令
   * 设置过期时间
   * 检测执行异常
   * 返回指令结果
   */
  protected async runCommands(func: (ppl: Pipeline) => Pipeline): Promise<any[]> {
    const ppl = func(this.options.redis.pipeline())

    const needSetExpire = this.needSetExpire()

    if (needSetExpire) ppl.expire(this.options.key, this.expireIn);

    const exec = await ppl.exec()

    const ret = this.parseExec(exec)

    if (needSetExpire) return ret.slice(0, -1)

    return ret
  }

  /**
   * 与runCommands相同，但只返回一个结果
   */
  protected async runCommand(func: (ppl: Pipeline) => Pipeline): Promise<any> {
    const ret = await this.runCommands(func)
    return ret[0]
  }
}

export default RedisCommon
