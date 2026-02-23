import React, { useState } from "react";

export default function Quiz({ title, questions, onBack }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const current = questions[index];

  if (!current) {
    return (
      <div className="card">
        <h2>{title}</h2>
        <p>No questions added yet.</p>
        <button onClick={onBack}>Back</button>
      </div>
    );
  }

  const choose = (i) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
  };

  return (
    <div className="card">
      <h2>{title}</h2>
      <p><b>Question {index + 1}:</b> {current.question}</p>

      {current.options.map((opt, i) => (
        <button
          key={i}
          onClick={() => choose(i)}
          style={{
            display: "block",
            margin: "8px 0",
            background:
              revealed && i === current.answerIndex
                ? "green"
                : revealed && i === selected
                ? "red"
                : ""
          }}
        >
          {opt}
        </button>
      ))}

      {revealed && (
        <div>
          <p><b>Correct Answer:</b> {current.options[current.answerIndex]}</p>
          <p>{current.explanation}</p>
          <button onClick={() => {
            setIndex(index + 1);
            setSelected(null);
            setRevealed(false);
          }}>Next</button>
        </div>
      )}

      <br />
      <button onClick={onBack}>Back to Topics</button>
    </div>
  );
}
