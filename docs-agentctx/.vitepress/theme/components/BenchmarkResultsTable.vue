<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

type ConditionResult = {
  status?: string
  elapsedMs?: number
  totalTokens?: number
  evaluatorScore?: number
  agentCompute?: {
    retries?: number
    toolCalls?: number
    providerLatencyMs?: number
    model?: string
    reasoningEffort?: string
  }
}

type BenchmarkReport = {
  benchmark: {
    repo: string
    ctxPoint?: string
    ctxBlock: string
    taskName: string
    taskId: string
  }
  noContext: ConditionResult
  agentctxContext: ConditionResult
  comparison: {
    outcome: string
    speedDeltaMs: number
    tokenDelta: number
    evaluatorScoreDelta: number
    computeDelta: {
      retries: number
      toolCalls: number
      providerLatencyMs?: number
    }
  }
}

type BenchmarkIndex = {
  version: number
  results: BenchmarkReport[]
}

const resultsUrl = '/benchmark/results.json'
const data = ref<BenchmarkIndex>({ version: 1, results: [] })
const error = ref<string | null>(null)

const formatRepo = (repo: string): string => repo.split('/').filter(Boolean).at(-1) ?? repo
const seconds = (ms?: number): string => (typeof ms === 'number' ? `${(ms / 1000).toFixed(1)}s` : '—')
const number = (value?: number): string => (typeof value === 'number' ? String(value) : '—')
const signed = (value?: number): string => {
  if (typeof value !== 'number') return '—'
  if (value > 0) return `+${value}`
  return String(value)
}

const outcomeClass = (outcome: string): string => {
  if (outcome === 'helped') return 'is-helped'
  if (outcome === 'hurt') return 'is-hurt'
  if (outcome === 'neutral') return 'is-neutral'
  return 'is-inconclusive'
}

const groups = computed(() => {
  const repos = new Map<string, Map<string, BenchmarkReport[]>>()

  for (const result of data.value.results) {
    const repo = result.benchmark.repo
    const point = result.benchmark.ctxPoint || 'workspace'
    if (!repos.has(repo)) repos.set(repo, new Map())
    const points = repos.get(repo)!
    if (!points.has(point)) points.set(point, [])
    points.get(point)!.push(result)
  }

  return [...repos.entries()].map(([repo, points]) => ({
    repo,
    points: [...points.entries()].map(([point, results]) => ({ point, results })),
  }))
})

const summary = computed(() => {
  const results = data.value.results
  const complete = results.filter((r) => r.noContext.status === 'completed' && r.agentctxContext.status === 'completed')
  const helped = results.filter((r) => r.comparison.outcome === 'helped').length
  const tokenDelta = results.reduce((sum, r) => sum + (r.comparison.tokenDelta || 0), 0)
  const speedDelta = results.reduce((sum, r) => sum + (r.comparison.speedDeltaMs || 0), 0)

  return {
    total: results.length,
    complete: complete.length,
    helped,
    tokenDelta,
    speedDelta,
  }
})

const load = async (): Promise<void> => {
  const r = await fetch(resultsUrl, { cache: 'no-store' })
  if (!r.ok) throw new Error(`Failed to load ${resultsUrl} (${r.status})`)
  data.value = (await r.json()) as BenchmarkIndex
}

let timer: ReturnType<typeof setInterval> | undefined

