import * as assert from "assert"
import { Redis } from "ioredis";
import RedisHelper from "./RedisHelper";

type _Option<T extends Record<string, unknown>> = {
  /** redis实例 */
  redis: Redis,
  /** key前缀 */
  keyPrefix: string,
  expireIn?: number
  /** 被管理的缓存 */
  cache: {
    [name in keyof T]: {
      /** 缓存刷新来源 */
      r: (() => Promise<T[name]>) | ((field: string) => Promise<T[name]>)
      /** 触发缓存刷新的事件 */
      re?: string[]
    }
  }
}

/**
 * redis缓存管理者
 * 1.管理多个缓存, 无需field即可刷新的函数共用一个hash表保存，需要field刷新的函数单独启用一个hash表
 * 2.通过事件刷新缓存
 */
class RedisCacheManager<T extends Record<string, unknown>> extends RedisHelper{
  private readonly expireIn = 86400 * 7
  private readonly commonHashName = "common"

  constructor(private readonly option: _Option<T>) {
    super();

    if (this.option.expireIn) {
      this.expireIn = this.option.expireIn
    }
  }

  /** 获取缓存 */
  public async get<Name extends keyof T>(name: Name): Promise<T[Name]>

  public async get<Name extends keyof T>(name: Name, fields: string[]): Promise<Record<string, T[Name]>>

  public async get<Name extends keyof T>(name: Name, fields?: string[]): Promise<T[Name] | Record<string, T[Name]>> {
    const ret = fields === undefined
      ? await this.getFromCommonHash(name)
      : await this.getFromNameHash(name, fields)

    if (this.needSetExpire(name)) await this.setExpire(name)
      
    return ret
  }

  /** 从共用hash获取缓存 */
  private async getFromCommonHash<Name extends keyof T>(name: Name): Promise<T[Name]> {
    assert(this.isNameNeedField(name) === false, `name[${name}]需要field`)

    const key = this.commonHashKey()
    const field = name as string

    const cacheVal = await this.option.redis.hget(key, field)

    // 缓存存在则返回，不存在则刷新
    if (cacheVal) return JSON.parse(cacheVal)

    return this.refreshCommonHash(name)
  }

  /** 从私有hash获取缓存, 配置中刷新函数带field的cache会单独是有一个hash */
  private async getFromNameHash<Name extends keyof T>(name: Name, fields: string[]): Promise<Record<string, T[Name]>> {
    assert(this.isNameNeedField(name) === true, `name[${name}]不需要field`)
    assert(fields.length > 0, `fields不能为空数组`)

    const ret: Record<string, T[Name]> = {}
    
    const key = this.nameHashKey(name)
    
    const cache = await this.option.redis.hmget(key, ...fields)

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]
      const str = cache[i]

      // 缓存存在则返回、不存在则刷新
      if (str) {
        ret[field] = JSON.parse(str)
        continue
      }
      
