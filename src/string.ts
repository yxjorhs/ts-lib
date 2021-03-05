type ITemplateName = "number" | "letter" | "char"

/**
 * 返回随机字符串
 * @param length 字符串长度
 * @param template_name 模板名
 */
export function random(length: number, templateName: ITemplateName) {
  const str = [];
  const tpl = getTemplate(templateName)
  const tpll = tpl.length
  for (let i = 0; i < length; i++) {
    str.push(
      tpl.charAt(Math.floor(Math.random() * tpll))
    );
  }
  return str.join("");
}

/**
 * 字符串转数字
 * @param str 字符串
 * @param templateName 模板名
 */
export function toNumber(str: string, templateName: ITemplateName) {
  let number = 0;
  const strl = str.length;
  const tpl = getTemplate(templateName)
  const tpll = tpl.length

  for (let i = 0; i < strl; i++) {
    number *= tpll;
    const char = str[i];
    const index = tpl.indexOf(char)
    if (index === -1) {
      throw new Error(`char[${char}]无效`)
    }
    number += index;
  }

  return number;
}

/**
 * 把数字转字符串
 * @param num 数字
 * @param templateName 模板名
 */
export function parseNumber(num: number, templateName: ITemplateName) {
  let str = "";
  const tpl = getTemplate(templateName)
  const tpll = tpl.length

  while (num || str === "") {
    str = tpl[num % tpll] + str;
    num = Math.floor(num / tpll);
  }

  return str;
}

// 下划线转驼峰
export function underscoreToCamelCase(str: string) {
  return str
    .replace(/^[_.\- ]+/, "")
    .toLowerCase()
    .replace(/[_.\- ]+(\w|$)/g, (m, p1) => p1.toUpperCase());
}

/**
 * 根据Template值获取模板
 * @param template
 */
function getTemplate(templateName: ITemplateName) {
  const number = "0123456789"
  const lowerCase = "abcdefghijklmnopqrstuvwxyz"
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const letter = `${lowerCase}${upperCase}`
  const chars = `${lowerCase}${upperCase}${number}`

  if (templateName === "number") {
    return number
  }
  if (templateName === "letter") {
    return letter
  }

  return chars
}
