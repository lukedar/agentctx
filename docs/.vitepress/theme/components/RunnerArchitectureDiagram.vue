<script setup lang="ts">
import { computed, ref } from 'vue'

type Step = Readonly<{
  key: string
  title: string
  description: string
}>

const steps: readonly Step[] = [
  {
    key: 'input',
    title: '1) Task input + constraints',
    description:
      'You provide the task, constraints (time/security), and any repo context. The runner treats these as first-class inputs and will not invent missing requirements.',
  },
  {
    key: 'plan',
    title: '2) Plan + decomposition',
    description:
      'Builder decomposes the task into verifiable steps, identifies risks (security/perf), and sets a token budget strategy before making changes.',
  },
  {
    key: 'build',
    title: '3) Builder implementation',
    description:
      'Builder executes the work (edits, tests, builds). Output is deterministic where possible; changes are kept surgical and observable.',
  },
  {
    key: 'evaluate',
    title: '4) Evaluator audit',
    description:
      'Evaluator reviews the result against a scored rubric: correctness, security, performance, readability, usability, token usage, and distribution readiness.',
  },
  {
    key: 'gate',
    title: '5) Gate + fix loop',
    description:
      'If any score falls below threshold, the Builder must address the feedback and re-run checks. This makes quality enforcement systematic, not optional.',
  },
  {
    key: 'artifacts',
    title: '6) Artifacts + reporting',
    description:
      'The runner produces structured artifacts: decision records, evaluations, metrics (timings/token usage), and a final report suitable for CI logs or team review.',
  },
  {
    key: 'observe',
    title: '7) Observability (optional UI)',
    description:
      'An optional local-first UI can subscribe to runner events (e.g., SSE) and render the pipeline, decisions, scores, and token budget status in real time.',
  },
]

const activeIndex = ref(0)
const animKey = ref(0)

const active = computed(() => steps[activeIndex.value])

const next = () => {
  activeIndex.value = (activeIndex.value + 1) % steps.length
  animKey.value++
}

const reset = () => {
  activeIndex.value = 0
  animKey.value++
}

const isActive = (key: Step['key']): boolean => active.value.key === key

// Arrow that "leads into" the currently active box (no arrow for the first box)
const activeArrowIndex = computed(() => activeIndex.value - 1)
</script>

<template>
  <div class="dar">
    <div class="dar__controls">
      <button class="dar__button" type="button" @click="next">Next step</button>
      <button class="dar__button dar__button--secondary" type="button" @click="reset">Reset</button>
      <div class="dar__meta">
        <div class="dar__metaTitle">{{ active.title }}</div>
        <div class="dar__metaDesc">{{ active.description }}</div>
      </div>
    </div>

    <div class="dar__diagram" :key="animKey">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1040 280"
        role="img"
        aria-label="Dual-agent runner architecture pipeline"
      >
        <defs>
          <marker id="darArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>

        <!-- arrows -->
        <g class="dar__arrows">
          <path
            class="dar__arrow"
            :class="{ 'is-active': activeArrowIndex === 0 }"
            d="M 150 140 L 220 140"
            marker-end="url(#darArrow)"
          />
          <path
            class="dar__arrow"
            :class="{ 'is-active': activeArrowIndex === 1 }"
            d="M 330 140 L 400 140"
            marker-end="url(#darArrow)"
          />
          <path
            class="dar__arrow"
            :class="{ 'is-active': activeArrowIndex === 2 }"
            d="M 510 140 L 580 140"
            marker-end="url(#darArrow)"
          />
          <path
            class="dar__arrow"
            :class="{ 'is-active': activeArrowIndex === 3 }"
            d="M 690 140 L 760 140"
            marker-end="url(#darArrow)"
          />
          <path
            class="dar__arrow"
            :class="{ 'is-active': activeArrowIndex === 4 }"
            d="M 870 140 L 940 140"
            marker-end="url(#darArrow)"
          />
        </g>

        <!-- nodes -->
        <g class="dar__node" :class="{ 'is-active': isActive('input') }">
          <rect x="30" y="95" width="120" height="90" rx="14" />
          <text x="50" y="132">Input</text>
          <text x="50" y="154" class="dar__muted">task + constraints</text>
        </g>

        <g class="dar__node" :class="{ 'is-active': isActive('plan') }">
          <rect x="220" y="95" width="110" height="90" rx="14" />
          <text x="245" y="132">Plan</text>
          <text x="238" y="154" class="dar__muted">decompose</text>
        </g>

        <g class="dar__node" :class="{ 'is-active': isActive('build') }">
          <rect x="400" y="95" width="110" height="90" rx="14" />
          <text x="420" y="132">Builder</text>
          <text x="420" y="154" class="dar__muted">implements</text>
        </g>

        <g class="dar__node" :class="{ 'is-active': isActive('evaluate') }">
          <rect x="580" y="95" width="110" height="90" rx="14" />
          <text x="595" y="132">Evaluator</text>
          <text x="605" y="154" class="dar__muted">audits</text>
        </g>

        <g class="dar__node" :class="{ 'is-active': isActive('gate') }">
          <rect x="760" y="95" width="110" height="90" rx="14" />
          <text x="790" y="132">Gate</text>
          <text x="775" y="154" class="dar__muted">fix loop</text>
        </g>

        <g class="dar__node" :class="{ 'is-active': isActive('artifacts') }">
          <rect x="940" y="95" width="70" height="90" rx="14" />
          <text x="948" y="132">Out</text>
          <text x="948" y="154" class="dar__muted">artifacts</text>
        </g>

        <!-- optional observability lane -->
        <g class="dar__lane">
          <path d="M 60 220 L 980 220" />
          <text x="60" y="248" class="dar__muted">Event stream → UI / metrics (optional)</text>

          <circle cx="420" cy="220" r="6" :class="{ 'is-on': isActive('observe') }" />
          <circle cx="600" cy="220" r="6" :class="{ 'is-on': isActive('observe') }" />
          <circle cx="800" cy="220" r="6" :class="{ 'is-on': isActive('observe') }" />
        </g>
      </svg>

      <div class="dar__hint">Tip: click “Next step” to walk the internal pipeline.</div>
    </div>
  </div>
