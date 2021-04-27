import RedisCommon from "./RedisCommon";

export class RedisHashCom extends RedisCommon {
  protected async _hget(field: string): Promise<string> {
    return this.runCommand(ppl => ppl.hget(this.options.key, field))
  }

  protected async _hmget(...fields: string[]): Promise<(string | null)[]> {
    if (fields.length === 0) {
      return []
    }

    const cache = await this.runCommand(ppl => ppl.hmget(this.options.key, ...fields))

    const ret: (string | null)[] = []

    for (let i = 0; i < fields.length; i++) ret.push(cache[i] || null);

    return ret
  }

  protected async _hdel(field: string, ...fields: string[]): Promise<number> {
    return this.options.redis.hdel(this.options.key, field, ...fields.map(v => v + ""))
  }

  protected async _hset(field: string, v: string | number, ...args: (string | number)[]) {
    await this.runCommand(ppl => ppl.hset(this.options.key, field, v, ...args))
  }

  protected async _hgetall(): Promise<Record<string, string>> {
    return this.runCommand(ppl => ppl.hgetall(this.options.key))
  }
}