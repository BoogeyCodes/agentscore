import { useMemo, useState } from 'react'
import { RUBRIC, SCALE_MAX, SCALE_MIN } from './lib/rubric'
import { toJson, toMarkdown } from './lib/report'
import { SAMPLE_EVALUATION } from './lib/sample'
import { scoreEvaluation } from './lib/scoring'
import type { Evaluation, RunInput } from './lib/types'

const MEDAL = ['🥇', '🥈', '🥉']

export default function App() {
  const [evaluation, setEvaluation] = useState<Evaluation>(() => structuredClone(SAMPLE_EVALUATION))
  const scored = useMemo(() => scoreEvaluation(evaluation), [evaluation])

  const setScore = (agent: string, key: string, value: number) =>
    setEvaluation((prev) => ({
      ...prev,
      runs: prev.runs.map((r) => (r.agent === agent ? { ...r, scores: { ...r.scores, [key]: value } } : r)),
    }))

  const setRationale = (agent: string, rationale: string) =>
    setEvaluation((prev) => ({
      ...prev,
      runs: prev.runs.map((r) => (r.agent === agent ? { ...r, rationale } : r)),
    }))

  const rankOf = (agent: string) => scored.runs.find((r) => r.agent === agent)!

  return (
    <div className="app">
      <header className="head">
        <div>
          <h1>AgentScore</h1>
          <p className="muted">
            Rate three AI coding-agent runs of the same task on ten quality areas, rank them, and export the review.
          </p>
        </div>
      </header>

      <section className="task">
        <label className="task__label">Task</label>
        <input
          className="task__input"
          value={evaluation.task}
          onChange={(e) => setEvaluation((prev) => ({ ...prev, task: e.target.value }))}
        />
      </section>

      <section className="runs">
        {evaluation.runs.map((run) => (
          <RunCard key={run.agent} run={run} ranked={rankOf(run.agent)} />
        ))}
      </section>

      <section className="matrix card">
        <h2>Ratings</h2>
        <div className="tablewrap">
          <table className="grid">
            <thead>
              <tr>
                <th className="dim">Dimension</th>
                <th className="wt">Wt</th>
                {evaluation.runs.map((r) => (
                  <th key={r.agent}>{r.agent}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RUBRIC.map((dim) => (
                <tr key={dim.key}>
                  <td className="dim" title={dim.description}>
                    {dim.name}
                  </td>
                  <td className="wt muted">{dim.weight}</td>
                  {evaluation.runs.map((run) => (
                    <td key={run.agent}>
                      <ScorePicker
                        value={run.scores[dim.key]}
                        onChange={(v) => setScore(run.agent, dim.key, v)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="overall">
                <td className="dim">Overall (1-5)</td>
                <td></td>
                {evaluation.runs.map((run) => {
                  const r = rankOf(run.agent)
                  return (
                    <td key={run.agent} className="overall__cell">
                      <strong>{r.overall.toFixed(1)}</strong>
                      <span className="rankbadge">
                        {MEDAL[r.rank - 1] ?? ''} {ordinal(r.rank)}
                        {r.tied ? '=' : ''}
                      </span>
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
        {scored.isClose && (
          <p className="closecall" role="status">
            Close call — only <strong>{scored.margin.toFixed(1)}</strong> separates the top two runs.
            Make sure the rationale explains the call.
          </p>
        )}
      </section>

      <section className="rationale card">
        <h2>Rationale</h2>
        {evaluation.runs.map((run) => (
          <label key={run.agent} className="rationale__field">
            <span>
              {run.agent} — {rankOf(run.agent).overall.toFixed(1)}/5
            </span>
            <textarea
              rows={2}
              value={run.rationale}
              onChange={(e) => setRationale(run.agent, e.target.value)}
            />
          </label>
        ))}
      </section>

      <ExportBar markdown={toMarkdown(scored)} json={toJson(scored)} winner={scored.winner.agent} />
    </div>
  )
}

function RunCard({ run, ranked }: { run: RunInput; ranked: { rank: number; overall: number; tied: boolean } }) {
  const t = run.trace
  const testLabel = !t.ranTests ? 'no tests run' : t.testsPassed === null ? 'ran tests' : t.testsPassed ? 'tests passed' : 'tests failed'
  const testClass = !t.ranTests ? 'warn' : t.testsPassed ? 'ok' : t.testsPassed === false ? 'bad' : ''
  return (
    <div className={`runcard ${ranked.rank === 1 ? 'runcard--winner' : ''}`}>
      <div className="runcard__head">
        <span className="runcard__agent">{run.agent}</span>
        <span className="runcard__rank">
          {MEDAL[ranked.rank - 1] ?? ''} {ranked.overall.toFixed(1)}
        </span>
      </div>
      <dl className="runcard__trace">
        <div><dt>Commands</dt><dd>{t.commands}</dd></div>
        <div><dt>Files</dt><dd>{t.filesEdited}</dd></div>
        <div><dt>Lines</dt><dd className="pos">+{t.linesAdded}</dd><dd className="neg">-{t.linesRemoved}</dd></div>
      </dl>
      <span className={`pill pill--${testClass}`}>{testLabel}</span>
    </div>
  )
}

function ScorePicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="picker" role="group">
      {Array.from({ length: SCALE_MAX - SCALE_MIN + 1 }, (_, i) => SCALE_MIN + i).map((n) => (
        <button
          key={n}
          type="button"
          className={`picker__btn ${n === value ? 'picker__btn--on' : ''}`}
          aria-pressed={n === value}
          aria-label={`${n}`}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

function ExportBar({ markdown, json, winner }: { markdown: string; json: string; winner: string }) {
  const [copied, setCopied] = useState(false)
  const download = (text: string, name: string, type: string) => {
    const blob = new Blob([text], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <section className="export card">
      <div>
        <h2>Export</h2>
        <p className="muted">Winner: <strong>{winner}</strong>. Download the review or copy the Markdown.</p>
      </div>
      <div className="export__actions">
        <button className="btn" onClick={copy}>{copied ? 'Copied!' : 'Copy Markdown'}</button>
        <button className="btn" onClick={() => download(markdown, 'evaluation.md', 'text/markdown')}>Download .md</button>
        <button className="btn" onClick={() => download(json, 'evaluation.json', 'application/json')}>Download .json</button>
      </div>
    </section>
  )
}

function ordinal(n: number): string {
  return ['1st', '2nd', '3rd'][n - 1] ?? `${n}th`
}
