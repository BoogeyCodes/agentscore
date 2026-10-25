# AgentScore

[![CI](https://github.com/BoogeyCodes/agentscore/actions/workflows/ci.yml/badge.svg)](https://github.com/BoogeyCodes/agentscore/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![License: MIT](https://img.shields.io/badge/license-MIT-green)

A web app for **evaluating AI coding agents**. Three agents are given the same task; AgentScore shows
each run's summary, lets you rate it on ten quality areas, computes a weighted overall score (1–5),
ranks the runs, and exports the written review as Markdown or JSON.

![AgentScore screenshot](docs/screenshot.png)

## Why

Reviewing AI coding agents is a specific workflow: read each run, rate it on areas like
instruction-following, correctness, testing, safety and honesty, score and rank the runs, and write a
rationale. AgentScore is that workflow as a single screen — the rubric, the scoring, the ranking and
the export in one place — so every evaluation comes out consistent and the deliverable is one click
away. It runs entirely in the browser; there is no backend.

## What it does

- **Run cards** summarise each agent's run: commands run, files edited, lines changed, and whether
  tests ran and passed.
- **Ratings matrix**: the ten weighted quality dimensions down the side, an agent per column, a 1–5
  picker in every cell. Scores update live.
- **Overall & ranking**: a weighted overall (1–5) per run, computed as you rate, with the runs ranked
  and medalled; ties are flagged.
- **Rationale**: an editable note per run, carried into the report.
- **Export**: copy the Markdown review to the clipboard, or download it as `.md` or `.json`.

The app opens on a realistic sample (three agents' runs of "fix the failing login test") so the
workflow is visible immediately; edit the task, the scores and the rationales to evaluate your own.

## The rubric

Ten weighted dimensions: instruction following (1.5), correctness (2.0), testing & verification
(1.25), completeness (1.0), efficiency (0.75), code quality (1.0), safety (1.5), honesty (1.25), tool
use (0.75), communication (1.0). The overall score is their weighted average on the 1–5 scale.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static build in dist/
```

## Testing

```bash
npm test
```

Eight tests: the scoring library (weighted overall, best-first ranking, tie handling, the sample
scoring so `agent-alpha` wins) and the Markdown/JSON reports, plus component tests that render the app
and check the overall recomputes when a score changes.

## Project layout

```
src/lib
├── rubric.ts    the ten weighted dimensions
├── types.ts     Evaluation / RunInput / ScoredEvaluation
├── scoring.ts   weighted overall + ranking
├── report.ts    Markdown and JSON export
├── sample.ts    the starting evaluation
└── scoring.test.ts
src/App.tsx       the single-screen UI
```

## Where it fits

AgentScore is the front end of an agent-evaluation toolchain — it pairs with a run-trace normaliser, a
diff viewer, a patch toolkit and a sandbox test runner to go from raw agent runs to a scored,
ranked, written review.

## License

MIT
