export default class RedisCommon {
  protected parseExec(data: [Error | null, any][]): any[] {
    const ret: any[] = []

    for (const [e, v] of data) {
      if (e) {
        throw e
      }

      ret.push(v)
    }

    return ret
  }
}