      ret[field] = await this.refreshNameHash(name, field)
    }

    return ret
  }

  /** 批量获取缓存，每个key都会返回一个只有两个元素的数组，key不需要field时从第一个元素获取，key需要field时从第二个元素获取 */
  public async mget<Name extends keyof T>(...names: (Name | [Name, string[]])[]): Promise<{
    [n in Name]: [T[n], Record<string, T[n]>]
  }> {
    const ret: {
      [n in Name]: [T[n], Record<string, T[n]>]
    } = {} as any

    assert(names.length > 0, `缺少参数`)

    // 需要设置过期时间的的name
    const needUpdateExpireNames: Name[] = []

    const ppl = this.option.redis.pipeline()

    for (const n of names) {
      // n为数组时从私有hash获取数据，否则从共用hash获取
      if (n instanceof Array) {
        const [name, fields] = n
        assert(this.isNameNeedField(name) === true, `name[${name}]不需要field`)
        assert(fields.length > 0, `fields不能为空数组`)

        ppl.hmget(this.nameHashKey(name), ...fields)
        if (this.needSetExpire(name)) needUpdateExpireNames.push(name)

        continue;
      }

      assert(this.isNameNeedField(n) === false, `name[${n}]需要field`)
      ppl.hget(this.commonHashKey(), n as string)
      if (this.needSetExpire(n)) needUpdateExpireNames.push(n)
    }

    const cache = await this._exec(ppl)

    // 需要更新过期时间
    if (needUpdateExpireNames.length) await this.setExpire(...needUpdateExpireNames)

    // 填充ret，没缓存的从refresh获取
    for (let i = 0; i < names.length; i++) {
      const n = names[i]
      const cac = cache[i]

      // 私有hash的数据
      if (n instanceof Array) {
        const v2: Record<string, T[Name]> = {}

        for (let i = 0; i < n[1].length; i++) {
          const field = n[1][i]
          const str = cac[i]

          if (str) {
            v2[field] = JSON.parse(str)
            continue
          }
          
          v2[field] = await this.refreshNameHash(n[0], field) as any
        }

        ret[n[0]] = [null as any, v2]

        continue
      }

      // 共用hash的数据
      const val = cac !== null ? JSON.parse(cac) : await this.refreshCommonHash(n)
      ret[n] = [val, null as any]
    }

    return ret
  }

  /** 更新{ev}对应的缓存，带field的缓存可更新指定的{field} */
  public async refresh(ev: string, field?: string) {}

  /** 字典: 各个hash最近一次'更新过期时间'的时间 */
  private hashExpireTimeDict: Record<string, number> = {}

  /** 判断{name}对应的hash是否需要更新过期时间 */
  private needSetExpire<Name extends keyof T>(name: Name): boolean {
    const str = this.isNameNeedField(name) ? name as string : this.commonHashName
    
    const lastSetAt = this.hashExpireTimeDict[str] || 0

    // 当前距离上次设置时间超过expireIn的75%时需要更新缓存有效时间
    return (Date.now() - lastSetAt) > (this.expireIn * 0.75) 
  }

  /** 更新{names}对应的hash的过期时间 */
  private async setExpire<Name extends keyof T>(...names: Name[]) {
    assert(names.length)

    const ppl = this.option.redis.pipeline()

    const haveSet: Record<string, true> = {}

    for (const name of names) {
      const key = this.isNameNeedField(name)
        ? this.commonHashKey()
        : this.nameHashKey(name)

      if (haveSet[key]) continue

      haveSet[key] = true
      
      ppl.expire(key, this.expireIn)

      this.hashExpireTimeDict[key] = Date.now()
    }

    await ppl.exec()
  }

  /** 返回共用hash的key */
  private commonHashKey() {
    return `${this.option.keyPrefix}${this.commonHashName}`
  }

  /** 返回${name}对应的hash的key */
  private nameHashKey<Name extends keyof T>(name: Name) {
    return `${this.option.keyPrefix}${name}`
  }

  /** 返回${name}是否需要field */
  private isNameNeedField<Name extends keyof T>(name: Name): boolean {
    return Boolean(this.getCacheConfig(name).r.length)
  }

  /** 返回${name}的缓存配置 */
  private getCacheConfig<Name extends keyof T>(name: Name) {
    const cacheConfig = this.option.cache[name]

    assert(cacheConfig, `name[${name}]无效`);

    return cacheConfig
  }

  /** 刷新并返回共用hash的{name}字段数据 */
  private async refreshCommonHash<Name extends keyof T>(name: Name): Promise<T[Name]> {
    // 不存在则从r函数获取并保存到redis
    const val = await (this.getCacheConfig(name).r as any)()
    await this.option.redis.hset(this.commonHashKey(), name as string, JSON.stringify(val))

    return val
  }

  /** 刷新并返回共用${name}对应的hash的{field}字段数据 */
  private async refreshNameHash<Name extends keyof T>(name: Name, field: string) {
    const val = await this.getCacheConfig(name).r(field) 

    await this.option.redis.hset(this.nameHashKey(name), field, JSON.stringify(val))

    return val
  }
}

export default RedisCacheManager
