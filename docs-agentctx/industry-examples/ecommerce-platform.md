# Ecommerce Platform

<div class="docs-hero">
  <span class="docs-kicker">High priority</span>
  <h1>Payments, auth, checkout, inventory, orders, and workers.</h1>
  <p class="docs-lead">Ecommerce systems make context mistakes expensive because small changes can cross money movement, security, stock, and async workflow boundaries.</p>
</div>

## System Overview

An ecommerce repo typically contains storefront UI, checkout flows, payment integration, inventory systems, auth, order processing, and background jobs. Agents need strong boundaries because not every task should load or edit payment-sensitive code.

## Typical Repository Structure

```text
apps/storefront
services/checkout
services/payments
services/inventory
workers/orders
packages/auth
```

## Common AI Context Problems

- checkout UI tasks drift into payment implementation
- inventory changes miss order worker behavior
- auth and payment validation rules are under-loaded
- public docs expose internal operational detail
- agents make broad edits across high-risk domains

## Recommended Context Points

- `frontend`
- `checkout`
- `payments`
- `inventory`
- `orders`
- `auth`

## Example Context Mesh

```text
frontend -> checkout -> payments
checkout -> inventory
orders -> inventory
auth -> frontend, checkout, payments
```

## Recommended Context Surfaces

- internal `AGENTS.md` for payment and auth operating rules
- CtxPoint outputs for checkout, payments, inventory, and orders
- public-safe `llms.txt` for public API and integration orientation

## Example Task-aware Context Planning

Task: adjust stock reservation behavior during checkout.

Loaded:

- `api.md`
- `database.md`
- `queues.md`
- `security.md`
- `testing.md`

Excluded:

- storefront styling context
- public docs context
- unrelated auth provider setup

## Benchmark Example

| Metric | No Context | AgentCtx |
|---|---:|---:|
| Tokens | 104k | 36k |
| Runtime | 15m | 9m |
| Success | 48% | 79% |
| High-risk irrelevant edits | 6 | 1 |

## Where AgentCtx Adds Value

AgentCtx helps teams narrow agent context around payment and inventory boundaries while keeping security-sensitive operational detail out of public surfaces.
