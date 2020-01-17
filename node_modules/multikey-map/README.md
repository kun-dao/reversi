[![NPM Package](https://badge.fury.io/js/multikey-map.svg)](https://www.npmjs.com/package/multikey-map)

# Multikey Map

A simple map implementation that supports multiple keys, using ES6 `Map` and `WeakMap` internally.

## Installation

```sh
yarn add multikey-map
# or
npm install multikey-map --save
```

## Usage

```ts
import MultikeyMap from 'multikey-map';

let map = new MultikeyMap<[string, number], string | undefined>();

map.set(['foo', 0], 'a');
map.set(['foo', 1], 'b');

map.get(['foo', 0]); // 'a'
map.get(['foo', 1]); // 'b'
map.get(['foo', 2]); // undefined
map.has(['foo', 2]); // false
map.hasAndGet(['foo', 2]); // [false, undefined]

map.set(['bar', 0], undefined);

map.get(['bar', 0]); // undefined
map.has(['bar', 0]); // true
map.hasAndGet(['bar', 0]); // [true, undefined]

let weakMap = new MultikeyMap<[object, object], number | undefined>(true);
```

## License

MIT License.
