import { performance, PerformanceObserver } from "perf_hooks";
import { SimpleFastPrefixCompletions } from "../src";
import { words } from "./words";

const SEPARATOR = "\u0001";

const perfObserver = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log(entry);
  });
});

perfObserver.observe({ entryTypes: ["measure"], buffered: true });

performance.mark("begin building suffix array");
const sa = new SimpleFastPrefixCompletions({ SEPARATOR, words });
performance.mark("Finish building suffix array");
performance.measure(
  "Build Suffix Array",
  "Begin building suffix array",
  "Finish building suffix array"
);

console.log("suffix array num words", words.length);
console.log("suffix array string length", sa.string.length);
console.log("raw string length", words.join("").length);

performance.mark("begin serialize suffix array");
const serializedSA = sa.toJSON();
performance.mark("end serialize suffix array");
performance.measure(
  "serialize suffix array",
  "begin serialize suffix array",
  "end serialize suffix array"
);

performance.mark("begin deserialize suffix array");
SimpleFastPrefixCompletions.fromJSON(serializedSA);
performance.mark("end deserialize suffix array");
performance.measure(
  "deserialize suffix array",
  "begin deserialize suffix array",
  "end deserialize suffix array"
);

for (let needle of [
  "the",
  "quick",
  "brown",
  "fox",
  "jumped",
  "over",
  "the",
  "lazy",
  "dog",
  "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
  "a",
  "b",
  "c",
]) {
  performance.mark(`Begin searching for ${needle}`);
  sa.findWords(needle);
  performance.mark(`Finish searching for ${needle}`);

  performance.measure(
    `Search for ${needle}`,
    `Begin searching for ${needle}`,
    `Finish searching for ${needle}`
  );
}
