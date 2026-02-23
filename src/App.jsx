import React, { useMemo, useState } from "react";
import "./styles.css";
import { syllabusLinks } from "./data/syllabusLinks";
import { questionBank } from "./data/questionBank";
import TopicList from "./components/TopicList";
import Quiz from "./components/Quiz";

export default function App() {
  const [activeId, setActiveId] = useState(null);

  const activeTopic = useMemo(
    () => syllabusLinks.find((x) => x.id === activeId),
    [activeId]
  );

  const questions = useMemo(() => {
    if (!activeId) return [];
    return questionBank[activeId] ?? [];
  }, [activeId]);

  return (
    <div className="page">
      <header className="header">
        <h1 className="h1">Junior Geography Bee – Quiz App</h1>
        <p className="muted">
          Choose a topic and start the quiz.
        </p>
      </header>

      {!activeId ? (
        <TopicList items={syllabusLinks} onStart={(id) => setActiveId(id)} />
      ) : (
        <Quiz
          title={activeTopic?.title ?? "Quiz"}
          questions={questions}
          onBack={() => setActiveId(null)}
        />
      )}
    </div>
  );
}
