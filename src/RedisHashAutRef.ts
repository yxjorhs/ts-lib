import RedisCommon from "./RedisCommon"
import { RedisHashCom } from "./RedisHashCom"

class RedisHashAutRef<T> extends RedisHashCom {
  /**
   * 在redis的hash上附加功能
   * 1.key管理
   * 2.默认过期时间，多久没有使用则自动过期
   * 3.缓存丢失恢复
   */
  constructor(readonly options: RedisCommon.Options & {
    /** 缓存丢失恢复 */
    refresh: (field: string) => Promise<T>,
  }) {
    super(options)
  }

  public async hget(field: string): Promise<T> {
    const cache = await this._hget(field)

    if (cache) {
      return JSON.parse(cache)
    }

    return this.refresh(field)
  }

  public async hdel(field: string, ...fields: string[]): Promise<number> {
    return this._hdel(field, ...fields)
  }

  public async hgetall(): Promise<Record<string, T>> {
    const _data = await this._hgetall()

    const ret: Record<string, T> = {}

    for (const key in _data) ret[key] = JSON.parse(_data[key]);

    return ret
  }

  public async hmget(...fields: string[]): Promise<T[]> {
    if (fields.length === 0) {
      return []
    }

    const cache = await this._hmget(...fields)

    const ret: T[] = []

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
   * 更新指定缓存
   */
  private async refresh(field: string) {
    const data = await this.options.refresh(field)

    await this.runCommands(ppl => ppl.hset(this.options.key, field + "", JSON.stringify(data)))

    return data
  }
}

export default RedisHashAutRef
