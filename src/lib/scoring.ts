import { RUBRIC, TOTAL_WEIGHT } from './rubric'
import type { Evaluation, RankedRun, RunInput, ScoredEvaluation } from './types'

/** Weighted average of a run's dimension scores on the 1-5 scale, rounded to one decimal. */
export function weightedOverall(scores: Record<string, number>): number {
  const total = RUBRIC.reduce((sum, d) => sum + (scores[d.key] ?? 0) * d.weight, 0)
  return Math.round((total / TOTAL_WEIGHT) * 10) / 10
}

/** Score every run and rank them best-first; equal overalls share a rank and are flagged tied. */
export function scoreEvaluation(evaluation: Evaluation): ScoredEvaluation {
  const withOverall = evaluation.runs.map((run: RunInput) => ({ run, overall: weightedOverall(run.scores) }))
  withOverall.sort((a, b) => b.overall - a.overall || a.run.agent.localeCompare(b.run.agent))

  const counts = new Map<number, number>()
  for (const { overall } of withOverall) counts.set(overall, (counts.get(overall) ?? 0) + 1)

  const runs: RankedRun[] = withOverall.map(({ run, overall }) => {
    const rank = withOverall.findIndex((w) => w.overall === overall) + 1
    return { ...run, overall, rank, tied: (counts.get(overall) ?? 0) > 1 }
  })

  const margin = runs.length >= 2 ? Math.round((runs[0].overall - runs[1].overall) * 10) / 10 : 0
  const isClose = runs.length >= 2 && margin < 0.3

  return { task: evaluation.task, runs, winner: runs[0], margin, isClose }
}
