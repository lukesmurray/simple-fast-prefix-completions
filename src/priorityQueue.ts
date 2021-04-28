// based on https://github.com/mourner/flatqueue

export default class PriorityQueue<I> {
  private ids: I[];
  private values: number[];
  private length: number;

  constructor() {
    this.ids = [];
    this.values = [];
    this.length = 0;
  }

  public clear(): void {
    this.length = 0;
  }

  public push(id: I, value: number): void {
    let pos = this.length++;
    this.ids[pos] = id;
    this.values[pos] = value;

    while (pos > 0) {
      const parent = (pos - 1) >> 1;
      const parentValue = this.values[parent];
      if (value >= parentValue) break;
      this.ids[pos] = this.ids[parent];
      this.values[pos] = parentValue;
      pos = parent;
    }

    this.ids[pos] = id;
    this.values[pos] = value;
  }

  public pop(): I | undefined {
    if (this.length === 0) return undefined;

    const top = this.ids[0];
    this.length--;

    if (this.length > 0) {
      const id = (this.ids[0] = this.ids[this.length]);
      const value = (this.values[0] = this.values[this.length]);
      const halfLength = this.length >> 1;
      let pos = 0;

      while (pos < halfLength) {
        let left = (pos << 1) + 1;
        const right = left + 1;
        let bestIndex = this.ids[left];
        let bestValue = this.values[left];
        const rightValue = this.values[right];

        if (right < this.length && rightValue < bestValue) {
          left = right;
          bestIndex = this.ids[right];
          bestValue = rightValue;
        }
        if (bestValue >= value) break;

        this.ids[pos] = bestIndex;
        this.values[pos] = bestValue;
        pos = left;
      }

      this.ids[pos] = id;
      this.values[pos] = value;
    }

    return top;
  }

  public peek(): I | undefined {
    if (this.length === 0) return undefined;
    return this.ids[0];
  }

  public peekValue(): number | undefined {
    if (this.length === 0) return undefined;
    return this.values[0];
  }

  public shrink() {
    this.ids.length = this.values.length = this.length;
  }
}
