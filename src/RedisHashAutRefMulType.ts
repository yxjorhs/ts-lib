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
    const cache = await this._hget(field as string)

    if (cache) {
      return JSON.parse(cache)
    }

    return this.refresh(field)
  }

  /** 获得所有field的值 */
  public async hgetall(): Promise<{[key in keyof T]: T[key]}> {
    const ret: any = await this._hgetall()

    for (const key in this.options.refresh) {
      if (ret[key] !== undefined) {
        ret[key] = JSON.parse(ret[key])
        continue
      }

      ret[key] = await this.refresh(key)
    }

    return ret
  }

  public async hmget<K extends keyof T>(field: K, ...fields: K[]): Promise<Record<K, T[K]>>;
  public async hmget<K extends keyof T>(...fields: K[]): Promise<Record<K, T[K]>> {
    if (fields.length === 0) {
      return {} as any
    }

    const cache = await this._hmget(...fields as string[])

    const ret: any = {}

    for (let i = 0; i < fields.length; i++) {
      if (cache[i] !== null) {
        ret[fields[i]] = JSON.parse(cache[i]!)
        continue
      }

      ret[fields[i]] = await this.refresh(fields[i])
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
