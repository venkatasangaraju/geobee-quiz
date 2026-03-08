import React, { useEffect, useMemo, useState } from "react";

export default function Quiz({ title, questions }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setIndex(0);
    setSelected(null);
    setRevealed(false);
  }, [title, questions]);

  const current = questions[index];

  const isCorrect = useMemo(() => {
    if (!revealed || selected === null || !current) return false;
    return selected === current.answerIndex;
  }, [current, revealed, selected]);

  if (!current) {
    return (
      <section className="panel card">
        <h2 className="h2">{title}</h2>
        <p className="muted">No questions available for this topic yet.</p>
      </section>
    );
  }

  const choose = (i) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
  };

  const onNext = () => {
    setIndex((value) => (value < questions.length - 1 ? value + 1 : 0));
    setSelected(null);
    setRevealed(false);
  };

  return (
    <section className="panel card" role="tabpanel" aria-label={title}>
      <div className="quiz-meta">
        <h2 className="h2">{title}</h2>
        <span className="pill">Question {index + 1} / {questions.length}</span>
      </div>

      <p className="question">{current.question}</p>

      <div className="options">
        {current.options.map((opt, i) => {
          const classes = ["option"];
          if (revealed && i === current.answerIndex) classes.push("option--correct");
          if (revealed && i === selected && i !== current.answerIndex) classes.push("option--incorrect");

          return (
            <button
              key={opt}
              onClick={() => choose(i)}
              className={classes.join(" ")}
              disabled={revealed}
              type="button"
            >
              {opt}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className={`feedback ${isCorrect ? "feedback--good" : "feedback--bad"}`}>
          {isCorrect ? (
            <p><strong>Correct!</strong> {current.explanation}</p>
          ) : (
            <p>
              <strong>Not quite.</strong> Correct answer: {current.options[current.answerIndex]}. {current.explanation}
            </p>
          )}
        </div>
      )}

      <div className="actions">
        <button className="button button--secondary" type="button" onClick={onNext}>
          {index < questions.length - 1 ? "Next Question" : "Restart Topic"}
        </button>
      </div>
    </section>
  );
}
