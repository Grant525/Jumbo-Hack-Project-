import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { questions, groupByChapter, Question } from "./question"; // <-- import from questions.ts
import React from "react";
import "./lessons.css";

// Mock: which question IDs the user has completed
const COMPLETED_IDS = new Set([1, 2, 3]);

const chapters = groupByChapter(questions);
const chapterNames = Object.keys(chapters);

export default function Lessons() {
  const navigate = useNavigate();
  const [activeChapter, setActiveChapter] = useState(chapterNames[0]);

  const total = questions.length;
  const completed = COMPLETED_IDS.size;
  const pct = Math.round((completed / total) * 100);

  const chapterQuestions = chapters[activeChapter] ?? [];
  const chapterDone = chapterQuestions.filter((q) =>
    COMPLETED_IDS.has(q.id),
  ).length;
  const chapterPct = Math.round((chapterDone / chapterQuestions.length) * 100);

  return (
    <div className="lessons-root">
      <div className="lessons-bg-grid" />

      {/* ── Header ── */}
      <header className="lessons-header">
        <button className="lessons-back" onClick={() => navigate("/")}>
          ← Back
        </button>
        <div className="lessons-header-center">
          <span className="lessons-path-label">Python → Rust</span>
        </div>
        <div className="lessons-header-right">
          <div className="lessons-xp-pill">⚡ 140 XP</div>
          <div className="lessons-streak-pill">🔥 3</div>
          <div className="lessons-avatar">JD</div>
        </div>
      </header>

      <div className="lessons-body">
        {/* ── Left: chapter nav ── */}
        <nav className="chapter-nav">
          <p className="chapter-nav-label">Chapters</p>
          {chapterNames.map((name) => {
            const qs = chapters[name];
            const done = qs.filter((q) => COMPLETED_IDS.has(q.id)).length;
            const p = Math.round((done / qs.length) * 100);
            const isActive = name === activeChapter;

            return (
              <button
                key={name}
                className={`chapter-btn ${isActive ? "active" : ""}`}
                onClick={() => setActiveChapter(name)}
              >
                <div className="chapter-btn-top">
                  <span className="chapter-btn-name">{name}</span>
                  <span className="chapter-btn-count">
                    {done}/{qs.length}
                  </span>
                </div>
                <div className="chapter-btn-bar">
                  <div
                    className="chapter-btn-fill"
                    style={{ width: `${p}%` }}
                  />
                </div>
              </button>
            );
          })}
        </nav>

        {/* ── Right: question list ── */}
        <main className="question-list-col">
          {/* Chapter header */}
          <div className="chapter-heading">
            <div>
              <h1 className="chapter-title">{activeChapter}</h1>
              <p className="chapter-sub">
                {chapterDone} of {chapterQuestions.length} questions complete
              </p>
            </div>
            <div className="chapter-progress-ring">
              <svg viewBox="0 0 48 48" width="56" height="56">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="4"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - chapterPct / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 24 24)"
                  style={{ transition: "stroke-dashoffset .6s ease" }}
                />
              </svg>
              <span className="ring-pct">{chapterPct}%</span>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="overall-bar-row">
            <span className="overall-bar-label">Overall lesson progress</span>
            <span className="overall-bar-pct">
              {completed}/{total}
            </span>
          </div>
          <div className="overall-bar-track">
            <div className="overall-bar-fill" style={{ width: `${pct}%` }} />
          </div>

          {/* Question cards */}
          <div className="question-list">
            {chapterQuestions.map((q, idx) => {
              const done = COMPLETED_IDS.has(q.id);
              const available =
                done ||
                idx === 0 ||
                COMPLETED_IDS.has(chapterQuestions[idx - 1]?.id);

              return (
                <button
                  key={q.id}
                  className={`question-card ${done ? "done" : ""} ${!available ? "locked" : ""}`}
                  onClick={() => available && navigate(`/question/${q.id}`)}
                  disabled={!available}
                >
                  {/* Number */}
                  <div
                    className={`q-number ${done ? "done" : available ? "available" : "locked"}`}
                  >
                    {done ? "✓" : idx + 1}
                  </div>

                  {/* Content */}
                  <div className="q-content">
                    <div className="q-top">
                      <span className="q-title">{q.title}</span>
                      {done && <span className="q-done-badge">Complete</span>}
                      {!available && (
                        <span className="q-locked-badge">🔒 Locked</span>
                      )}
                    </div>
                    <p className="q-desc">{q.description}</p>
                    {q.example_output && (
                      <div className="q-output">
                        <span className="q-output-label">Expected output</span>
                        <code>{q.example_output.replace(/\\n/g, " · ")}</code>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  {available && (
                    <span className="q-arrow">{done ? "↺" : "→"}</span>
                  )}
                </button>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
