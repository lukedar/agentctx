import { add } from "../src/index.js";

if (add(1, 1) !== 2) {
  throw new Error("unexpected result");
}
