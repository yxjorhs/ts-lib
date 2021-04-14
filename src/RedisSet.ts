import RedisCommon from "./RedisCommon";

class RedisSet extends RedisCommon {
  public async sadd(...members: string[]): Promise<number> {
    return this.runCommand(ppl => ppl.sadd(this.options.key, ...members))
  }

  public async scard(): Promise<number> {
    return this.runCommand(ppl => ppl.scard(this.options.key))
  }

  public async smembers(): Promise<string[]> {
    return this.runCommand(ppl => ppl.smembers(this.options.key))
  }
}

export default RedisSet