onMounted(async () => {
  try {
    await load()
  } catch (e: any) {
    error.value = e?.message ?? String(e)
  }

  timer = setInterval(async () => {
    try {
      await load()
      error.value = null
    } catch {
      // Keep the last successful result visible during polling failures.
    }
  }, 3000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="bench">
    <div class="bench__summary">
      <div class="bench__metric">
        <span>Total tests</span>
        <strong>{{ summary.total }}</strong>
      </div>
      <div class="bench__metric">
        <span>Completed</span>
        <strong>{{ summary.complete }}</strong>
      </div>
      <div class="bench__metric">
        <span>Helped</span>
        <strong>{{ summary.helped }}</strong>
      </div>
      <div class="bench__metric">
        <span>Speed delta</span>
        <strong>{{ seconds(summary.speedDelta) }}</strong>
      </div>
      <div class="bench__metric">
        <span>Token delta</span>
        <strong>{{ signed(summary.tokenDelta) }}</strong>
      </div>
    </div>

    <div class="bench__source">Source: <code>{{ resultsUrl }}</code>. Polls every 3 seconds in docs dev mode.</div>
    <div v-if="error" class="bench__empty">{{ error }}</div>
    <div v-else-if="groups.length === 0" class="bench__empty">No benchmark results found yet.</div>

    <section v-for="repo in groups" :key="repo.repo" class="bench__repo">
      <div class="bench__repoHead">
        <span>Repo</span>
        <strong>{{ formatRepo(repo.repo) }}</strong>
        <code>{{ repo.repo }}</code>
      </div>

      <div v-for="point in repo.points" :key="`${repo.repo}:${point.point}`" class="bench__point">
        <h3>CtxPoint: <code>{{ point.point }}</code></h3>
        <div class="bench__tableWrap">
          <table class="bench__table">
            <thead>
              <tr>
                <th>Block</th>
                <th>Task</th>
                <th>Outcome</th>
                <th>Performance</th>
                <th>Token usage</th>
                <th>Agent compute</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="result in point.results" :key="result.benchmark.taskId">
                <td><code>{{ result.benchmark.ctxBlock }}</code></td>
                <td>{{ result.benchmark.taskName }}</td>
                <td>
                  <span class="bench__pill" :class="outcomeClass(result.comparison.outcome)">
                    {{ result.comparison.outcome }}
                  </span>
                </td>
                <td>
                  <strong>{{ seconds(result.noContext.elapsedMs) }}</strong> →
                  <strong>{{ seconds(result.agentctxContext.elapsedMs) }}</strong>
                  <span class="bench__muted">({{ seconds(result.comparison.speedDeltaMs) }})</span>
                </td>
                <td>
                  <strong>{{ number(result.noContext.totalTokens) }}</strong> →
                  <strong>{{ number(result.agentctxContext.totalTokens) }}</strong>
                  <span class="bench__muted">({{ signed(result.comparison.tokenDelta) }})</span>
                </td>
                <td>
                  <span>retries {{ number(result.noContext.agentCompute?.retries) }} → {{ number(result.agentctxContext.agentCompute?.retries) }}</span>
                  <span class="bench__muted">tools {{ number(result.noContext.agentCompute?.toolCalls) }} → {{ number(result.agentctxContext.agentCompute?.toolCalls) }}</span>
                </td>
                <td>
                  <strong>{{ number(result.noContext.evaluatorScore) }}</strong> →
                  <strong>{{ number(result.agentctxContext.evaluatorScore) }}</strong>
                  <span class="bench__muted">({{ signed(result.comparison.evaluatorScoreDelta) }})</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.bench {
  display: grid;
  gap: 1rem;
}

.bench__summary {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.75rem;
}

.bench__metric,
.bench__repo,
.bench__empty {
  border: 1px solid var(--vp-c-divider);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.72));
  box-shadow: 0 20px 44px rgba(2, 6, 23, 0.18);
}

.bench__metric {
  display: grid;
  gap: 0.25rem;
  padding: 0.9rem;
}

.bench__metric span,
.bench__source,
.bench__muted {
  color: var(--vp-c-text-3);
  font-size: 0.84rem;
}

.bench__metric strong {
  font-size: 1.4rem;
  color: var(--vp-c-text-1);
}

.bench__source {
  padding: 0 0.2rem;
}

.bench__empty {
  padding: 1rem;
  color: var(--vp-c-text-2);
}

.bench__repo {
  overflow: hidden;
}

.bench__repoHead {
  display: grid;
  gap: 0.2rem;
  padding: 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.bench__repoHead span {
  color: var(--vp-c-text-3);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.bench__repoHead strong {
  color: var(--vp-c-text-1);
  font-size: 1.2rem;
}

.bench__point {
  padding: 1rem;
}

.bench__point h3 {
  margin: 0 0 0.75rem;
}

.bench__tableWrap {
  overflow-x: auto;
}

.bench__table {
  width: 100%;
  min-width: 920px;
}

.bench__table td,
.bench__table th {
  vertical-align: top;
}

.bench__pill {
  display: inline-flex;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  font-size: 0.82rem;
  font-weight: 800;
}

.is-helped {
  color: #bbf7d0;
  background: rgba(22, 163, 74, 0.18);
  border-color: rgba(34, 197, 94, 0.38);
}

.is-hurt {
  color: #fecaca;
  background: rgba(220, 38, 38, 0.18);
  border-color: rgba(248, 113, 113, 0.38);
}

.is-neutral {
  color: #fde68a;
  background: rgba(217, 119, 6, 0.18);
  border-color: rgba(245, 158, 11, 0.38);
}

.is-inconclusive {
  color: #cbd5e1;
  background: rgba(100, 116, 139, 0.18);
  border-color: rgba(148, 163, 184, 0.32);
}

@media (max-width: 960px) {
  .bench__summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
