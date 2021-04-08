import RedisCommon from "./RedisCommon"

class RedisHash<T> extends RedisCommon {
  /**
   * 在redis的hash上附加功能
   * 1.key管理
   * 2.缓存丢失恢复
   * 3.默认过期时间，多久没有使用则自动过期
   */
  constructor(readonly options: RedisCommon.Options & {
    /** 缓存丢失恢复 */
    refresh?: (field: string) => Promise<T>,
  } & RedisCommon.Options) {
    super(options)
  }

  /**
   * 获取缓存，延长缓存过期时间，缓存不存在时可更新缓存并返回
   * @param field
   */
  public async hget(field: string): Promise<T | null> {
    const [cache] = await this.runCommands(ppl => ppl.hget(this.options.key, field + ""))

    if (cache) {
      return JSON.parse(cache)
    }

    return this.refresh(field)
  }

  /**
   * 批量获取缓存
   * @param fields
   */
  public async hmget(fields: string[]): Promise<(T | null)[]> {
    if (fields.length === 0) {
      return []
    }

    const [cache] = await this.runCommands(ppl => ppl.hmget(this.options.key, ...fields.map((field => field + ""))))

    const ret: (T | null)[] = []

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]
      const str = cache[i]

      if (str) {
        ret.push(JSON.parse(str))
        continue
      }

      ret.push(await this.refresh(field))
    }

    return ret
  }

  public async hmincrby(params: { field: string, incr: number }[]) {
    if (params.length === 0) {
      return []
    }

    const incrRes = await this.runCommands(ppl => {
      for (const { field, incr } of params) {
        ppl.hincrby(this.options.key, field + "", incr)
      }
      return ppl
    })

    const ret: { field: string, val: number }[] = []

    for (let i = 0; i < params.length; i++) {
      const { field, incr } = params[i]

      let val = incrRes[i]

      if (val === incr) {
        val = await this.refresh(field)
      }

      ret.push({ field, val })
    }

    return ret
  }

  /**
   * 删除指定field
   */
  public async hdel(field: string, ...fields: string[]) {
    await this.options.redis.hdel(this.options.key, field, ...fields.map(v => v + ""))
  }

  public async hset(field: string, v: string | number, ...args: (string | number)[]) {
    await this.runCommand(ppl => ppl.hset(this.options.key, field, v, ...args))
  }

  /**
   * 更新指定缓存
   */
  private async refresh(field: string) {
    if (this.options.refresh === undefined) {
      return null
    }

    const data = await this.options.refresh(field)

    await this.runCommands(ppl => ppl.hset(this.options.key, field + "", JSON.stringify(data)))

    return data
  }
}

export default RedisHash
