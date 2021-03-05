/**
 * 密码校验
 * 密码中必须包含字母、数字、特称字符，至少8个字符，最多30个字符
 * @param password
 */
export function checkPassword(password: string): boolean {
  return new RegExp(
    "(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,30}"
  ).test(password);
}

/**
 * 手机号校验
 * @param phone
 */
export function checkPhone(phone: string): boolean {
  return /^1[3456789]\d{9}$/.test(phone)
}

/**
 * 身份证验证
 * @param IDCard
 */
export function checkIDCard(IDCard: string): boolean {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(IDCard)
}
