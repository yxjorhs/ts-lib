import RedisDataBase from "./RedisDataBase"

class RedisSortedSet extends RedisDataBase {
  public async zadd(params: { member: string, score: number }[]) {
    const args: (string | number)[] = []

    for (const { member, score } of params) {
      args.push(score)
      args.push(member)
    }

    const {redis, key} = this.options

    const v = await redis.zadd(key, ...args)

    await this._updExp("write")

    return v
  }

  public zrange(start: number, stop: number): Promise<string[]>;
  public zrange(start: number, stop: number, withScores: true): Promise<{ member: string, score: number }[]>
  public async zrange(start: number, stop: number, withScores?: true): Promise<string[] | {member:string, score: number}[]> {
    const v = await this.zrangeHelper("zrange", start, stop, withScores)

    await this._updExp("read")

    return v
  }

  public zrevrange(start: number, stop: number): Promise<string[]>;
  public zrevrange(start: number, stop: number, withScores: true): Promise<{ member: string, score: number }[]>
  public async zrevrange(start: number, stop: number, withScores?: true): Promise<string[] | {member:string, score: number}[]> {
    return this.zrangeHelper("zrevrange", start, stop, withScores)
  }

  private async zrangeHelper(func: "zrange" | "zrevrange", start: number, stop: number, withScores?: true) {

    const ppl = this.redis.pipeline()


    if (!withScores) {
      ppl[func](this.key, start, stop)
    } else {
      ppl[func](this.key, start, stop, "WITHSCORES")
    }

    const [data] = await this._exec(ppl)

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
    const valStr = await this.redis.zincrby(this.key, incr, member)

    const val = Number(valStr)

    await this._updExp("write")

    return val
  }

  /**
   * 按顺序批量获取多个member的score
   *
   * @param {string[]} members
   * @memberof RedisSortedSet
   */
  public async zmscore(members: string[]): Promise<(number)[]> {
    if (members.length === 0) {
      return []
    }

    const ppl = this.redis.pipeline()

    for (const member of members) {
      ppl.zscore(this.key, member)
    }

    const data = await this._exec(ppl)

    const ret: number[] = members.map((_, i) => Number(data[i]))

    await this._updExp("read")

    return ret
  }

  public async zrank(member: string): Promise<number | null> {
    const v = await this.redis.zrank(this.key, member)

    await this._updExp("read")

    return v
  }

  public async zrevrank(member: string): Promise<number | null> {
    const v = await this.redis.zrevrank(this.key, member)

    await this._updExp("read")

    return v
  }
}

export default RedisSortedSet
