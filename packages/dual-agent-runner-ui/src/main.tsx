import React from 'react'
import ReactDOM from 'react-dom/client'
import { createInitialRunnerUiModel, reduceRunnerUiModel } from 'dual-agent-runner'

import { RunnerDashboard } from './app/RunnerDashboard'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Missing #root element')

const initial = createInitialRunnerUiModel({ taskId: 'demo', title: 'Dual Agent Runner (demo)' })

const App: React.FC = () => {
  const [model, setModel] = React.useState(initial)

  React.useEffect(() => {
    const source = new EventSource('http://localhost:4318/events')

    source.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data)
        setModel((m) => reduceRunnerUiModel(m, event))
      } catch {
        // ignore malformed messages
      }
    }

    source.onerror = () => {
      // keep connection attempts; browser will retry
    }

    return () => source.close()
  }, [])

  return (
    <div style={{ fontFamily: 'ui-sans-serif, system-ui', padding: 24 }}>
      <h1 style={{ margin: 0 }}>Dual Agent Runner UI</h1>
      <p style={{ marginTop: 8, color: '#555' }}>
        Run the SSE server with <code>pnpm -C packages/dual-agent-runner-ui dev:server</code> and trigger demo events with:
        <code style={{ marginLeft: 6 }}>curl -X POST http://localhost:4318/demo</code>
      </p>
      <div style={{ marginTop: 16 }}>
        <RunnerDashboard model={model} />
      </div>
    </div>
  )
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
