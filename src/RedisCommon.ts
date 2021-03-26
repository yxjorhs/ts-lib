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
  protected readonly defaultExpireIn = 86400 * 7

  constructor(protected readonly options: RedisCommon.Options) {}

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
  }

  /**
   * 使用管道执行指令
   * 设置过期时间
   * 检测执行异常
   * 返回指令结果
   */
  protected async runCommands(func: (ppl: Pipeline) => Pipeline): Promise<any[]> {
    const exec = await func(this.options.redis.pipeline())
      .expire(this.options.key, this.options.expireIn || this.defaultExpireIn)
      .exec()
    return this.parseExec(exec).slice(0, -1)
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
