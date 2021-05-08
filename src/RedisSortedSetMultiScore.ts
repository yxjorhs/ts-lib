import * as Redlock from "redlock"
import RedisDataBase from "./RedisDataBase"

class RedisSortedSetMultiScore extends RedisDataBase {
  /**
   * 支持按多个score排序的Redis有序集合
   */
  constructor(readonly options: RedisDataBase.Options & {
    // 数组长度表示可存放多少个score，数组中的值表示每个score的最大长度
    scoresLen: number[]
  }) {
    super(options)

    if (this.isScoresLenValid() === false) {
      throw new Error(`scoresLen最多累计15位`)
    }
  }

  /**
   * scoresLen是否有效
   * @param scoresLen
   */
  private isScoresLenValid(): boolean {
    // 有序集合的score有效数字大概17位（双精度浮点数）, 因此需要保证保存score最大为16位，由于被占了1位(toScore)，因此只允许外部传入最多15位
    return this.options.scoresLen.reduce((a, b) => a + b, 0) <= 15
  }

  /**
   * 更新排行榜score
   * @param member
   * @param update 更新参数, set=将score修改为指定值，incr将score自增指定值
   */
  public async update(member: string, scores: ({ set: number } | { incr: number })[]) {
    const lock = await new Redlock([this.options.redis]).lock(this.options.key + "update:" + member + ":lock", 300)

    const oldScore = await this.options.redis.zscore(this.options.key, member)

    const oldScores = this.parseScore(oldScore)

    const newScores: number[] = oldScores.map((v, i) => {
      if ((scores[i] as any).set !== undefined) {
        v = (scores[i] as any).set
      }

      if ((scores[i] as any).incr !== undefined) {
        v += (scores[i] as any).incr
      }

      return v
    })

    const newScore = this.toScore(newScores)

    await this.options.redis.zadd(this.options.key, newScore, member)

    await this._updExp("read")

    await lock.unlock()
  }

  /**
   * 获取score
   * @param member
   */
  public async score(member: string): Promise<number[]> {
    const v = this.parseScore(await this.options.redis.zscore(this.options.key, member))

    await this._updExp("read")

    return v
  }

  /**
   * 获取递增排名
   * @param member
   */
  public async rank(member: string): Promise<number | null> {
    const v = await this.options.redis.zrank(this.options.key, member)

    await this._updExp("read")

    return v
  }

  /**
   * 获取递减排名
   * @param member
   */
  public async revrank(member: string): Promise<number | null> {
    const v = await this.options.redis.zrevrank(this.options.key, member)

    await this._updExp("read")

    return v
  }

  /**
   * 按score递增列出
   * @param start
   * @param stop
   */
  public async range(start: number, stop: number): Promise<{ member: string, scores: number[] }[]> {
    const v = this.parseRangeData(await this.options.redis.zrange(this.options.key, start, stop, "WITHSCORES"))

    await this._updExp("read")

    return v
  }

  /**
   * 按score递减列出
   */
  public async revrange(start: number, stop: number): Promise<{ member: string, scores: number[] }[]> {
    const v = this.parseRangeData(await this.options.redis.zrevrange(this.options.key, start, stop, "WITHSCORES"))

    await this._updExp("read")

    return v
  }

  private parseRangeData(data: string[]) {
    const ret: { member: string, scores: number[] }[] = []

    for (let i = 0; i < data.length; i+=2) {
      ret.push({ member: data[i], scores: this.parseScore(data[i+1]) })
    }

    return ret
  }

  /**
   * 将redis保存的score解析为多个score
   */
  private parseScore(score: string | null): number[] {
    if (score === null) {
      return Array.from({ length: this.options.scoresLen.length }, () => 0)
    }

    const ret: number[] = []

    score = score.slice(1)

    for (const v of this.options.scoresLen) {
      ret.push(Number(score.slice(0, v)))
      score = score.slice(v)
    }

    return ret
  }

  /**
   * 将多个score合并为一个redis保存的score
   * @param scores
   */
  private toScore(scores: number[]) {
    if (scores.length !== this.options.scoresLen.length) {
      throw new Error(`scores长度不符`)
    }

    let score = "1"

    for (let i = 0; i < scores.length; i++) {
      if (scores[i].toString().length > this.options.scoresLen[i]) {
        throw new Error(`score长度超过限制`)
      }

      score += scores[i].toString().padStart(this.options.scoresLen[i], "0")
    }


    return score
  }
}

export default RedisSortedSetMultiScore