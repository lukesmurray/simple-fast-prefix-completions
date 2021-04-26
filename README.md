# Simple Fast Prefix Completions

![npm bundle size](https://img.shields.io/bundlephobia/minzip/simple-fast-prefix-completions)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/lukesmurray/simple-fast-prefix-completions/CI)

This package implements simple and fast prefix completions in javascript.
In the future the package will support top K completions.

## Usage

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

- create a range maximum query for the array
- once we find the maximum for any range we split
  - find largest in either two sides
- top K is then `O(k * log n)`

Avoiding large lists in top k

- could potentially split into higher and lower priority
- under the hood the data is stored as a concatenated string
- trick is to have one string for the short tail and another string for the long tail

# Range Maximum Query

Divide array into blocks of size `(log n) / 4`.
The minimum for each block can be computed in `O(n)` time and stored in a new array.
