import * as assert from "assert"
import RedisDataBase from "./RedisDataBase"

class RedisHash extends RedisDataBase {
  /**
   * 获取缓存，延长缓存过期时间，缓存不存在时可更新缓存并返回
   * @param field
   */
  public async hget(field: string): Promise<string | null> {
    const v = await this.redis.hget(this.key, field)

    await this._updExp("read")

    return v
  }

  public async hgetall(): Promise<Record<string, string>> {
    const v = await this.redis.hgetall(this.key)

    await this._updExp("read")

    return v
  }

  public async hset(field: string, val: string, ...args: string[]) {
    const v = await this.redis.hset(this.key, field, val, ...args)

    await this._updExp("write")

    return v
  }

  public async hdel(...fields: string[]) {
    assert(fields.length > 0, "缺少field")

    const v = await this.redis.hdel(this.key, ...fields.map(fie => fie + ""))

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

    const v = await this.redis.hmget(this.key, ...fields);

    await this._updExp("read")

    return v
  }

  /** 以管道的方式对多个member执行hincrby */
  public async hmincrby(params: { field: string, incr: number }[]) {
    if (params.length === 0) {
      return []
    }

    const ppl = this.redis.pipeline()

    for (const { field, incr } of params) {
      ppl.hincrby(this.key, field + "", incr)
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
