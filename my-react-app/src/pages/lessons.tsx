import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../user/useProfile";
import { useUser } from "../user/useUser";
import { questions, groupByChapter } from "./questions.ts";
import React from "react";
import "./lessons.css";

// Mock: which question IDs the user has completed
const COMPLETED_IDS = new Set([1, 2, 3]);

const chapters = groupByChapter(questions);
const chapterNames = Object.keys(chapters);

export default function Lessons() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { profile } = useProfile();

  const [activeChapter, setActiveChapter] = useState(chapterNames[0]);
  const chapterQuestions = chapters[activeChapter] ?? [];
  const chapterDone = chapterQuestions.filter((q) => COMPLETED_IDS.has(q.id)).length;
  const chapterPct = Math.round((chapterDone / chapterQuestions.length) * 100);
  const total = questions.length;
  const completed = COMPLETED_IDS.size;
  const overallPct = Math.round((completed / total) * 100);

  const STREAK_DAYS = ["M","T","W","T","F","S","S"];
  const STREAK_DONE = [true,true,true,false,false,false,false]; // you can make dynamic

  return (
    <div className="lessons-root">
      <div className="lessons-bg-grid" />

      {/* Header */}
      <header className="lessons-header">
        <button className="lessons-back" onClick={() => navigate("/")}>← Back</button>
        <div className="lessons-header-center">
          <span className="lessons-path-label">
            {profile?.source_language ?? "Python"} → {profile?.target_language ?? "Rust"}
          </span>
        </div>
        <div className="lessons-header-right">
          <div className="lessons-xp-pill">⚡ {profile?.xp_this_week ?? 140} XP</div>
          <div className="lessons-streak-pill">🔥 {profile?.current_streak ?? 3}</div>
          <div className="lessons-avatar" onClick={() => navigate("/settings")}>
            {(profile?.username ?? user?.email ?? "?").slice(0,2).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Top stats row */}
      <div className="lessons-stats-row">
        <div className="streak-card">
          <div className="streak-top">
            <span className="streak-flame">🔥</span>
            <div>
              <p className="streak-number">{profile?.current_streak ?? 3}</p>
              <p className="streak-label">day streak</p>
            </div>
          </div>
          <div className="streak-week">
            {STREAK_DAYS.map((d,i) => (
              <div key={i} className={`streak-pip ${STREAK_DONE[i] ? "done" : ""} ${i === 3 ? "today" : ""}`}>
                <span>{STREAK_DONE[i] ? "🔥" : "·"}</span>
                <span className="pip-day">{d}</span>
              </div>
            ))}
          </div>
          <p className="streak-sub">Complete today's lesson to keep your streak alive</p>
        </div>

        <div className="stats-card">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-val">{profile?.xp_this_week ?? 140}</span>
              <span className="stat-key">XP earned</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{profile?.drills_done ?? 12}</span>
              <span className="stat-key">Drills done</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{profile?.accuracy ?? "94%"}</span>
              <span className="stat-key">Accuracy</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{profile?.league ?? "🥇"}</span>
              <span className="stat-key">League</span>
            </div>
          </div>
        </div>

        <div className="progress-card">
          <p className="progress-label">Overall lesson progress</p>
          <div className="progress-nums">
            <span className="progress-done">{completed}</span> / {total}
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${overallPct}%` }} />
          </div>
          <p className="progress-pct">{overallPct}% complete</p>
        </div>
      </div>

      {/* Body */}
      <div className="lessons-body">
        {/* Chapter nav */}
        <nav className="chapter-nav">
          <p className="chapter-nav-label">Chapters</p>
          {chapterNames.map((name) => {
            const qs = chapters[name];
            const done = qs.filter((q) => COMPLETED_IDS.has(q.id)).length;
            const pct = Math.round((done / qs.length) * 100);
            const isActive = name === activeChapter;
            return (
              <button
                key={name}
                className={`chapter-btn ${isActive ? "active" : ""}`}
                onClick={() => setActiveChapter(name)}
              >
                <div className="chapter-btn-top">
                  <span className="chapter-btn-name">{name}</span>
                  <span className="chapter-btn-count">{done}/{qs.length}</span>
                </div>
                <div className="chapter-btn-bar">
                  <div className="chapter-btn-fill" style={{ width: `${pct}%` }} />
                </div>
              </button>
            );
          })}
        </nav>

        {/* Questions */}
        <main className="question-list-col">
          <div className="chapter-heading">
            <div>
              <h1 className="chapter-title">{activeChapter}</h1>
              <p className="chapter-sub">{chapterDone} of {chapterQuestions.length} questions complete</p>
            </div>
            <div className="chapter-progress-ring">
              <svg viewBox="0 0 48 48" width="56" height="56">
                <circle cx="24" cy="24" r="20" fill="none" stroke="var(--border)" strokeWidth="4"/>
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={2 * Math.PI * 20 * (1 - chapterPct/100)}
                  strokeLinecap="round"
                  transform="rotate(-90 24 24)"
                  style={{ transition: "stroke-dashoffset .6s ease" }}
                />
              </svg>
              <span className="ring-pct">{chapterPct}%</span>
            </div>
          </div>

          <div className="question-list">
            {chapterQuestions.map((q, idx) => {
              const done = COMPLETED_IDS.has(q.id);
              const available = done || idx === 0 || COMPLETED_IDS.has(chapterQuestions[idx-1]?.id);
              return (
                <button
                  key={q.id}
                  className={`question-card ${done ? "done" : ""} ${!available ? "locked" : ""}`}
                  disabled={!available}
                  onClick={() => available && navigate(`/question/${q.id}`)}
                >
                  <div className={`q-number ${done ? "done" : available ? "available" : "locked"}`}>
                    {done ? "✓" : idx+1}
                  </div>
                  <div className="q-content">
                    <div className="q-top">
                      <span className="q-title">{q.title}</span>
                      {done && <span className="q-done-badge">Complete</span>}
                      {!available && <span className="q-locked-badge">🔒 Locked</span>}
                    </div>
                    <p className="q-desc">{q.description}</p>
                    {q.example_output && (
                      <div className="q-output">
                        <span className="q-output-label">Expected output</span>
                        <code>{q.example_output.replace(/\n/g," · ")}</code>
                      </div>
                    )}
                  </div>
                  {available && <span className="q-arrow">{done ? "↺" : "→"}</span>}
                </button>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
