import RedisCommon from "./RedisCommon"
import { RedisHashCom } from "./RedisHashCom"

class RedisHash<T> extends RedisHashCom {
  /**
   * 在redis的hash上附加功能
   * 1.key管理
   * 2.默认过期时间，多久没有使用则自动过期
   */
  constructor(readonly options: RedisCommon.Options) {
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

    return null
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
      const str = cache[i]

      if (str) {
        ret.push(JSON.parse(str))
        continue
      }

      ret.push(null)
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
      const { field } = params[i]

      ret.push({ field, val: incrRes[i] })
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
}

export default RedisHash
