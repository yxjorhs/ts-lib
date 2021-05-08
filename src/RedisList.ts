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
    const ppl = this.redis.pipeline()

    ppl.lpush(this.key, value)

    if (this.options.maxLen !== undefined && this.options.maxLen >= 1) {
      ppl.ltrim(this.key, 0, this.options.maxLen - 1)
    }

    const [len] = await this._exec(ppl)

    await this._updExp("write")

    return len
  }

  public async lrange(start: number, stop: number): Promise<string[]> {
    const v = await this.redis.lrange(this.key, start, stop)

    await this._updExp("read")

    return v
  }
}

export default RedisList
