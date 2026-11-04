/** A short, normalised summary of an agent's run, shown alongside its scores. */
export interface RunTrace {
  commands: number
  filesEdited: number
  linesAdded: number
  linesRemoved: number
  ranTests: boolean
  testsPassed: boolean | null
}

export interface RunInput {
  agent: string
  trace: RunTrace
  /** Score (1-5) per rubric dimension key. */
  scores: Record<string, number>
  rationale: string
}

export interface Evaluation {
  task: string
  runs: RunInput[]
}

export interface RankedRun extends RunInput {
  overall: number
  rank: number
  tied: boolean
}

export interface ScoredEvaluation {
  task: string
  runs: RankedRun[]
  winner: RankedRun
  /** Gap between the top run's overall and the runner-up's (0 with fewer than two runs). */
  margin: number
  /** True when the top two runs are within 0.3 of each other — a close call worth re-reading. */
  isClose: boolean
}
