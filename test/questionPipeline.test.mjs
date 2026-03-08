import test from "node:test";
import assert from "node:assert/strict";
import {
  stripHtml,
  toCandidateFacts,
  sentenceToFact,
  buildMcqsFromFacts,
  mergeGeneratedQuestionBank
} from "../scripts/questionPipeline.mjs";

test("stripHtml removes tags and script content", () => {
  const html = "<html><script>bad()</script><body><p>Earth is a planet.</p></body></html>";
  assert.equal(stripHtml(html), "Earth is a planet.");
});

test("sentenceToFact parses simple definition", () => {
  const fact = sentenceToFact("Hydrosphere is all the water on Earth");
  assert.deepEqual(fact, {
    subject: "Hydrosphere",
    predicate: "all the water on Earth"
  });
});

test("buildMcqsFromFacts converts facts to MCQs", () => {
  const facts = [
    "Hydrosphere is all the water on Earth",
    "Lithosphere is the rigid outer part of Earth",
    "Atmosphere is the layer of gases surrounding Earth",
    "Biosphere is the global sum of all ecosystems"
  ];

  const mcqs = buildMcqsFromFacts(facts, {
    topicId: "week1",
    topicName: "Physical Geography",
    sourceUrl: "http://example.com"
  });

  assert.equal(mcqs.length > 0, true);
  assert.equal(mcqs[0].options.length, 4);
  assert.equal(mcqs[0].options[mcqs[0].answerIndex].length > 0, true);
});

test("toCandidateFacts filters valid lines", () => {
  const lines = toCandidateFacts("A short. The crust is the outermost solid layer of Earth.");
  assert.equal(lines.length, 1);
});

test("mergeGeneratedQuestionBank keeps explicit shape", () => {
  const merged = mergeGeneratedQuestionBank({ week1: [], week2: [] }, { week1: [{ id: "a" }] });
  assert.deepEqual(merged, { week1: [{ id: "a" }], week2: [] });
});
