# GeoBee Quiz

A React + Vite geography practice app with tabbed topic navigation and an automated weekly question ingestion workflow.

## Current architecture

- `src/App.jsx`: top-level orchestration of tabs and active quiz topic.
- `src/components/TopicTabs.jsx`: tab navigation (one tab per topic).
- `src/components/Quiz.jsx`: quiz runner, answer selection, and immediate correctness feedback.
- `src/data/syllabusLinks.js`: topic metadata and display labels.
- `src/data/questions.generated.json`: locally stored question bank loaded by the app.
- `scripts/generate-questions.mjs`: local ingestion pipeline that fetches configured pages and generates MCQs.
- `scripts/questionPipeline.mjs`: reusable text extraction and MCQ transformation logic.
- `scripts/sources.config.json`: per-topic source URL configuration.
- `scripts/fallback/*.txt`: local fallback corpora used when remote fetch is blocked/unavailable.

## How questions are scraped and stored

1. `npm run generate:questions` loads source URLs from `scripts/sources.config.json`.
2. For each URL, the script fetches HTML in Node (never in browser client code).
3. HTML is stripped to text (`stripHtml`), then definition-like sentences are extracted (`toCandidateFacts`, `sentenceToFact`).
4. The pipeline converts extracted facts to MCQs (`buildMcqsFromFacts`).
5. Questions are deduplicated and written into `src/data/questions.generated.json`.

If all remote URLs fail for a topic, the script uses `localFallbackTextFile` for that topic and still generates questions. If both remote and fallback generation fail, the script preserves existing questions for that topic instead of wiping them.

## Question schema (explicit/stable)

Each question object in `src/data/questions.generated.json` follows this shape:

```json
{
  "id": "week1-auto-1",
  "topic": "Physical Geography",
  "question": "What is hydrosphere?",
  "options": ["...", "...", "...", "..."],
  "answerIndex": 0,
  "explanation": "Hydrosphere is ...",
  "sourceUrl": "http://..."
}
```

## Weekly ingestion workflow

1. Update source URLs in `scripts/sources.config.json`.
2. Optionally set/update `localFallbackTextFile` in the same config.
3. Run the ingestion pipeline:

```bash
npm run generate:questions
```

4. Confirm output in `src/data/questions.generated.json`.
5. Run validation/build checks:

```bash
npm test
npm run build
```

## Local development

```bash
npm install
npm run dev
```

## Notes

- Scraping is done in local Node scripts, never in browser client code.
- Generated question quality depends on source content structure and definition extraction heuristics.
