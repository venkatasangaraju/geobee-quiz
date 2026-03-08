const WORD_RE = /[A-Za-z][A-Za-z\-\s]{2,}/;

export function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function toCandidateFacts(text) {
  return text
    .split(/[.!?]/)
    .map((line) => line.trim())
    .filter((line) => line.length > 35 && line.length < 220)
    .filter((line) => /\bis\b/i.test(line))
    .map((line) => line.replace(/\s+/g, " "));
}

export function sentenceToFact(sentence) {
  const match = sentence.match(/^(.{3,80}?)\s+is\s+(an?\s+|the\s+)?(.{3,120})$/i);
  if (!match) return null;

  const subject = match[1]
    .replace(/^\W+|\W+$/g, "")
    .replace(/^(the|a|an)\s+/i, "")
    .trim();
  const predicate = match[3].replace(/^\W+|\W+$/g, "").trim();

  if (!WORD_RE.test(subject) || !WORD_RE.test(predicate)) return null;
  if (subject.split(" ").length > 8) return null;

  return { subject, predicate };
}

function unique(items) {
  return [...new Set(items)];
}

export function buildMcqsFromFacts(facts, { topicId, topicName, sourceUrl, maxQuestions = 12 }) {
  const usableFacts = facts.map(sentenceToFact).filter(Boolean);
  const predicates = unique(usableFacts.map((f) => f.predicate));

  const questions = [];

  for (const [idx, fact] of usableFacts.entries()) {
    const distractors = predicates
      .filter((value) => value !== fact.predicate)
      .slice(0, 3);

    if (distractors.length < 3) continue;

    const baseOptions = unique([fact.predicate, ...distractors]).slice(0, 4);
    const rotation = idx % baseOptions.length;
    const options = [...baseOptions.slice(rotation), ...baseOptions.slice(0, rotation)];
    const answerIndex = options.indexOf(fact.predicate);

    questions.push({
      id: `${topicId}-auto-${idx + 1}`,
      topic: topicName,
      question: `What is ${fact.subject}?`,
      options,
      answerIndex,
      explanation: `${fact.subject} is ${fact.predicate}.`,
      sourceUrl
    });

    if (questions.length >= maxQuestions) break;
  }

  return questions;
}

export function mergeGeneratedQuestionBank(baseQuestionBank, generatedByTopic) {
  return {
    ...baseQuestionBank,
    ...generatedByTopic
  };
}