</template>

<style scoped>
.dar {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 14px;
  background: color-mix(in srgb, var(--vp-c-bg) 92%, transparent);
}

.dar__controls {
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 10px 12px;
  align-items: start;
}

.dar__button {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  padding: 8px 12px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.dar__button:hover {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 60%, var(--vp-c-divider));
}

.dar__button--secondary {
  font-weight: 600;
  opacity: 0.9;
}

.dar__meta {
  padding: 6px 10px;
  border-left: 1px solid var(--vp-c-divider);
}

.dar__metaTitle {
  font-weight: 700;
  margin-bottom: 4px;
}

.dar__metaDesc {
  color: var(--vp-c-text-2);
  line-height: 1.4;
}

.dar__diagram {
  margin-top: 10px;
}

.dar__hint {
  margin-top: 8px;
  color: var(--vp-c-text-3);
  font-size: 12px;
}

svg {
  width: 100%;
  height: auto;
  color: color-mix(in srgb, var(--vp-c-text-2) 80%, transparent);
}

.dar__node rect {
  fill: color-mix(in srgb, var(--vp-c-bg) 80%, var(--vp-c-bg-soft));
  stroke: color-mix(in srgb, var(--vp-c-divider) 80%, transparent);
  stroke-width: 2;
  transition: stroke 200ms ease, filter 200ms ease;
}

.dar__node text {
  fill: var(--vp-c-text-1);
  font: 600 14px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

.dar__muted {
  fill: var(--vp-c-text-3);
  font: 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

.dar__node.is-active rect {
  stroke: var(--vp-c-brand-1);
  filter: drop-shadow(0 0 10px color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent));
  animation: darPulse 900ms ease-in-out 1;
}

@keyframes darPulse {
  0% {
    filter: drop-shadow(0 0 0px color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent));
  }
  60% {
    filter: drop-shadow(0 0 14px color-mix(in srgb, var(--vp-c-brand-1) 45%, transparent));
  }
  100% {
    filter: drop-shadow(0 0 8px color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent));
  }
}

.dar__arrows .dar__arrow {
  stroke: color-mix(in srgb, var(--vp-c-text-3) 70%, transparent);
  stroke-width: 2;
  fill: none;
}

.dar__arrows .dar__arrow.is-active {
  stroke: var(--vp-c-brand-1);
  stroke-dasharray: 80;
  stroke-dashoffset: 80;
  animation: darDash 700ms ease forwards;
}

@keyframes darDash {
  to {
    stroke-dashoffset: 0;
  }
}

.dar__lane path {
  stroke: color-mix(in srgb, var(--vp-c-divider) 80%, transparent);
  stroke-width: 2;
  fill: none;
}

.dar__lane circle {
  fill: color-mix(in srgb, var(--vp-c-divider) 60%, transparent);
}

.dar__lane circle.is-on {
  fill: var(--vp-c-brand-1);
  animation: darBlink 650ms ease-in-out 1;
}

@keyframes darBlink {
  0% {
    opacity: 0.4;
  }
  60% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}
</style>
