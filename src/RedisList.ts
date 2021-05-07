import RedisDataBase from "./RedisDataBase"

class RedisList extends RedisDataBase {
  /**
   * redis list 扩展
   * 1.默认过期时间
   * 2.长度限制
   */
  constructor(readonly options: RedisDataBase.Options & {
    /** list的最大长度 */
    maxLen?: number
  }) {
    super(options)
  }

  public async lpush(value: string): Promise<number> {
    const ppl = this.options.redis.pipeline()

    ppl.lpush(this.options.key, value)

    if (this.options.maxLen !== undefined && this.options.maxLen >= 1) {
      ppl.ltrim(this.options.key, 0, this.options.maxLen - 1)
    }
  
    const [len] = await this._exec(ppl)

    await this._updExp("write")

    return len
  }

  public async lrange(start: number, stop: number): Promise<string[]> {
    const v = await this.options.redis.lrange(this.options.key, start, stop)

    await this._updExp("read")

    return v
  }
}

export default RedisList
