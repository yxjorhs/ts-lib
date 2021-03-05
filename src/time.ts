export const ms = {
  min: 60000,
  hour: 3600000,
  day: 86400000,
};

/**
 * 时间格式化(返回当地时间)
 * @param date 时间
 * @param fmt 格式
 */
export function format(date: Date = new Date(), fmt: string = "yyyy/MM/dd hh:mm:ss"): string {
  const o: any = {
    "M+": date.getMonth() + 1, // 月份
    "d+": date.getDate(), // 日
    "h+": date.getHours(), // 小时
    "m+": date.getMinutes(), // 分
    "s+": date.getSeconds(), // 秒
    "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds().toString().padStart(3, "0"), // 毫秒
  };
  fmt = /(y+)/.test(fmt)
    ? fmt.replace(RegExp.$1, `${date.getFullYear()}`.substr(4 - RegExp.$1.length))
    : fmt;
  Object.keys(o).filter(k => {
    fmt = new RegExp(`(${k})`).test(fmt)
      ? fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length))
      : fmt;
    return true;
  });
  return fmt;
}

/**
 * 获取指定时间当天0点时间
 * @param date 时间
 * @param offset 日偏移量, -1往前1天，1往后1天
 */
export function getDate({
  date,
  offset
} : {
  date?: Date
  offset?: number
} = {}): Date {
  date = date || new Date()
  offset = offset || 0
  date.setHours(0, 0, 0, 0);
  return new Date(date.getTime() + offset * ms.day);
}

/**
 * 获取指定时间当周周一0点时间(周日作为每周最后1天)
 * @param date 时间
 * @param woffset 周偏移量，-1往前1周，1往后1周
 */
export function getWeek({
  date,
  wOffset
}: {
  date?: Date,
  wOffset?: number
} = {}): Date {
  date = date || new Date()
  wOffset = wOffset || 0
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + (1 - (date.getDay() || 7)) + wOffset * 7)
  return date
}

/**
 * 获取指定日期当月1号0点时间
 * @param date 时间
 * @param mOffset 月便宜量，-1往前1月，1往后1月
 */
export function getMonth({
  date,
  mOffset
}: {
  date?: Date,
  mOffset?: number
} = {}): Date {
  date = date || new Date()
  mOffset = mOffset || 0
  date.setHours(0, 0, 0, 0);
  date.setDate(1);
  date.setMonth(date.getMonth() + mOffset)
  return date;
}

/**
 * sleep
 * @param n 毫秒数
 */
export function sleep(n: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => resolve(), n);
  });
}
