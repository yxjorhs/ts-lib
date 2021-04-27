import RedisCommon from "./RedisCommon"
import { RedisHashCom } from "./RedisHashCom"

class RedisHash extends RedisHashCom {
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
  public async hget(field: string): Promise<string | null> {
    return this._hget(field)
  }

  public async hgetall(): Promise<Record<string, string>> {
    return this._hgetall()
  }

  public async hset(field: string, val: string, ...args: string[]) {
    return this._hset(field, val, ...args)
  }

  public async hdel(field: string, ...fields: string[]) {
    return this._hdel(field, ...fields)
  }

  /**
   * 批量获取缓存
   * @param fields
   */
  public async hmget(...fields: string[]): Promise<(string | null)[]> {
    return this._hmget(...fields)
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
}

export default RedisHash
