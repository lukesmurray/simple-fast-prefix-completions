// based on implementation described in https://www.youtube.com/watch?v=Oq2E2yGadnU&t=827s

export class SegmentTree {
  /**
   * the length of the input
   */
  private readonly n: number;

  /**
   * function used to compute range queries
   */
  private readonly f: (a: number, b: number) => number;

  /**
   * the data backing the segment tree
   * the root is at index 1
   *
   * given an index i
   *   the parent is at Math.floor(i/2)
   *   the left is at 2i
   *   the right is at 2i + 1
   */
  private data: number[];

  constructor(values: number[], f: (a: number, b: number) => number) {
    this.n = values.length;
    this.f = f;
    this.data = Array(this.n * 2).fill(0);

    // fill the end of the array with the input values
    for (let i = 0; i < this.n; i++) {
      this.data[this.n + i] = values[i];
    }

    // fill the beginning of the the array with the range query data
    for (let i = this.n - 1; i > 0; i--) {
      this.data[i] = this.f(this.data[2 * i], this.data[2 * i + 1]);
    }
  }

  /**
   * Perform a range query
   * @param left the left boundary
   * @param right the right boundary (exclusive)
   * @returns the result of the range query for the passed in range
   */
  public rangeQuery(left: number, right: number) {
    left += this.n;
    right += this.n;
    let queryResult = Number.POSITIVE_INFINITY;

    // basic idea is odd nodes are right children and even nodes are left
    // children. we can navigate from an even node to a parent but not from
    // an odd node to a parent. so we process odd nodes and then go to the parent

    while (left < right) {
      // if left is odd
      if ((left & 1) === 1) {
        queryResult = this.f(queryResult, this.data[left]);
        left++;
      }
      // if right is odd
      if ((right & 1) === 1) {
        right--;
        queryResult = this.f(queryResult, this.data[right]);
      }
      left >>= 1;
      right >>= 1;
    }

    return queryResult;
  }

  public update(idx: number, value: number) {
    // update the element in the array
    idx += this.n;
    this.data[idx] = value;

    // while the idx is larger than 1
    while (idx > 1) {
      // go to the parent
      idx = Math.floor(idx / 2);
      // set the parent based on the parent children
      this.data[idx] = this.f(this.data[2 * idx], this.data[2 * idx + 1]);
    }
  }
}
