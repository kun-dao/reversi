[![NPM Package](https://badge.fury.io/js/mixed-map.svg)](https://www.npmjs.com/package/mixed-map)

# Mixed Map

A simple map implementation that prefers `WeakMap` but uses `Map` as backup for primitive keys.

## Installation

```sh
yarn add mixed-map
# or
npm install mixed-map --save
```

## API

```ts
export declare class MixedMap<K, V> {
  has(key: K): boolean;
  get(key: K): V | undefined;
  set(key: K, value: V): this;
  delete(key: K): boolean;
}

export default MixedMap;
```

## License

MIT License.
