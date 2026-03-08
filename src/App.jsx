import React, { useMemo, useState } from "react";
import "./styles.css";
import { syllabusLinks } from "./data/syllabusLinks";
import questionBank from "./data/questions.generated.json";
import TopicTabs from "./components/TopicTabs";
import Quiz from "./components/Quiz";

export default function App() {
  const [activeId, setActiveId] = useState(syllabusLinks[0]?.id ?? null);

  const activeTopic = useMemo(
    () => syllabusLinks.find((x) => x.id === activeId) ?? syllabusLinks[0],
    [activeId]
  );

  const questions = useMemo(() => {
    if (!activeTopic?.id) return [];
    return questionBank[activeTopic.id] ?? [];
  }, [activeTopic?.id]);

  return (
    <div className="page">
      <header className="header">
        <h1 className="h1">Junior Geography Bee Quiz</h1>
        <p className="muted">Practice by topic and get instant feedback on every answer.</p>
      </header>

      <TopicTabs
        topics={syllabusLinks}
        activeId={activeTopic?.id}
        onSelect={setActiveId}
      />

      <Quiz
        title={activeTopic?.title ?? "Quiz"}
        questions={questions}
      />
    </div>
  );
}
