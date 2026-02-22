import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { questions, groupByChapter } from "./questions.ts";
import { useProfile } from "../user/useProfile";
import { useUser } from "../user/useUser";
import React from "react";
import "./lessons.css";

export default function Lessons() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { profile } = useProfile();
  const chapters = useMemo(() => groupByChapter(questions), []);
  const chapterNames = Object.keys(chapters);
  const [activeChapter, setActiveChapter] = useState(chapterNames[0]);

  const completedIds: Set<number> = useMemo(() => new Set(profile?.completed_questions ?? []), [profile]);

  const total = questions.length;
  const completed = completedIds.size;
  const pct = Math.round((completed / total) * 100);

  const chapterQuestions = chapters[activeChapter] ?? [];
  const chapterDone = chapterQuestions.filter((q) => completedIds.has(q.id)).length;
  const chapterPct = Math.round((chapterDone / chapterQuestions.length) * 100);

  const languages = ["Python", "JavaScript", "Java", "C++", "Rust", "Go", "Ruby"];
  const [fromLang, setFromLang] = useState(profile?.source_language ?? languages[0]);
  const [toLang, setToLang]     = useState(profile?.target_language ?? languages[1]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const STREAK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
  const STREAK_DONE = STREAK_DAYS.map((_, idx) => idx < (profile?.current_streak ?? 0));

  return (
    <div className="lessons-root">
      <div className="lessons-bg-grid" />

      <header className="lessons-header">
        <div className="lessons-logo">
          <span className="lessons-logo-icon">{"</>"}</span>
          <span className="lessons-logo-text">CodeQuest</span>
        </div>
        <nav className="lessons-nav">
          <a href="/" className="nav-link">Learn</a>
          <a href="/lessons" className="nav-link active">Practice</a>
          <a href="#" className="nav-link">Leaderboard</a>
        </nav>
        <div className="lessons-header-right">
          <div className="lessons-streak-pill">
            <span>🔥</span><span>{profile?.current_streak ?? 0}</span>
          </div>
          <div className="lessons-avatar" onClick={() => navigate("/settings")}>
            {(profile?.username ?? user?.email ?? "?").slice(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="lessons-body">
        <nav className="chapter-nav">
          <p className="chapter-nav-label">Chapters</p>
          {chapterNames.map((name) => {
            const qs = chapters[name];
            const done = qs.filter((q) => completedIds.has(q.id)).length;
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
                  <span className="chapter-btn-count">{done}/{qs.length}</span>
                </div>
                <div className="chapter-btn-bar">
                  <div className="chapter-btn-fill" style={{ width: `${p}%` }} />
                </div>
              </button>
            );
          })}
        </nav>

        {/* ── Right sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-card lang-card">
            <p className="sidebar-label">Current path</p>
            <div className="lang-pair">

              {/* FROM */}
              <div style={{ position: "relative" }}>
                <button
                  className="lang-chip from"
                  onClick={() => { setShowFromDropdown(!showFromDropdown); setShowToDropdown(false); }}
                >
                  <span className="lang-chip-icon">🐍</span>
                  <span>{fromLang}</span>
                </button>
                {showFromDropdown && (
                  <div className="language-dropdown">
                    {languages.map((lang) => (
                      <button key={lang} onClick={() => { setFromLang(lang); setShowFromDropdown(false); }}>
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="lang-arrow">→</span>

              {/* TO */}
              <div style={{ position: "relative" }}>
                <button
                  className="lang-chip to"
                  onClick={() => { setShowToDropdown(!showToDropdown); setShowFromDropdown(false); }}
                >
                  <span className="lang-chip-icon">⚙️</span>
                  <span>{toLang}</span>
                </button>
                {showToDropdown && (
                  <div className="language-dropdown">
                    {languages.map((lang) => (
                      <button key={lang} onClick={() => { setToLang(lang); setShowToDropdown(false); }}>
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
            <button className="lang-change-btn" onClick={() => navigate("/settings")}>
              Change language pair
            </button>
          </div>

          <div className="sidebar-card streak-card">
            <div className="streak-top">
              <span className="streak-flame">🔥</span>
              <div>
                <p className="streak-number">{profile?.current_streak ?? 0}</p>
                <p className="streak-label">day streak</p>
              </div>
            </div>
            <div className="streak-week">
              {STREAK_DAYS.map((d, i) => (
                <div key={i} className={`streak-pip ${STREAK_DONE[i] ? "done" : ""}`}>
                  <span>{STREAK_DONE[i] ? "🔥" : "·"}</span>
                  <span className="pip-day">{d}</span>
                </div>
              ))}
            </div>
            <p className="streak-sub">Complete today's lesson to keep your streak alive</p>
          </div>
        </aside>

        {/* ── Main question list ── */}
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
                  cx="24" cy="24" r="20" fill="none" stroke="var(--accent)" strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - chapterPct / 100)}`}
                  strokeLinecap="round" transform="rotate(-90 24 24)"
                  style={{ transition: "stroke-dashoffset .6s ease" }}
                />
              </svg>
              <span className="ring-pct">{chapterPct}%</span>
            </div>
          </div>

          <div className="overall-bar-row">
            <span className="overall-bar-label">Overall lesson progress</span>
            <span className="overall-bar-pct">{completed}/{total}</span>
          </div>
          <div className="overall-bar-track">
            <div className="overall-bar-fill" style={{ width: `${pct}%` }} />
          </div>

          <div className="question-list">
            {chapterQuestions.map((q, idx) => {
              const done = completedIds.has(q.id);
              const available = done || idx === 0 || completedIds.has(chapterQuestions[idx - 1]?.id);
              return (
                <button
                  key={q.id}
                  className={`question-card ${done ? "done" : ""} ${!available ? "locked" : ""}`}
                  onClick={() => available && navigate(`/question/${q.id}`)}
                  disabled={!available}
                >
                  <div className={`q-number ${done ? "done" : available ? "available" : "locked"}`}>
                    {done ? "✓" : idx + 1}
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
                        <code>{q.example_output.replace(/\n/g, " · ")}</code>
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