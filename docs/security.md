# Security guardrails

Senior teams adopt this runner because it makes secret-safety non-negotiable.

Evaluator must block:
- any secret values in generated artifacts
- reading/printing `.env` contents
- including private keys or credentials

Library primitives:
- `DEFAULT_SECRET_PATTERNS`
- `redactSensitiveValue(value)`

Rule of thumb: allow env var **names**, never values.
