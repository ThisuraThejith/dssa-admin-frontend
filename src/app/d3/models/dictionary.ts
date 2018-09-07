/**
 * Created by thisura on 7/1/18.
 */

export interface Dictionary<K, V> {
  getKeys(): K[];
  getValues(): V[];
  get(key: K): V;
  put(key: K, val: V): void;
}


export class NEODictionary<K extends string, V> implements Dictionary<K, V> {

  private internalDict: Partial<Record<K, V>>;

  constructor() {
    this.internalDict = {};
  }

  public getKeys(): K[] {
    let keys: K[] = [];
    for(let key in this.internalDict) {
      keys.push(key);
    }

    return keys;
  }

  public getValues(): V[] {
    let vals: V[] = [];

    for(let key in this.internalDict) {
      vals.push(this.internalDict[key]);
    }

    return vals;
  }

  public get(key: K): V {
    return this.internalDict[key];
  }

  public put(key: K, val: V): void {
    this.internalDict[key] = val;
  }

}


