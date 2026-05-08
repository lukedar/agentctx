<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

type EvalJson = {
  version: number
  task?: { id?: string; title?: string }
  evaluation?: {
    status?: string
    average?: number
    scores?: Record<string, number>
  }
  checks?: readonly { label: string; ok: boolean; code: number | null }[]
}

const reportUrl = '/dual-agent-runner/dev-eval.json'

const data = ref<EvalJson | null>(null)
const error = ref<string | null>(null)

const execAvailable = ref(false)
const execRunning = ref(false)
const execMessage = ref<string | null>(null)

const grade = (score: number): 'green' | 'yellow' | 'red' => {
  if (score >= 4) return 'green'
  if (score >= 3) return 'yellow'
  return 'red'
}

const orderedMetrics = [
  'correctness',
  'testability',
  'security',
  'performance',
  'tokenUsage',
  'usability',
  'readability',
  'simplicity',
  'maintainability',
] as const

const rows = computed(() => {
  const scores = data.value?.evaluation?.scores ?? {}
  return orderedMetrics
    .filter((k) => typeof scores[k] === 'number')
    .map((k) => ({ key: k, score: Number(scores[k]) }))
})

const statusLabel = computed(() => (data.value?.evaluation?.status ?? 'unknown').toUpperCase())
const avgLabel = computed(() =>
  typeof data.value?.evaluation?.average === 'number' ? data.value.evaluation.average.toFixed(2) : '—',
)

const load = async (): Promise<void> => {
  const r = await fetch(reportUrl, { cache: 'no-store' })
  if (!r.ok) throw new Error(`Failed to load ${reportUrl} (${r.status})`)
  data.value = (await r.json()) as EvalJson
}

const checkExecAvailability = async (): Promise<void> => {
  try {
    const r = await fetch('/__dar/status', { cache: 'no-store' })
    execAvailable.value = r.ok
  } catch {
    execAvailable.value = false
  }
}

const runEval = async (): Promise<void> => {
  execRunning.value = true
  execMessage.value = null
  try {
    const r = await fetch('/__dar/eval', { method: 'POST' })
    if (!r.ok) throw new Error(`Eval failed (${r.status})`)
    const j = await r.json()
    execMessage.value = `dar eval: ${String(j.status ?? 'unknown').toUpperCase()} (exit ${j.exitCode})`
    await load()
  } catch (e: any) {
    execMessage.value = e?.message ?? String(e)
  } finally {
    execRunning.value = false
  }
}

let timer: ReturnType<typeof setInterval> | undefined

onMounted(async () => {
  try {
    await load()
  } catch (e: any) {
    error.value = e?.message ?? String(e)
  }
  await checkExecAvailability()

  timer = setInterval(async () => {
    try {
      await load()
    } catch {
      // ignore polling errors
    }
  }, 3000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="da">
    <div class="da__header">
      <div>
        <div class="da__title">Last dual-agent evaluation</div>
        <div class="da__sub">Source: <code>{{ reportUrl }}</code></div>
      </div>

      <div class="da__actions">
        <button
          class="da__button"
          type="button"
          :disabled="!execAvailable || execRunning"
          @click="runEval"
          :title="execAvailable ? 'Run dar eval locally' : 'Enable by setting DAR_DOCS_EXEC=1 when starting docs'"
        >
          {{ execRunning ? 'Running…' : 'Run evaluation' }}
        </button>
        <div v-if="execMessage" class="da__execMsg">{{ execMessage }}</div>
      </div>

      <div class="da__summary">
        <div class="da__pill" :class="`is-${(data?.evaluation?.status ?? 'unknown').toLowerCase()}`">
          Status: {{ statusLabel }}
        </div>
        <div class="da__pill">Average: {{ avgLabel }}/5</div>
      </div>
    </div>

    <div v-if="error" class="da__error">{{ error }}</div>

    <table v-else class="da__table">
      <thead>
        <tr>
          <th>Metric</th>
          <th>Score</th>
          <th>Grade</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.key">
          <td><code>{{ r.key }}</code></td>
          <td class="da__score" :class="`g-${grade(r.score)}`">{{ r.score }}/5</td>
          <td class="da__grade" :class="`g-${grade(r.score)}`">{{ grade(r.score) }}</td>
        </tr>
        <tr v-if="rows.length === 0">
          <td colspan="3" class="da__empty">No score data found.</td>
        </tr>
      </tbody>
    </table>

    <details v-if="data?.checks?.length" class="da__checks">
      <summary>Checks</summary>
      <ul>
        <li v-for="c in data.checks" :key="c.label">
          <code>{{ c.label }}</code>:
          <span :class="c.ok ? 'da__ok' : 'da__bad'">{{ c.ok ? 'ok' : 'failed' }}</span>
          <span class="da__muted">(exit {{ c.code }})</span>
        </li>
      </ul>
    </details>

    <div class="da__note">Colors: green ≥ 4, yellow 3–3.99, red &lt; 3.</div>
    <div class="da__note" v-if="!execAvailable">
      Runner trigger is disabled by default. Start docs with <code>DAR_DOCS_EXEC=1 pnpm -C docs-agentctx dev</code>.
    </div>
  </div>
</template>

<style scoped>
.da {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 14px;
  background: var(--vp-c-bg);
}

.da__header {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'title summary'
    'actions summary';
  gap: 10px 12px;
  align-items: start;
  margin-bottom: 12px;
}

.da__title {
  font-weight: 800;
}

.da__sub {
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.da__actions {
  grid-area: actions;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.da__button {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  padding: 8px 12px;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
}

.da__button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.da__execMsg {
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 700;
}

.da__summary {
  grid-area: summary;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.da__pill {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 800;
}

.da__pill.is-pass {
  border-color: color-mix(in srgb, #22c55e 60%, var(--vp-c-divider));
}

.da__pill.is-revise {
  border-color: color-mix(in srgb, #f59e0b 60%, var(--vp-c-divider));
}

.da__pill.is-fail {
  border-color: color-mix(in srgb, #ef4444 60%, var(--vp-c-divider));
}

.da__error {
  color: #ef4444;
  font-weight: 800;
}

.da__table {
  width: 100%;
  border-collapse: collapse;
}

.da__table th,
.da__table td {
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 10px 8px;
  text-align: left;
}

.da__score,
.da__grade {
  font-weight: 900;
}

.g-green {
  color: #16a34a;
}

.g-yellow {
  color: #d97706;
}

.g-red {
  color: #dc2626;
}

.da__empty {
  color: var(--vp-c-text-2);
}

.da__checks {
  margin-top: 12px;
}

.da__ok {
  color: #16a34a;
  font-weight: 900;
}

.da__bad {
  color: #dc2626;
  font-weight: 900;
}

.da__muted {
  color: var(--vp-c-text-3);
}

.da__note {
  margin-top: 10px;
  color: var(--vp-c-text-3);
  font-size: 12px;
}
</style>
