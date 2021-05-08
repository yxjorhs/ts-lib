import * as assert from "assert"
import RedisDataBase from "./RedisDataBase"

class RedisHash extends RedisDataBase {
  /**
   * 获取缓存，延长缓存过期时间，缓存不存在时可更新缓存并返回
   * @param field
   */
  public async hget(field: string): Promise<string | null> {
    const v = await this.options.redis.hget(this.options.key, field)

    await this._updExp("read")

    return v
  }

  public async hgetall(): Promise<Record<string, string>> {
    const v = await this.options.redis.hgetall(this.options.key)

    await this._updExp("read")

    return v
  }

  public async hset(field: string, val: string, ...args: string[]) {
    const v = await this.options.redis.hset(this.options.key, field, val, ...args)

    await this._updExp("write")

    return v
  }

  public async hdel(...fields: string[]) {
    assert(fields.length > 0, "缺少field")

    const v = await this.options.redis.hdel(this.options.key, ...fields.map(fie => fie + ""))

    await this._updExp("read")

    return v
  }

  /**
   * 批量获取缓存
   * @param fields
   */
  public async hmget(...fields: string[]): Promise<(string | null)[]> {
    if (fields.length === 0) {
      return []
    }

    const v = await this.options.redis.hmget(this.options.key, ...fields);

    await this._updExp("read")

    return v
  }

  public async hmincrby(params: { field: string, incr: number }[]) {
    if (params.length === 0) {
      return []
    }

    const ppl = this.options.redis.pipeline()

    for (const { field, incr } of params) {
      ppl.hincrby(this.options.key, field + "", incr)
    }

    const incrRes = await this._exec(ppl)

    const ret: { field: string, val: number }[] = []

    for (let i = 0; i < params.length; i++) {
      const { field } = params[i]

      ret.push({ field, val: incrRes[i] })
    }

    return ret
  }
}

export default RedisHash
