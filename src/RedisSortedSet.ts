import RedisCommon from "./RedisCommon"

/**
 * 在redis的sortedset上附加功能
 * 1.key管理
 * 2.缓存丢失恢复
 * 3.默认过期时间，多久没有使用则自动过期
 */
class RedisSortedSet extends RedisCommon {
  constructor(readonly options: RedisCommon.Options & {
    /** 缓存丢失恢复 */
    refresh?: (member: string) => Promise<number>
  }) {
    super(options)
  }

  public async zadd(params: { member: string, score: number }[]): Promise<number> {
    const args: (string | number)[] = []

    for (const { member, score } of params) {
      args.push(score)
      args.push(member)
    }

    return this.runCommand(ppl => ppl.zadd(this.options.key, ...args))
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

    const [data] = await this.runCommands(ppl => {
      if (!withScores) {
        ppl[func](this.options.key, start, stop)
      } else {
        ppl[func](this.options.key, start, stop, "WITHSCORES")
      }
      return ppl
    })

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
    const valStr = await this.runCommand(ppl => ppl.zincrby(this.options.key, incr, member))

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

    const data = await this.runCommands(ppl => {
      for (const member of members) {
        ppl.zscore(this.options.key, member)
      }

      return ppl
    })

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

    await this.runCommands(ppl => ppl.zadd(this.options.key, data, member))

    return data
  }
}

export default RedisSortedSet
