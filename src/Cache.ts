export class Cache<KeyType, ValueType> {

  readonly maxSize: number;

  readonly memory: Map<KeyType, ValueType> = new Map();

  constructor(maxSize: number = 10000) {
    this.maxSize = maxSize;
  }

  get(key: KeyType): ValueType | undefined {
    return this.memory.get(key);
  }

  set(key: KeyType, value: ValueType) {
    this.springCleanMemory();
    this.memory.set(key, value);
  }

  keys() {
    return this.memory.keys();
  }

  values() {
    return this.memory.values();
  }

  size() {
    return this.memory.size;
  }

  springCleanMemory() {
    if (this.memory.size > this.maxSize) {
      const keys = this.memory.keys();
      const halfway = this.memory.size / 2;
      let i = 0;
      // Keys are probably returned based on order of being added, making this typically remove oldest items first
      for (const key of keys) {
        if (i >= halfway) {
          break;
        }
        this.memory.delete(key);
        i++;
      }
    }
  }
}
