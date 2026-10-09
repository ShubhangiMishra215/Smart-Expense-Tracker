export default class MinHeap {
  constructor() {
    this.heap = [];
  }

  peek() {
    return this.heap[0];
  }

  push(expense) {
    this.heap.push(expense);
    let i = this.heap.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[i].amount >= this.heap[parent].amount) break;

      [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]]; // was parentheses, not an array swap
      i = parent;
    }
  }

  pop() {
    if (this.heap.length === 0) return undefined;

    const top = this.heap[0];
    const last = this.heap.pop();

    if (this.heap.length > 0) {
      this.heap[0] = last;
      let i = 0;
      const n = this.heap.length;

      while (true) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let smallest = i;

        if (left < n && this.heap[left].amount < this.heap[smallest].amount)
          smallest = left;
        if (right < n && this.heap[right].amount < this.heap[smallest].amount)
          smallest = right;

        if (smallest === i) break;

        [this.heap[i], this.heap[smallest]] = [
          this.heap[smallest],
          this.heap[i],
        ];
        i = smallest;
      }
    }

    return top;
  }

  toArray() {
    return [...this.heap];
  }

  size() {
    return this.heap.length;
  }
}
