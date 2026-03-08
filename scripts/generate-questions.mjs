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

const EMPTY_QUESTION_BANK = {
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

async function readExistingQuestionBank() {
  try {
    const raw = await fs.readFile(OUTPUT_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return EMPTY_QUESTION_BANK;
  }
}

function dedupeQuestions(questions) {
  const seen = new Set();
  return questions.filter((question) => {
    const key = `${question.question}::${question.options.join("|")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function generateFromSourceText({ text, topicId, topicName, sourceUrl, maxQuestions }) {
  const facts = toCandidateFacts(text);
  return buildMcqsFromFacts(facts, {
    topicId,
    topicName,
    sourceUrl,
    maxQuestions
  });
}

async function run() {
  const sourcesRaw = await fs.readFile(SOURCES_PATH, "utf-8");
  const sources = JSON.parse(sourcesRaw);

  const existingBank = await readExistingQuestionBank();
  const generatedByTopic = {};

  for (const [topicId, topicConfig] of Object.entries(sources)) {
    const {
      topic,
      urls,
      localFallbackTextFile,
      maxQuestions = 12
    } = topicConfig;

    const topicQuestions = [];

    for (const url of urls) {
      try {
        const html = await fetchText(url);
        const text = stripHtml(html);
        const questions = await generateFromSourceText({
          text,
          topicId,
          topicName: topic,
          sourceUrl: url,
          maxQuestions
        });

        topicQuestions.push(...questions);
        console.log(`[${topicId}] ${url} -> ${questions.length} generated questions`);
      } catch (error) {
        console.warn(`[${topicId}] ${url} skipped: ${error.message}`);
      }
    }

    if (topicQuestions.length === 0 && localFallbackTextFile) {
      const fallbackPath = path.join(ROOT, localFallbackTextFile);
      try {
        const fallbackText = await fs.readFile(fallbackPath, "utf-8");
        const questions = await generateFromSourceText({
          text: fallbackText,
          topicId,
          topicName: topic,
          sourceUrl: `local:${localFallbackTextFile}`,
          maxQuestions
        });
        topicQuestions.push(...questions);
        console.log(`[${topicId}] fallback ${localFallbackTextFile} -> ${questions.length} generated questions`);
      } catch (error) {
        console.warn(`[${topicId}] fallback failed (${localFallbackTextFile}): ${error.message}`);
      }
    }

    const uniqueQuestions = dedupeQuestions(topicQuestions).slice(0, maxQuestions);

    if (uniqueQuestions.length === 0 && Array.isArray(existingBank[topicId])) {
      generatedByTopic[topicId] = existingBank[topicId];
      console.warn(`[${topicId}] no new questions generated; preserving existing ${existingBank[topicId].length} questions`);
    } else {
      generatedByTopic[topicId] = uniqueQuestions;
    }
  }

  const merged = mergeGeneratedQuestionBank(existingBank, generatedByTopic);
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(merged, null, 2)}\n`, "utf-8");

  console.log(`Wrote ${OUTPUT_PATH}`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
