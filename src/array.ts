/**
 * 从数组随机获取
 * @param arr 数组
 * @param rateBy 根据数组值生成随机概率
 */
export function random<T>(arr: T[], rateBy: (v: T) => number) {
  if (!arr.length) {
    return null
  }

  let res: T | null = null

  const totalRate = arr.reduce((total, item) => total + rateBy(item), 0)

  let rd = Math.random() * totalRate;

  for (const item of arr) {
    if (rd < rateBy(item)) {
      res = item;
      break;
    }
    rd -= rateBy(item);
  }

  return res;
}

/**
 * TODO 优化输出输出值的类型提示
 * 数组转对象
 * @param arr 数组
 * @param key 用于做对象索引的键
 * @param valueBuildFunc 对象值的生成规则
 */
export function toObject<T extends Record<string, any>>(
  arr: T[],
  key: string,
  valueBuildFunc?: (data: T) => any
) {
  const res: Record<string, Record<string, T> | any> = {}

  for (const item of arr) {
    res[item[key]] = valueBuildFunc ? valueBuildFunc(item) : item
  }

  return res
}
