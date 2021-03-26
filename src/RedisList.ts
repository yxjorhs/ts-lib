import RedisCommon from "./RedisCommon";

/**
 * redis list 扩展
 * 1.默认过期时间
 * 2.长度限制
 */
class RedisList extends RedisCommon {
  constructor(readonly options: RedisCommon.Options & {
    /** list的最大长度 */
    maxLen?: number
  }) {
    super(options)
  }

  public async lpush(value: string): Promise<number> {
    const [len] = await this.runCommands(ppl => {
      ppl.lpush(this.options.key, value)

      if (this.options.maxLen !== undefined && this.options.maxLen >= 1) {
        ppl.ltrim(this.options.key, 0, this.options.maxLen - 1)
      }

      return ppl
    })

    return len
  }

  public async lrange(start: number, stop: number): Promise<string[]> {
    return this.runCommand(ppl => ppl.lrange(this.options.key, start, stop))
  }
}

export default RedisList
