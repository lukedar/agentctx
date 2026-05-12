# Task Packet Schema

Use this shape when handing task-specific context to a coding agent.

```yaml
task:
  summary: string
  context_points:
    - id: string
      path: string
  validation:
    commands:
      - string
  risks:
    - string
```
