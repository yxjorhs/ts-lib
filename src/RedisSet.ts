import RedisDataBase from "./RedisDataBase";

class RedisSet extends RedisDataBase {
  public async sadd(...members: string[]): Promise<number> {
    const v = await this.options.redis.sadd(this.options.key, ...members)

    await this._updExp("write")

    return v
  }

  public async scard(): Promise<number> {
    const v = await this.options.redis.scard(this.options.key)

    await this._updExp("read")

    return v
  }

  public async smembers(): Promise<string[]> {
    const v = await this.options.redis.smembers(this.options.key)

    await this._updExp("read")

    return v
  }
}

export default RedisSet
