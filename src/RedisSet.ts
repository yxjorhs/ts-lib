import RedisDataBase from "./RedisDataBase";

class RedisSet extends RedisDataBase {
  public async sadd(...members: string[]): Promise<number> {
    const v = await this.redis.sadd(this.key, ...members)

    await this._updExp("write")

    return v
  }

  public async scard(): Promise<number> {
    const v = await this.redis.scard(this.key)

    await this._updExp("read")

    return v
  }

  public async smembers(): Promise<string[]> {
    const v = await this.redis.smembers(this.key)

    await this._updExp("read")

    return v
  }
}

export default RedisSet
