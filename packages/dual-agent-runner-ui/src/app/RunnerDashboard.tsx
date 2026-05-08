import React from 'react'
import type { RunnerUiModel } from 'dual-agent-runner'

export const RunnerDashboard: React.FC<{ model: RunnerUiModel }> = ({ model }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <section>
        <h2 style={{ marginTop: 0 }}>Task</h2>
        <div><b>{model.title}</b></div>
        <div style={{ marginTop: 6 }}>Status: <code>{model.status}</code></div>
        <div style={{ marginTop: 6 }}>Active step: <code>{model.activeStepId ?? '(none)'}</code></div>

        <h3>Pipeline</h3>
        <ol>
          {model.steps.map((s) => (
            <li key={s.id}>
              <code>{s.id}</code> — {s.status} ({s.activeAgent})
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 style={{ marginTop: 0 }}>Metrics</h2>
        <ul>
          <li>Total time: {Math.round(model.metrics.durationMs)}ms</li>
          <li>Decisions reviewed: {model.metrics.decisionsReviewed}</li>
          <li>Revisions requested: {model.metrics.revisionsRequested}</li>
          <li>Avg score: {model.metrics.averageScore.toFixed(2)}</li>
          <li>
            Token budget: {model.metrics.tokenUsage.budgetName} (max {model.metrics.tokenUsage.budgetMaxEstimatedTokens})
          </li>
          <li>Within budget: {String(model.metrics.tokenUsage.isWithinBudget)}</li>
        </ul>

        <h3>Event log</h3>
        <div style={{ maxHeight: 280, overflow: 'auto', border: '1px solid #eee', padding: 8 }}>
          {model.events.slice(-50).map((e) => (
            <div key={e.id} style={{ marginBottom: 6 }}>
              <code>{e.type}</code> {e.stepId ? <code>({e.stepId})</code> : null}: {e.message}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
