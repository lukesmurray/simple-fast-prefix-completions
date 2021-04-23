export function binarySearchLeftmost<A, T>(
  array: A[],
  target: T,
  cmp: (a: A, b: T) => number
) {
  const n = array.length;
  let lo = 0;
  let hi = n - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const cmpResult = cmp(array[mid], target);
    if (cmpResult < 0) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  return lo;
}
export function binarySearchRightmost<A, T>(
  array: A[],
  target: T,
  cmp: (a: A, b: T) => number
) {
  const n = array.length;
  let lo = 0;
  let hi = n - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const cmpResult = cmp(array[mid], target);
    if (cmpResult > 0) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return hi - 1;
}
