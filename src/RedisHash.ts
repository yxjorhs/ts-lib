import { Redis } from "ioredis"
import RedisCommon from "./RedisCommon"

/**
 * 在redis的hash上附加功能
 * 1.key管理
 * 2.缓存丢失恢复
 * 3.默认过期时间，多久没有使用则自动过期
 */
export default class RedisHash<T> extends RedisCommon {
  private readonly defaultExpireIn = 86400 * 7

  constructor(private readonly options: {
    /** IORedis实例 */
    redis: Redis,
    /** 缓存key */
    key: string,
    /** 缓存丢失恢复 */
    refresh?: (field: string) => Promise<T>,
    /** 缓存过期时间 */
    expireIn?: number
  }) {
    super()
  }

  /**
   * 获取缓存，延长缓存过期时间，缓存不存在时可更新缓存并返回
   * @param field
   */
  public async hget(field: string): Promise<T | null> {
    const dt = await this.options.redis
      .pipeline()
      .hget(this.options.key, field + "")
      .expire(this.options.key, this.options.expireIn || this.defaultExpireIn)
      .exec()

    const [cache] = this.parseExec(dt)

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

    const dt = await this.options.redis
      .pipeline()
      .hmget(this.options.key, ...fields.map(field => field + ""))
      .expire(this.options.key, this.options.expireIn || this.defaultExpireIn)
      .exec()

    const [cache] = this.parseExec(dt)

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

    const ppl = this.options.redis.pipeline()

    for (const { field, incr } of params) {
      ppl.hincrby(this.options.key, field + "", incr)
    }

    ppl.expire(this.options.key, this.options.expireIn || this.defaultExpireIn)

    const exec = await ppl.exec()

    const incrRes = this.parseExec(exec)

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
   * 删除指定缓存
   */
  public async hdel(...fields: string[]) {
    await this.options.redis.hdel(this.options.key, ...fields.map(v => v + ""))
  }

  /**
   * 清空所有缓存
   */
  public async clear() {
    await this.options.redis.del(this.options.key)
  }

  /**
   * 更新指定缓存
   */
  private async refresh(field: string) {
    if (this.options.refresh === undefined) {
      return null
    }

    const data = await this.options.refresh(field)

    const dt = await this.options.redis
      .pipeline()
      .hset(this.options.key, field + "", JSON.stringify(data))
      .expire(this.options.key, this.options.expireIn || this.defaultExpireIn)
      .exec()

    this.parseExec(dt)

    return data
  }
}
