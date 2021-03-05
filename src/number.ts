export function randomBetween(left: number, right: number, digits: number) {
  const min = Math.min(left, right)
  const max = Math.max(left, right)
  const num = min + Math.random() * (max - min)
  return Number(num.toFixed(digits));
}
