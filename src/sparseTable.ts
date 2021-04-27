// Sparse table implementation notes

// powers of 2
// any positive integer can be represented as a sum of powers of 2
// any interval [l, r] can be broken down into smaller intervals of powers of 2

// valid functions
// must be associative f(a, f(b, c)) = f(f(a, b), c)
// if overlap friendly queries are answered in O(1) rather than O(log n)
// f(f(a, b), f(b, c)) = f(a, f(b, c))
// min and max are overlap friendly

// table construction
// pre-compute range query answers for queries of size 2^x
// you need `n log n` memory to store the intervals
//        // in our implementation we divide `n` into b blocks of size `log n`
//        // then we create the table on the `b` blocks
//        // b log b memory => log(n) * log(log(n)) space
// if N is the size of the input P is floor of the base to log of N

// range queries
// if we want to know the minimum value we can look at the first row

export class SparseTable {
  /**
   * the floor of smallest power of 2 which fits in n
   */
  private p: number;
  /**
   * the size of the input array
   */
  private n: number;

  /**
   * the number of rows in the table
   */
  private numRows: number;
  /**
   * the number of columns in the table
   */
  private numCols: number;

  /**
   * A table with p+1 rows and n columns
   *
   * each cell in the input (i, j) represents the answer for the range
   * [j, j + 2^i) in the original array
   */
  private table: number[][];

  /**
   * the function used to calculate the table
   */
  private f: (a: number, b: number) => number;

  constructor(input: number[], f: (a: number, b: number) => number) {
    this.n = input.length;
    this.p = Math.floor(Math.log2(this.n));
    this.numRows = this.p + 1;
    this.numCols = this.n;
    this.table = [];
    this.f = f;

    // initialize a table of p+1 rows and n columns
    for (let row = 0; row < this.numRows; row++) {
      this.table.push([]);
    }

    // fill the first row with the input values
    // each value represents the answer fro the range from
    // [j, j + 2^0) or [j, j + 1) or simply j
    for (let col = 0; col < this.numCols; col++) {
      this.table[0].push(input[col]);
    }

    // use dynamic programming to fill in the rest of the rows using values
    // from the previous row
    for (let row = 1; row < this.numRows; row++) {
      // TODO(lukemurray): not sure if the math on this for loop is correct
      for (let col = 0; col <= this.numCols - Math.pow(2, row); col++) {
        this.table[row].push(
          this.f(
            // previous row same col
            this.table[row - 1][col],
            // previous row col + previous power of 2
            this.table[row - 1][col + Math.pow(2, row - 1)]
          )
        );
      }
    }
  }

  /**
   * Compute the result of f for the range from left to right (exclusive)
   */
  public rangeQuery(left: number, right: number): number {
    // find the largest power of two that fits between l and r
    // do a lookup in the table to find the minimum in between the ranges
    // [l, l + k], [r-k+1, r]
    // return result of f on the passed in ranges

    // find the value p which gives the largest 2^p that fits in the range
    // len = l - r
    // p = floor(log_2(len))
    // k = 2^p

    const len = right - left;
    const p = Math.floor(Math.log2(len));
    const k = Math.pow(2, p);

    return this.f(this.table[p][left], this.table[p][right - k]);
  }
}
