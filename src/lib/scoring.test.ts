import { describe, expect, it } from 'vitest'
import { RUBRIC_KEYS } from './rubric'
import { toJson, toMarkdown } from './report'
import { SAMPLE_EVALUATION } from './sample'
import { scoreEvaluation, weightedOverall } from './scoring'
import type { Evaluation } from './types'

const all = (v: number) => Object.fromEntries(RUBRIC_KEYS.map((k) => [k, v]))

function evalOf(...overalls: Array<[string, number]>): Evaluation {
  return {
    task: 't',
    runs: overalls.map(([agent, v]) => ({
      agent,
      trace: { commands: 0, filesEdited: 0, linesAdded: 0, linesRemoved: 0, ranTests: false, testsPassed: null },
      scores: all(v),
      rationale: '',
    })),
  }
}

describe('weightedOverall', () => {
  it('uniform scores collapse to that score', () => {
    expect(weightedOverall(all(5))).toBe(5)
    expect(weightedOverall(all(3))).toBe(3)
  })
})

describe('scoreEvaluation', () => {
  it('ranks best-first', () => {
    const scored = scoreEvaluation(evalOf(['low', 2], ['high', 5], ['mid', 3]))
    expect(scored.runs.map((r) => r.agent)).toEqual(['high', 'mid', 'low'])
    expect(scored.runs.map((r) => r.rank)).toEqual([1, 2, 3])
    expect(scored.winner.agent).toBe('high')
  })

  it('shares a rank for ties and flags them', () => {
    const scored = scoreEvaluation(evalOf(['a', 4], ['b', 4], ['c', 2]))
    expect(scored.runs[0].rank).toBe(1)
    expect(scored.runs[1].rank).toBe(1)
    expect(scored.runs[0].tied && scored.runs[1].tied).toBe(true)
    expect(scored.runs[2].rank).toBe(3)
  })

  it('scores the sample so alpha wins', () => {
    const scored = scoreEvaluation(SAMPLE_EVALUATION)
    expect(scored.winner.agent).toBe('agent-alpha')
    expect(scored.winner.overall).toBeGreaterThan(scored.runs[1].overall)
  })
})

describe('reports', () => {
  it('markdown has the matrix, ranking and rationale', () => {
    const md = toMarkdown(scoreEvaluation(SAMPLE_EVALUATION))
    expect(md).toContain('# Evaluation: Fix the failing login test')
    expect(md).toContain('**Winner:** `agent-alpha`')
    expect(md).toContain('| Correctness |')
    expect(md).toContain('**Overall (1-5)**')
    expect(md).toContain('## Rationale')
  })

  it('json round-trips', () => {
    const data = JSON.parse(toJson(scoreEvaluation(SAMPLE_EVALUATION)))
    expect(data.winner).toBe('agent-alpha')
    expect(data.runs).toHaveLength(3)
    expect(data.runs[0].rank).toBe(1)
  })
})
