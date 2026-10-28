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
}
