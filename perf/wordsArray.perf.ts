import { performance, PerformanceObserver } from "perf_hooks";
import { SuffixArray } from "../src";
import { words } from "./words";

const SEPARATOR = "\u0001";

const perfObserver = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log(entry);
  });
});

perfObserver.observe({ entryTypes: ["measure"], buffered: true });

performance.mark("Begin building suffix array");
const sa = new SuffixArray({ SEPARATOR, words });
performance.mark("Finish building suffix array");
console.log("suffix array num words", words.length);
console.log("suffix array string length", sa.string.length);
console.log("suffix array array length", sa.array.length);
performance.measure(
  "Build Suffix Array",
  "Begin building suffix array",
  "Finish building suffix array"
);
