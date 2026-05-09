import path from 'node:path'

import type { AgentCtxPlugin, DetectionResult, Fact, ScanContext } from '@agentctx/core'

type DomainMatch = Readonly<{
  kind: 'operations' | 'data'
  name: string
  reason: string
  match: (filePath: string, base: string) => boolean
}>

const specs: readonly DomainMatch[] = [
  {
    kind: 'data',
    name: 'source',
    reason: 'Data source or schema contract',
    match: (filePath, base) =>
      filePath.includes('/sources/') ||
      filePath.includes('/source/') ||
      filePath.includes('/ingest/') ||
      base === 'sources.yml' ||
      base === 'sources.yaml' ||
      base === 'schema.yml' ||
      base === 'schema.yaml' ||
      base === 'schema.json',
  },
  {
    kind: 'data',
    name: 'job',
    reason: 'Batch job or pipeline definition',
    match: (filePath, base) =>
      filePath.includes('/jobs/') ||
      filePath.includes('/pipelines/') ||
      filePath.includes('/tasks/') ||
      filePath.includes('/workflows/') ||
      base.endsWith('.job.ts') ||
      base.endsWith('.job.js'),
  },
  {
    kind: 'data',
    name: 'quality',
    reason: 'Data quality rule or validation artifact',
    match: (filePath, base) =>
      filePath.includes('/quality/') ||
      filePath.includes('/checks/') ||
      filePath.includes('/validation/') ||
      filePath.includes('/expectations/') ||
      base.startsWith('great_expectations') ||
      base.startsWith('soda'),
  },
  {
    kind: 'operations',
    name: 'docker',
    reason: 'Container build or compose file',
    match: (filePath, base) =>
      base === 'Dockerfile' ||
      base.startsWith('Dockerfile.') ||
      base === 'docker-compose.yml' ||
      base === 'docker-compose.yaml' ||
      filePath.includes('/docker/'),
  },
  {
    kind: 'operations',
    name: 'terraform',
    reason: 'Terraform infrastructure file',
    match: (filePath, base) => base.endsWith('.tf') || base === '.terraform.lock.hcl' || filePath.includes('/terraform/'),
  },
  {
    kind: 'operations',
    name: 'kubernetes',
    reason: 'Kubernetes manifest',
    match: (filePath, base) =>
      filePath.includes('/k8s/') ||
      filePath.includes('/kubernetes/') ||
      (base.endsWith('.yaml') && filePath.includes('/manifests/')),
  },
  {
    kind: 'operations',
    name: 'helm',
    reason: 'Helm chart file',
    match: (filePath, base) =>
      base === 'Chart.yaml' ||
      base === 'values.yaml' ||
      filePath.includes('/charts/'),
  },
  {
    kind: 'operations',
    name: 'github-actions',
    reason: 'GitHub Actions workflow',
    match: (filePath) => filePath.startsWith('.github/workflows/') || filePath.includes('/.github/workflows/'),
  },
  {
    kind: 'operations',
    name: 'observability',
    reason: 'Observability configuration',
    match: (filePath, base) =>
      base === 'prometheus.yml' ||
      base === 'prometheus.yaml' ||
      base === 'grafana.ini' ||
      filePath.includes('/grafana/') ||
      filePath.includes('/prometheus/') ||
      filePath.includes('/otel/'),
  },
  {
    kind: 'operations',
    name: 'runbook',
    reason: 'Operational runbook',
    match: (filePath, base) =>
      filePath.toLowerCase().includes('/runbooks/') ||
      base.toLowerCase().startsWith('runbook'),
  },
  {
    kind: 'data',
    name: 'notebook',
    reason: 'Notebook or research artifact',
    match: (filePath, base) =>
      base.endsWith('.ipynb') ||
      filePath.includes('/notebooks/') ||
      filePath.includes('/research/') ||
      filePath.includes('/analysis/'),
  },
  {
    kind: 'data',
    name: 'dbt',
    reason: 'dbt project file',
    match: (filePath, base) =>
      base === 'dbt_project.yml' ||
      base === 'profiles.yml' ||
      filePath.includes('/models/'),
  },
  {
    kind: 'data',
    name: 'airflow',
    reason: 'Airflow or orchestration file',
    match: (filePath, base) =>
      base === 'airflow.cfg' ||
      filePath.includes('/dags/'),
  },
]

const toFacts = (paths: readonly string[]): readonly Fact[] => {
  const out: Fact[] = []

  for (const filePath of paths) {
    const base = path.posix.basename(filePath)
    for (const spec of specs) {
      if (!spec.match(filePath, base)) continue

      out.push({
        kind: spec.kind,
        source: filePath,
        confidence: 0.8,
        data: {
          name: spec.name,
          path: filePath,
          reason: spec.reason,
        },
      })
    }
  }

  return out
}

export const domainFilesPlugin: AgentCtxPlugin = {
  name: 'domain-files',

  async detect(ctx): Promise<DetectionResult> {
    const facts = toFacts(ctx.files.files.map((file) => file.path))
    const detected = facts.length > 0

    return {
      detected,
      confidence: detected ? 0.6 : 0,
      reason: detected ? 'Found operations or data domain files' : 'No operations or data domain files found',
    }
  },

  async extract(ctx: ScanContext): Promise<readonly Fact[]> {
    return toFacts(ctx.files.files.map((file) => file.path))
  },
}
