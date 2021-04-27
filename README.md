# Simple Fast Prefix Completions

[![npm](https://img.shields.io/npm/v/simple-fast-prefix-completions)](https://www.npmjs.com/package/simple-fast-prefix-completions)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/simple-fast-prefix-completions)](https://www.npmjs.com/package/simple-fast-prefix-completions)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/lukesmurray/simple-fast-prefix-completions/CI)](https://github.com/lukesmurray/simple-fast-prefix-completions)
[![Coverage Status](https://coveralls.io/repos/github/lukesmurray/simple-fast-prefix-completions/badge.svg?branch=main)](https://coveralls.io/github/lukesmurray/simple-fast-prefix-completions?branch=main)

This package implements simple and fast prefix completions in javascript.
In the future the package will support top K completions.

## Usage

_[Observable Example](https://observablehq.com/@lukesmurray/simple-fast-prefix-completions)_

```tsx
import { SimpleFastPrefixCompletions } from "simple-fast-prefix-completions";

const words = ["sally", "sells", "seashells", "by", "the", "seashore"];
const completions = new SimpleFastPrefixCompletions({
  words,
});

// search by prefix returns prefixes in lexicographically sorted order
console.log(completions.findWords("se"));
// ["seashells", "seashore", "sells"]

// serialize to json
const serialized = completions.toJSON();

// deserialize from json
const deserialized = SimpleFastPrefixCompletions.fromJSON(serialized);
```

## Runtime and Space Constraints

Given a dataset of `n` words and a prefix of length `p`.

Creating a new completion object from scratch takes `O(n log n) + O(n)` time.

Finding the `m` matching completions for a prefix of length `p` takes `2 * O(p log n) + O(m)`.

The completion object takes `O(c + n)` space where `c` is the number of characters in all the words and `n` is the number of words.

## TODO

Solving Top K

- create a range maximum query for the array using a split data structure with unprocessed blocks on the bottom and a sparse table at the top
  - block size log n
  - sparse table for top level
  - no preprocessing for each block
  - query time is log n
  - top k query in k log n
  - check out these slides http://web.stanford.edu/class/archive/cs/cs166/cs166.1166/lectures/00/Small00.pdf
  - video on sparse tables https://www.youtube.com/watch?v=uUatD9AudXo
  - once we find the maximum for any range we split the range into two and store the two sub ranges in a priority Q
  - the rmq is a function rmq(a, b) which returns the index of the minimum value in the range (a, b).
- Avoiding large lists in top k
  - could potentially split into higher and lower priority
  - under the hood the data is stored as a concatenated string
  - trick is to have one string for the short tail and another string for the long tail
