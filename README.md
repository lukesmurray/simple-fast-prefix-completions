# Simple Fast Prefix Completions

[![npm](https://img.shields.io/npm/v/simple-fast-prefix-completions)](https://www.npmjs.com/package/simple-fast-prefix-completions)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/simple-fast-prefix-completions)](https://www.npmjs.com/package/simple-fast-prefix-completions)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/lukesmurray/simple-fast-prefix-completions/CI)](https://github.com/lukesmurray/simple-fast-prefix-completions)
[![Coverage Status](https://coveralls.io/repos/github/lukesmurray/simple-fast-prefix-completions/badge.svg?branch=main)](https://coveralls.io/github/lukesmurray/simple-fast-prefix-completions?branch=main)

This package implements simple and fast prefix completions in javascript.
Given a large list of words this package can rapidly perform a prefix search and return either all the words matching a given prefix in alphabetical order or the top k words matching a given prefix ordered by a numerical ranking key. The package also supports mapping words to unique ids.

## Usage

_[Observable Example for Prefix Completions](https://observablehq.com/@lukesmurray/simple-fast-prefix-completions)_

_[Observable Example for Top-K Completions](https://observablehq.com/@lukesmurray/simple-fast-top-k-completions)_

### Construction

You can create the completion datastructure by passing one of the following options to the constructor `words`, `wordsWithIds`, `rankedWords`, `rankedWordsWithIds`.
The package makes no assumptions about your ids. They can be strings, numbers, objects, basically anything you want.
If you want to be able to serialize the datastructure your ids must be serializable though.

The rankings are assumed to be ordered such that lower rankings come before higher rankings.

`words` - expects an array of strings `["sally", "sells", "seashells"]`

`wordsWithIds` - expects an array of `[string, id]` tuples. `[["sally", 50], ["sells", 30], ["seashells", 25]]`

`rankedWords` - expects an array of `[string, number]` tuples. The number is a ranking. `[["sally", 0], ["sells", 1], ["seashells", 2]]`

`rankedWordsWithIds` - expects an array of `[string, number, id]` tuples. The number is a ranking and the id is the id. `[["sally", 0, 50], ["sells", 1, 30], ["seashells", 2, 25]]`

```tsx
// example using the words option
const words = ["sally", "sells", "seashells"];
const completions = new SimpleFastPrefixCompletions({
  words,
});
```

### Querying

The datastructure exposes four methods for querying data.

`findWords(prefix): string[]` - takes a prefix and returns words which start with that prefix in alphabetical order

`findWordsWithIds(prefix): [string, id][]` - takes a prefix and returns words which start with that prefix in alphabetical order and their associated ids

`findTopKWords(prefix, k): [string][]` - takes a prefix and a number `k` and returns the top k words which start with that prefix ordered by the passed in ranking

`findTopKWordsWithIds(prefix, k): [string, id][]` - takes a prefix and a number `k` and returns the top k words which start with that prefix ordered by the passed in ranking along with the ids associated with each word

If you call a method and have not provided data the method needs then the method will error. For example if you passed `words` and query for `findWordsWithIds` you will get an error since you have not provided `ids`.

### Serializing

You can save time building the datastructure by building the datastructure once and then serializing it with `toJSON` and `fromJSON`

```tsx
const words = ["sally", "sells", "seashells"];
const completions = new SimpleFastPrefixCompletions({
  words,
});
// serialize to json string
const serialized = completions.toJSON();

// deserialize from json string
const deserialized = SimpleFastPrefixCompletions.fromJSON(serialized);
```

### End to End Example

```tsx
import { SimpleFastPrefixCompletions } from "simple-fast-prefix-completions";

const wordsWithIds = [
  ["sally", 0],
  ["sells", 1],
  ["seashells", 2],
  ["by", 3],
  ["the", 4],
  ["seashore", 5],
];
const completions = new SimpleFastPrefixCompletions({
  wordsWithIds,
});

// search by prefix returns prefixes in lexicographically sorted order
console.log(completions.findWordsWithIds("se"));
// [["seashells", 2], ["seashore", 5], ["sells", 1]]

// note you can still use other methods which do not depend on ids
console.log(completions.findWords("se"));
// ["seashells", "seashore", "sells"]

// serialize to json
const serialized = completions.toJSON();

// deserialize from json
const deserialized = SimpleFastPrefixCompletions.fromJSON(serialized);
```

### Separator

Internally the datastructure concatenates all your strings together separated by a single character sentinel `\u0001`.
If this character is in your dataset you can pass your own sentinel, just choose a single width character that is not in your dataset.

## Rough Approximation of Runtime and Space Constraints

The memory consumed should be approximately `O(5n + c)` where `n` is the number of words provided and `c` is the concatenated length of all the words. `2n` for the segment tree, `n` for word starts, `c` for words concatenated into a single string, `n` for word ids, and `n` for word rankings.

The build time is approximately `O(n log n) + O(n)`.

Query time to find `m` matches for prefix of length `p` is approximately `O(p log n) + O(m)`

Query time to find `k` top-k matches for a prefix of length `p` is approximately `O(p log n) + O(k log k)`.

## Internal Architecture

Take the input words, sort them lexicographically, and concatenate them into a single string separated by `Separator`. While concatenating the strings build an array containing the offset into the string for the start of each word. When the user searches for a prefix, we binary search the array of offsets twice, finding the indices of the leftmost and rightmost offsets which match the prefix.

The array of offsets is already sorted so if the user is simply searching for prefix matches we iterate over the array from the leftmost index to the rightmost index and return the words matching the prefix. To return a word we iterate from the start offset to the first instance of a `Separator`.

To support top-k indices we build a SegmentTree over the indices of the sorted word array which can be used to query index of the minimum value for any interval in the word array. When we find our leftmost and rightmost indices we add the interval to a priority queue. While the queue is not empty we pop the interval associated with the lowest ranked term, and then add the left and right intervals to the queue.
