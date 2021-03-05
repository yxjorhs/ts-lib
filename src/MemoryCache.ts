export default class MemoryCache<T = any> {
  // 是否在更新
  protected isUpdating: boolean = false;
  // 缓存过期时间戳
  protected expireAt: number = 0;
  // 缓存
  protected data: T | null = null;

  /**
   * 内存缓存
   * @param expireIn 过期时间(单位:秒)
   * @param update 数据更新函数
   */
  constructor(protected readonly expireIn: number, protected readonly update: () => Promise<T>) {}

  /** 获取数据 */
  public async get() {
    const now = Date.now()

    // 已过期 && (不在更新中 || 数据为空) 则更新数据
    if (this.expireAt < now && (!this.isUpdating || this.data === null)) {
      this.isUpdating = true;
      try {
        this.data = await this.update();
        this.expireAt = this.getExpireAt()
      } finally {
        this.isUpdating = false;
      }
    }

    return this.data as T;
  }

  /** 将数据标记为已过期  */
  public expired() {
    this.expireAt = Date.now() - 1;
  }

  // 获取过期时间
  protected getExpireAt() {
    const now = Date.now()

    const expireInMs = this.expireIn * 1000

    const baseTime = new Date("2000/01/01").getTime()

    // expireIn刚好为一天时，0点更新
    return baseTime + Math.ceil((now - baseTime) / expireInMs) * expireInMs
  }
}
