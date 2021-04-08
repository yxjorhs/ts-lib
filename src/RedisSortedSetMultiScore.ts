import * as Redlock from "redlock"
import RedisCommon from "./RedisCommon";

/**
 * 支持按多个score排序的Redis有序集合
 */
class RedisSortedSetMultiScore extends RedisCommon {
  constructor(readonly options: RedisCommon.Options & {
    // 数组长度表示可存放多少个score，数组中的值表示每个score的最大长度
    scoresLen: number[]
  }) {
    super(options)
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

    await this.runCommand(ppl => {
      return ppl.zadd(this.options.key, newScore, member)
    })

    await lock.unlock()
  }

  /**
   * 获取score
   * @param member
   */
  public async score(member: string): Promise<number[]> {
    return this.parseScore(await this.runCommand(ppl => ppl.zscore(this.options.key, member)))
  }

  /**
   * 获取递增排名
   * @param member
   */
  public async rank(member: string): Promise<number | null> {
    return this.runCommand(ppl => ppl.zrank(this.options.key, member))
  }

  /**
   * 获取递减排名
   * @param member
   */
  public async revrank(member: string): Promise<number | null> {
    return this.runCommand(ppl => ppl.zrevrank(this.options.key, member))
  }

  /**
   * 按score递增列出
   * @param start
   * @param stop
   */
  public async range(start: number, stop: number): Promise<{ member: string, scores: number[] }[]> {
    return this.parseRangeData(await this.runCommand(ppl => ppl.zrange(this.options.key, start, stop, "WITHSCORES")))
  }

  /**
   * 按score递减列出
   */
  public async revrange(start: number, stop: number): Promise<{ member: string, scores: number[] }[]> {
    return this.parseRangeData(await this.runCommand(ppl => ppl.zrevrange(this.options.key, start, stop, "WITHSCORES")))
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