/**
 * 快速排序
 *
 * 将基数放到合适的位置上，小于基数的放左边，大于基数的放右边
 *
 * 步骤：
 * 1.在数组左右设置两个点，以左边的数为基数
 * 2.右边开始向左走，遇到小于基数的值A时停下
 * 3.左边向右走，遇到大于基数的值B时停下，交换AB位置
 * 4.重复2,3，直到左右相遇
 * 5.将相遇的位置C的值跟数组最左边的值相换
 * 6.将C左边以及右边的数组重复1,2,3,4,5
 *
 * 时间复杂度：平均O(nlog2n), 最好O(nlog2n), 最坏O(n^2)
 * 空间复杂度: O(nlog2n)
 * 不稳定
 *
 * @param arr
 * @param start
 * @param end
 */
export function quick(arr: number[], start?: number, end?: number): number[] {
  start = start === undefined ? 0 : start;
  end = end === undefined ? arr.length - 1 : end;
  if (start >= end) return arr;

  let left = start;
  let right = end;
  const aim = arr[start];

  while (left < right) {
    while (left < right && arr[right] >= aim) right--;
    while (left < right && arr[left] <= aim) left++;
    if (left < right) {
      const temp = arr[right];
      arr[right] = arr[left];
      arr[left] = temp;
    }
  }

  arr[start] = arr[left];
  arr[left] = aim;

  quick(arr, start, left - 1);
  quick(arr, left + 1, end);

  return arr;
}

/**
 * 插入排序
 *
 * 将数组中的所有元素依次跟前面排好序的元素相比较，如果选择的元素比前面的元素小，则交换再继续比较，直到比前面的元素大则进入下一轮
 *
 * 时间复杂度: 平均O(n^2)，最好O(n), 最坏O(n^2)
 * 空间复杂度: O(1)
 * 稳定
 *
 * @param arr
 */
export function insert(arr: number[]): number[] {
  const len = arr.length;
  for (let i = 0; i < len; i++) {
    for (let j = i; j > 0 && arr[j] < arr[j - 1]; j--) {
      const temp = arr[j];
      arr[j] = arr[j - 1];
      arr[j - 1] = temp;
    }
  }
  return arr;
}

/**
 * 希尔排序
 *
 * 基于插入排序, 将数组按步长分组，对每组进行插入排序, 步长除以2向下取证进入下一轮，直到步长小于1
 *
 * 时间复杂度: 平均O(nlog2n), 最好O(nlog2n), 最坏O(n^2)
 * 空间复杂度: O(1)
 * 不稳定
 *
 * @param arr
 */
export function insert_shell(arr: number[]): number[] {
  const len = arr.length;
  for (
    let step_len = Math.floor(len / 2);
    step_len >= 1;
    step_len = Math.floor(step_len / 2)
  ) {
    for (let i = step_len; i < len; i++) {
      for (
        let j = i;
        j >= step_len && arr[j] < arr[j - step_len];
        j -= step_len
      ) {
        const temp = arr[j];
        arr[j] = arr[j - step_len];
        arr[j - step_len] = temp;
      }
    }
  }
  return arr;
}

/**
 * 选择排序
 *
 * 遍历整个数组，选出最小的放到最前
 *
 * 时间复杂度: O(n^2)
 * 空间复杂度: O(1)
 * 不稳定
 *
 * @param arr
 */
export function select(arr: number[]): number[] {
  const len = arr.length;
  for (let i = 0; i < len; i++) {
    let min_index = i;
    for (let j = i + 1; j < len; j++) {
      if (arr[j] < arr[min_index]) min_index = j;
    }

    const temp = arr[i];
    arr[i] = arr[min_index];
    arr[min_index] = temp;
  }
  return arr;
}

/**
 * 冒泡
 *
 * 时间复杂度: O(n^2)
 * 空间复杂度：O(1)
 * 稳定
 *
 * @param arr
 */
export function bubble(arr: number[]): number[] {
  const len = arr.length;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - i; j++) {
      if (arr[j] > arr[j + 1]) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}

/**
 * 堆排序
 *
 * 1.从最后一个非叶子结点开始，整理成最大堆
 * 2.从堆顶拿出最大值放到数组后面形成有序数组
 *
 * 时间复杂度: O(nlog2n)
 * 空间复杂度: O(1)
 * 不稳定
 *
 * @param arr
 */
export function heap(arr: number[]): number[] {
  const len = arr.length;
  // 遍历整理非叶子结点，构建最大堆
  for (let i = Math.floor(len / 2) - 1; i >= 0; i--) heapAdjust(arr, len, i);
  // 最大值放最后，整理成有序数组
  for (let i = 1; i < len; i++) {
    const temp = arr[0];
    arr[0] = arr[len - i];
    arr[len - i] = temp;
    heapAdjust(arr, len - i, 0);
  }

  return arr;

}

/**
 * 调节最大堆
 * @param arr
 * @param len 调节的长度
 * @param i 调节的结点
 */
function heapAdjust(arr: number[], len: number, i: number) {
  for (let j = i * 2 + 1; j < len; j = j * 2 + 1) {
    if (j + 1 < len && arr[j] < arr[j + 1]) j++;
    if (arr[j] > arr[i]) {
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
      i = j;
    } else {
      break;
    }
  }
}

/**
 * 归并排序
 * 时间复杂度: O(nlog2n)
 * 空间复杂度: O(1)
 * 稳定
 *
 * @param arr
 */
export function merge(arr: number[]): number[] {
  const temp: number[] = [];
  mergeSort(arr, 0, arr.length - 1, temp);
  return arr;
}

function mergeSort(arr: number[], left: number, right: number, temp: number[]) {
  if (left >= right) return;
  const mid = Math.floor((left + right) / 2);
  mergeSort(arr, left, mid, temp);
  mergeSort(arr, mid + 1, right, temp);
  mergeHelper(arr, left, mid, right, temp);
}

function mergeHelper(
  arr: number[],
  left: number,
  mid: number,
  right: number,
  temp: number[]
) {
  let i = left; // 左序列指针
  let j = mid + 1; // 右序列指针
  let k = 0; // 临时数组指针
  // 比较两边序列，把小的放进去
  while (i <= mid && j <= right)
    temp[k++] = arr[arr[i] <= arr[j] ? i++ : j++];
  // 把没放进去的都放进去
  while (i <= mid) temp[k++] = arr[i++];
  while (j <= right) temp[k++] = arr[j++];
  // 将temp元素拷贝到数组
  k = 0;
  while (left <= right) arr[left++] = temp[k++];
}
