import fs from 'node:fs/promises';
import path from 'node:path';
import {setTimeout} from 'node:timers/promises'
import {config} from "./config";

export interface CacheSettings {
  id: string;
  /**
   * If set to 0 then the cache will not have a size limit
   */
  maxSize?: number;
  persist?: boolean;
  saveInterval?: number;
}

export const activeCaches = new Map<string, Cache<any>>();

function getPersistPath(persistPath: string, id: string): string {
  return path.join(persistPath, `${id}.json`);
}

export class Cache<ValueType> {

  readonly id: string;

  readonly maxSize: number;

  private persist: boolean;

  readonly persistPath: string;

  readonly saveInterval: number;

  readonly memory: Record<string, ValueType>;

  isDirty: boolean;

  constructor({id, maxSize, persist, saveInterval}: CacheSettings) {
    if (activeCaches.has(id)) {
      throw new Error(`Attempted to create new Cache with already used ID: ${id}`);
    }
    activeCaches.set(id, this);
    this.id = id;
    this.maxSize = maxSize ?? 10000;
    this.persist = Boolean(persist);
    this.persistPath = getPersistPath(config.persistDataPath, id);
    this.saveInterval = saveInterval || 10000;
    this.isDirty = false;
    this.memory = {};
    this.load().catch(console.error);
  }

  private async load() {
    if (this.persist) {
      try {
        await fs.mkdir(config.persistDataPath, {recursive: true});
      } catch (err) {
        // If it already exists ignore the error
      }
      try {
        const loadedMemory = JSON.parse(await fs.readFile(this.persistPath, 'utf8')) as Record<string, ValueType>;
        for (const key of Object.keys(loadedMemory)) {
          this.memory[key] = loadedMemory[key];
        }
      } catch (err) {
        // C'est la vie
      }
      this.checkSave().catch(console.error);
    }
  }

  private async save() {
    if (this.isDirty) {
      this.isDirty = false;
      await fs.writeFile(this.persistPath, JSON.stringify(this.memory, null, 2), 'utf8');
    }
  }

  async checkSave() {
    if (this.persist) {
      await this.save();
      await setTimeout(this.saveInterval);
      this.checkSave().catch(console.error);
    }
  }

  get(key: string): ValueType | undefined {
    return this.memory[key];
  }

  set(key: string, value: ValueType) {
    this.springCleanMemory();
    this.memory[key] = value;
    this.isDirty = true;
  }

  delete(key: string) {
    delete this.memory[key];
  }

  keys() {
    return Object.keys(this.memory);
  }

  values() {
    return Object.values(this.memory);
  }

  get size() {
    return this.keys().length;
  }

  springCleanMemory() {
    if (this.maxSize > 0 && this.size > this.maxSize) {
      const keys = this.keys();
      const halfway = this.size / 2;
      let i = 0;
      // Keys are probably returned based on order of being added, making this typically remove oldest items first
      for (const key of keys) {
        if (i >= halfway) {
          break;
        }
        delete this.memory[key];
        i++;
      }
      this.isDirty = true;
    }
  }

  async finish() {
    this.save();
    this.persist = false;
  }
}
