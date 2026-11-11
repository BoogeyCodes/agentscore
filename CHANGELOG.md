# Changelog

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- `report.toCsv` and a **Download .csv** button — export the score matrix as CSV for
  spreadsheet analysis.
- `ScoredEvaluation.margin` and `isClose` — the gap to the runner-up and a flag
  for close calls.
- A "close call" banner under the ratings matrix that appears when the top two
  runs are within 0.3, prompting the reviewer to justify the ranking.

## [0.1.0]

### Added
- Single-screen evaluation workflow: run cards, a ten-dimension ratings matrix,
  live weighted overall and ranking, editable rationales.
- Markdown and JSON export.
- Opens on a realistic three-agent sample.
