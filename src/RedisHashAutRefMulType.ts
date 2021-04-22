import RedisCommon from "./RedisCommon";
import { RedisHashCom } from "./RedisHashCom";

class RedisHashAutRefMulType<T extends Record<string, unknown>> extends RedisHashCom {
  /**
   * 与RedisHashAutRed相比
   * 1.可同时保存多种类型的数据
   */
  constructor(readonly options: RedisCommon.Options & {
    refresh: {
      [key in keyof T]: () => Promise<T[key]>
    }
  }) {
    super(options)
  }

  public async hget<K extends keyof T>(field: K): Promise<T[K]> {
    const [cache] = await this.runCommands(ppl => ppl.hget(this.options.key, field + ""))

    if (cache) {
      return JSON.parse(cache)
    }

    return this.refresh(field)
  }

  public async hmget<K extends keyof T>(...fields: K[]): Promise<Record<K, T[K]>> {
    if (fields.length === 0) {
      return {} as any
    }

    const [cache] = await this.runCommands(ppl => ppl.hmget(this.options.key, ...fields.map((field => field + ""))))

    const ret: Record<K, T[K]> = {} as any

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]
      const str = cache[i]

      if (str) {
        ret[field] = JSON.parse(str)
        continue
      }

      ret[field] = await this.refresh(field)
    }

    return ret
  }

  private async refresh<K extends keyof T>(field: K) {
    const data = await this.options.refresh[field]();

    await this.runCommands(ppl => ppl.hset(this.options.key, field + "", JSON.stringify(data)))

    return data
  }
}

export default RedisHashAutRefMulType
