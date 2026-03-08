import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  stripHtml,
  toCandidateFacts,
  buildMcqsFromFacts,
  mergeGeneratedQuestionBank
} from "./questionPipeline.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const SOURCES_PATH = path.join(ROOT, "scripts", "sources.config.json");
const OUTPUT_PATH = path.join(ROOT, "src", "data", "questions.generated.json");

const baseQuestionBank = {
  week1: [],
  week2: [],
  week3: [],
  week4: [],
  week5: [],
  week6: [],
  week7: [],
  week8: [],
  week9: [],
  misc: []
};

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "geo-quiz-ingestion/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

async function run() {
  const sourcesRaw = await fs.readFile(SOURCES_PATH, "utf-8");
  const sources = JSON.parse(sourcesRaw);

  const generatedByTopic = {};

  for (const [topicId, topicConfig] of Object.entries(sources)) {
    const { topic, urls } = topicConfig;
    const topicQuestions = [];

    for (const url of urls) {
      try {
        const html = await fetchText(url);
        const text = stripHtml(html);
        const facts = toCandidateFacts(text);
        const questions = buildMcqsFromFacts(facts, {
          topicId,
          topicName: topic,
          sourceUrl: url
        });

        topicQuestions.push(...questions);
        console.log(`[${topicId}] ${url} -> ${questions.length} generated questions`);
      } catch (error) {
        console.warn(`[${topicId}] ${url} skipped: ${error.message}`);
      }
    }

    generatedByTopic[topicId] = topicQuestions;
  }

  const merged = mergeGeneratedQuestionBank(baseQuestionBank, generatedByTopic);
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(merged, null, 2)}\n`, "utf-8");

  console.log(`Wrote ${OUTPUT_PATH}`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
