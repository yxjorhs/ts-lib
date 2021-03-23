import { Redis } from "ioredis"
import RedisCommon from "./RedisCommon"

/**
 * 在redis的sortedset上附加功能
 * 1.key管理
 * 2.缓存丢失恢复
 * 3.默认过期时间，多久没有使用则自动过期
 */
export default class RedisSortedSet extends RedisCommon {
  private readonly defaultExpireIn = 86400 * 7

  constructor(readonly options: {
    /** IORedis实例 */
    redis: Redis,
    /** 缓存key */
    key: string,
    /** 缓存过期时间 */
    expireIn?: number,
    /** 缓存丢失恢复 */
    refresh?: (member: string) => Promise<number>
  }) {
    super()
  }

  public async zadd(params: { member: string, score: number }[]): Promise<number> {
    const args: (string | number)[] = []

    for (const { member, score } of params) {
      args.push(score)
      args.push(member)
    }

    const dt = await this.options.redis
      .pipeline()
      .zadd(this.options.key, ...args)
      .expire(this.options.key, this.options.expireIn || this.defaultExpireIn)
      .exec()

    const [upd_count] = this.parseExec(dt)

    return Number(upd_count)
  }

  public zrange(start: number, stop: number): Promise<string[]>;
  public zrange(start: number, stop: number, withScores: true): Promise<{ member: string, score: number }[]>
  public async zrange(start: number, stop: number, withScores?: true): Promise<string[] | {member:string, score: number}[]> {
    return this.zrangeHelper("zrange", start, stop, withScores)
  }

  public zrevrange(start: number, stop: number): Promise<string[]>;
  public zrevrange(start: number, stop: number, withScores: true): Promise<{ member: string, score: number }[]>
  public async zrevrange(start: number, stop: number, withScores?: true): Promise<string[] | {member:string, score: number}[]> {
    return this.zrangeHelper("zrevrange", start, stop, withScores)
  }

  private async zrangeHelper(func: "zrange" | "zrevrange", start: number, stop: number, withScores?: true) {

    const ppl = this.options.redis.pipeline()

    if (!withScores) {
      ppl[func](this.options.key, start, stop)
    } else {
      ppl[func](this.options.key, start, stop, "WITHSCORES")
    }

    ppl.expire(this.options.key, this.options.expireIn || this.defaultExpireIn)

    const exec = await ppl.exec()

    const [data] = this.parseExec(exec)

    if (!withScores) {
      return data
    }

    const ret: { member: string, score: number }[] = []

    for (let i = 0; i < data.length; i += 2) {
      ret.push({ member: data[i], score: Number(data[i+1]) })
    }

    return ret
  }

  public async zincrby(member: string, incr: number): Promise<number> {
    const exec = await this.options.redis
      .pipeline()
      .zincrby(this.options.key, incr, member)
      .expire(this.options.key, this.options.expireIn || this.defaultExpireIn)
      .exec()

    const [valStr] = this.parseExec(exec)

    const val = Number(valStr)

    // 结果与增长值相同时，原先值可能发生丢失
    if (val === incr) {
      return this.refresh(member, val)
    }

    return val
  }

  /**
   * 按顺序批量获取多个member的score
   *
   * @param {string[]} members
   * @memberof RedisSortedSet
   */
  public async zmscore(members: string[]): Promise<number[]> {
    if (members.length === 0) {
      return []
    }

    const ppl = this.options.redis.pipeline()

    for (const member of members) {
      ppl.zscore(this.options.key, member)
    }

    ppl.expire(this.options.key, this.options.expireIn || this.defaultExpireIn)

    const exec = await ppl.exec()

    const data = this.parseExec(exec)

    const ret: number[] = []

    for (let i = 0; i < members.length; i++) {
      ret.push(data[i] === null ? await this.refresh(members[i]) : Number(data[i]))
    }

    return ret
  }

  /**
   * 刷新缓存数据
   *
   * @private
   * @param {string} member 字段
   * @param {number} valCurrent 当前值
   * @return {*}  {Promise<number>}
   * @memberof RedisSortedSet
   */
  private async refresh(member: string, valCurrent?: number): Promise<number> {
    if (this.options.refresh === undefined) {
      return valCurrent || 0
    }

    const data = await this.options.refresh(member)

    if (data === valCurrent) {
      return data
    }

    const exec = await this.options.redis
      .pipeline()
      .zadd(this.options.key, data, member)
      .expire(this.options.key, this.options.expireIn || this.defaultExpireIn)
      .exec()

    this.parseExec(exec)

    return data
  }
}
