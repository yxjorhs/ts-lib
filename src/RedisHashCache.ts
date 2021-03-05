import { Redis } from "ioredis"

/**
 * 在redis的hash上附加功能
 * 1.key管理
 * 2.缓存丢失恢复
 * 3.默认过期时间，多久没有使用则自动过期
 */
export default class RedisHashCache<T extends number | string, T2> {
  private readonly expireIn: number

  constructor(private readonly options: {
    /** IORedis实例 */
    redis: Redis,
    /** 缓存名称、用作key前缀 */
    name: string,
    /** 缓存丢失恢复 */
    refresh: (field: T) => Promise<T2>,
    /** 默认过期时间 */
    expireIn?: number
  }) {
    this.expireIn = options.expireIn || 86400 * 7
  }

  /**
   * 获取缓存，延长缓存过期时间，缓存不存在时可更新缓存并返回
   * @param field
   */
  public async get(field: T): Promise<T2> {
    const [[,cache]] = await this.options.redis
      .pipeline()
      .hget(this.rdsKey.cache, field + "")
      .expire(this.rdsKey.cache, this.expireIn)
      .exec()

    if (cache) {
      return JSON.parse(cache)
    }

    return this.refresh(field)
  }

  /**
   * 批量获取缓存
   * @param fields
   */
  public async mget(fields: T[]): Promise<T2[]> {
    const [[,cache]] = await this.options.redis
      .pipeline()
      .hmget(this.rdsKey.cache, ...fields.map(field => field + ""))
      .expire(this.rdsKey.cache, this.expireIn)
      .exec()

    const ret: T2[] = []

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

  public async incr(params: { field: T, incr: number }[]) {
    if (params.length === 0) {
      return []
    }

    const ppl = this.options.redis.pipeline()

    for (const { field, incr } of params) {
      await this.options.redis.hincrby(this.rdsKey.cache, field + "", incr)
    }

    const incrRes = await ppl.exec()

    const ret: { field: T, val: number }[] = []

    for (let i = 0; i < incrRes.length; i++) {
      const { field, incr } = params[i]
      let val = incrRes[i][1]

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
  public async del(...fields: T[]) {
    await this.options.redis.hdel(this.rdsKey.cache, ...fields.map(v => v + ""))
  }

  /**
   * 清空所有缓存
   */
  public async clear() {
    await this.options.redis.del(this.rdsKey.cache)
  }

  /**
   * 更新指定缓存
   */
  private async refresh(field: T) {
    const data = await this.options.refresh(field)

    await this.options.redis
      .pipeline()
      .hset(this.rdsKey.cache, field + "", JSON.stringify(data))
      .exec()

    return data
  }

  private get rdsKey() {
    return {
      cache: `${this.options.name}:cache`,
    }
  }
}
