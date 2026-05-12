import { secretPatterns } from "./ignoreRules.js";

export function containsSecretLikeValue(content: string): boolean {
  return secretPatterns.some((pattern) => pattern.test(content));
}
