import RedisCommon from "./RedisCommon";

export class RedisHashCom extends RedisCommon {
  /**
   * 删除指定field
   */
  public async hdel(field: string, ...fields: string[]) {
    await this.options.redis.hdel(this.options.key, field, ...fields.map(v => v + ""))
  }
}