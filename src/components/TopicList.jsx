import React from "react";

export default function TopicList({ items, onStart }) {
  return (
    <div>
      {items.map((t) => (
        <div key={t.id} className="card">
          <h3>{t.title}</h3>
          <button onClick={() => onStart(t.id)}>Start Quiz</button>
        </div>
      ))}
    </div>
  );
}
