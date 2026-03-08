import React from "react";

export default function TopicTabs({ topics, activeId, onSelect }) {
  return (
    <div className="tabs" role="tablist" aria-label="Quiz Topics">
      {topics.map((topic) => {
        const isActive = topic.id === activeId;
        return (
          <button
            key={topic.id}
            role="tab"
            aria-selected={isActive}
            className={`tab ${isActive ? "tab--active" : ""}`}
            onClick={() => onSelect(topic.id)}
            type="button"
          >
            {topic.title}
          </button>
        );
      })}
    </div>
  );
}
