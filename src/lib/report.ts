import { RUBRIC } from './rubric'
import type { ScoredEvaluation } from './types'

const ORDINAL: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' }
const ord = (n: number) => ORDINAL[n] ?? `${n}th`

/** Render a scored evaluation as a Markdown report: the score matrix, ranking and rationales. */
export function toMarkdown(scored: ScoredEvaluation): string {
  const lines: string[] = []
  if (scored.task) lines.push(`# Evaluation: ${scored.task}`, '')

  const w = scored.winner
  lines.push(`**Winner:** \`${w.agent}\` (${w.tied ? 'tied for 1st' : 'ranked 1st'}, overall ${w.overall.toFixed(1)}/5)`, '')

  lines.push('| Dimension | Weight | ' + scored.runs.map((r) => `\`${r.agent}\``).join(' | ') + ' |')
  lines.push('| --- | ---: | ' + scored.runs.map(() => '---:').join(' | ') + ' |')
  for (const d of RUBRIC) {
    lines.push(`| ${d.name} | ${d.weight} | ` + scored.runs.map((r) => r.scores[d.key]).join(' | ') + ' |')
  }
  lines.push('| **Overall (1-5)** | | ' + scored.runs.map((r) => `**${r.overall.toFixed(1)}**`).join(' | ') + ' |')
  lines.push('| **Rank** | | ' + scored.runs.map((r) => `${ord(r.rank)}${r.tied ? '=' : ''}`).join(' | ') + ' |', '')

  lines.push('## Rationale', '')
  for (const r of scored.runs) {
    lines.push(`### ${ord(r.rank)}${r.tied ? ' (tie)' : ''} — \`${r.agent}\` (${r.overall.toFixed(1)}/5)`, '')
    lines.push(r.rationale.trim() || '_No rationale provided._', '')
  }
  return lines.join('\n').trimEnd() + '\n'
}

export function toJson(scored: ScoredEvaluation): string {
  return JSON.stringify(
    {
      task: scored.task,
      winner: scored.winner.agent,
      runs: scored.runs.map((r) => ({
        agent: r.agent,
        overall: r.overall,
        rank: r.rank,
        tied: r.tied,
        scores: r.scores,
        rationale: r.rationale,
      })),
    },
    null,
    2,
  )
}
