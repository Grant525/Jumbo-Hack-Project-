import { useState } from "react";
import { useProfile } from "../user/useProfile";
import { useUser } from "../user/useUser";
import { useNavigate } from "react-router-dom";
import React from "react";
import "./home.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type LessonStatus = "locked" | "available" | "complete" | "active";

interface Lesson {
  id: number;
  title: string;
  description: string;
  icon: string;
  status: LessonStatus;
  xp: number;
}

interface Section {
  id: number;
  title: string;
  lessons: Lesson[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    id: 1,
    title: "The Basics",
    lessons: [
      { id: 1,  title: "Variables & Types",  description: "Declare and assign basic types",        icon: "📦", status: "complete",  xp: 20 },
      { id: 2,  title: "Functions",          description: "Define and call functions",              icon: "🔧", status: "complete",  xp: 20 },
      { id: 3,  title: "Control Flow",       description: "if / else / match expressions",          icon: "🔀", status: "active",    xp: 20 },
      { id: 4,  title: "Loops",              description: "for, while, and iterators",              icon: "🔁", status: "available", xp: 20 },
    ],
  },
  {
    id: 2,
    title: "Ownership & Memory",
    lessons: [
      { id: 5,  title: "Ownership Rules",    description: "Move, copy, and drop semantics",        icon: "🧠", status: "locked",    xp: 30 },
      { id: 6,  title: "Borrowing",          description: "References and the borrow checker",     icon: "🔗", status: "locked",    xp: 30 },
      { id: 7,  title: "Lifetimes",          description: "Annotating reference lifetimes",        icon: "⏳", status: "locked",    xp: 30 },
    ],
  },
  {
    id: 3,
    title: "Data Structures",
    lessons: [
      { id: 8,  title: "Structs",            description: "Custom composite data types",           icon: "🏗️", status: "locked",    xp: 25 },
      { id: 9,  title: "Enums",              description: "Algebraic types and pattern matching",  icon: "🎭", status: "locked",    xp: 25 },
      { id: 10, title: "Collections",        description: "Vec, HashMap, HashSet",                 icon: "🗂️", status: "locked",    xp: 25 },
    ],
  },
  {
    id: 4,
    title: "Error Handling",
    lessons: [
      { id: 11, title: "Option & Result",    description: "Handling absence and failure",          icon: "⚠️", status: "locked",    xp: 35 },
      { id: 12, title: "The ? Operator",     description: "Propagating errors elegantly",          icon: "❓", status: "locked",    xp: 35 },
    ],
  },
  {
    id: 5,
    title: "Traits & Generics",
    lessons: [
      { id: 13, title: "Traits",             description: "Shared behaviour across types",         icon: "🎨", status: "locked",    xp: 40 },
      { id: 14, title: "Generics",           description: "Write once, use for any type",          icon: "🔬", status: "locked",    xp: 40 },
      { id: 15, title: "Trait Objects",      description: "Dynamic dispatch with dyn",             icon: "🌀", status: "locked",    xp: 40 },
    ],
  },
];

const STREAK_DAYS = ["M","T","W","Th","F","Sa","Su"];
const STREAK_DONE = [true, true, true, false, false, false, false];
const ZIGZAG      = [2, 1, 2, 3, 2, 1, 2, 3]; // column 1–3

const ALL_LESSONS   = SECTIONS.flatMap(s => s.lessons);
const DONE_COUNT    = ALL_LESSONS.filter(l => l.status === "complete").length;
const TOTAL_COUNT   = ALL_LESSONS.length;

// ─── Sidebar ──────────────────────────────────────────────────────────────────


  function Sidebar({ profile }: { profile: any }) {
    const navigate = useNavigate();
    const pct = Math.round((DONE_COUNT / TOTAL_COUNT) * 100);
    const [showFromDropdown, setShowFromDropdown] = useState(false);
    const [showToDropdown, setShowToDropdown] = useState(false);
  
    const languages = ["Python", "JavaScript", "Java", "C++", "Rust", "Go", "Ruby"];

    
    return (
      <aside className="sidebar">
        <div className="sidebar-card lang-card">
          <p className="sidebar-label">Current path</p>
          <div className="lang-pair">
            <div style={{ position: "relative" }}>
              <button className="lang-chip from" onClick={() => setShowFromDropdown(!showFromDropdown)}>
                <span className="lang-chip-icon">🐍</span>
                <span>{profile?.source_language ?? "Python"}</span>
              </button>
              {showFromDropdown && (
                <div className="language-dropdown">
                  {languages.map((lang) => (
                    <button key={lang} onClick={() => setShowFromDropdown(false)}>
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="lang-arrow">→</span>
            <div style={{ position: "relative" }}>
              <button className="lang-chip to" onClick={() => setShowToDropdown(!showToDropdown)}>
                <span className="lang-chip-icon">⚙️</span>
                <span>{profile?.target_language ?? "Rust"}</span>
              </button>
              {showToDropdown && (
                <div className="language-dropdown">
                  {languages.map((lang) => (
                    <button key={lang} onClick={() => setShowToDropdown(false)}>
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

      {/* Streak */}
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
            <div key={i} className={`streak-pip ${STREAK_DONE[i] ? "done" : ""} ${i === 3 ? "today" : ""}`}>
              <span>{STREAK_DONE[i] ? "🔥" : "·"}</span>
              <span className="pip-day">{d}</span>
            </div>
          ))}
        </div>
        <p className="streak-sub">Complete today's lesson to keep your streak alive</p>
      </div>

      {/* Progress */}
      <div className="sidebar-card progress-card">
        <p className="sidebar-label">Overall progress</p>
        <div className="progress-nums">
          <span className="progress-done">{DONE_COUNT}</span>
          <span className="progress-total"> / {TOTAL_COUNT} lessons</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="progress-pct">{pct}% complete</p>
      </div>

      {/* Stats */}
      <div className="sidebar-card stats-card">
        <p className="sidebar-label">This week</p>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-val">140</span>
            <span className="stat-key">XP earned</span>
          </div>
          <div className="stat-item">
            <span className="stat-val">12</span>
            <span className="stat-key">Drills done</span>
          </div>
          <div className="stat-item">
            <span className="stat-val">94%</span>
            <span className="stat-key">Accuracy</span>
          </div>
          <div className="stat-item">
            <span className="stat-val">🥇</span>
            <span className="stat-key">Gold league</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Skill tree ───────────────────────────────────────────────────────────────

function LessonNode({ lesson, onClick }: { lesson: Lesson; onClick: () => void }) {
  const clickable = lesson.status !== "locked";
  return (
    <button
      className={`lesson-node status-${lesson.status}`}
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
    >
      <span className="node-icon">
        {lesson.status === "locked" ? "🔒" : lesson.icon}
      </span>
      {lesson.status === "active"   && <span className="node-pulse" />}
      {lesson.status === "complete" && <span className="node-check">✓</span>}
      <span className="node-label">{lesson.title}</span>
    </button>
  );
}

function LessonTooltip({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="tooltip-overlay" onClick={onClose}>
      <div className="lesson-tooltip" onClick={e => e.stopPropagation()}>
        <span className="tt-icon">{lesson.icon}</span>
        <div className="tt-body">
          <p className="tt-title">{lesson.title}</p>
          <p className="tt-desc">{lesson.description}</p>
          <p className="tt-xp">+{lesson.xp} XP on completion</p>
        </div>
        <button className="tt-btn" onClick={() => navigate("/lessons")}>
          {lesson.status === "complete" ? "Practice again" : "Start lesson"} →
        </button>
      </div>
    </div>
  );
}

function SectionBlock({ section, onSelect }: { section: Section; onSelect: (l: Lesson) => void }) {
  const allDone   = section.lessons.every(l => l.status === "complete");
  const anyActive = section.lessons.some(l => l.status !== "locked");

  const CIRCLE_SIZE = 108;
  const ROW_HEIGHT  = 160;
  const COL_WIDTH   = 120;
  const COLS        = 3;

  const getX = (idx: number) => {
    const col = ZIGZAG[idx % ZIGZAG.length] - 1;
    return col * COL_WIDTH + COL_WIDTH / 2;
  };
  const getY = (idx: number) => idx * ROW_HEIGHT + CIRCLE_SIZE / 2;

  const totalWidth  = COLS * COL_WIDTH;
  const totalHeight = section.lessons.length * ROW_HEIGHT;

  return (
    <div className={`section-block ${allDone ? "all-done" : ""} ${!anyActive ? "all-locked" : ""}`}>
      <div className="section-header">
        <span className="section-title">{section.title}</span>
        {allDone    && <span className="sec-badge done-badge">✓ Complete</span>}
        {!anyActive && <span className="sec-badge locked-badge">🔒 Locked</span>}
      </div>

      <div style={{ position: "relative", width: totalWidth, margin: "0 auto" }}>
        <svg
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
          width={totalWidth}
          height={totalHeight}
        >
          {section.lessons.map((lesson, idx) => {
            if (idx === 0) return null;
            const x1 = getX(idx - 1);
            const y1 = getY(idx - 1);
            const x2 = getX(idx);
            const y2 = getY(idx);
            const lit = lesson.status !== "locked";
            return (
              <line
                key={idx}
                x1={x1} y1={y1}
                x2={x2} y2={y2}
                stroke={lit ? "var(--accent)" : "var(--border)"}
                strokeWidth={2}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {section.lessons.map((lesson, idx) => {
          const x = getX(idx);
          const y = getY(idx);
          return (
            <div
              key={lesson.id}
              style={{
                position: "absolute",
                left: x - CIRCLE_SIZE / 2,
                top: y - CIRCLE_SIZE / 2,
              }}
            >
              <LessonNode lesson={lesson} onClick={() => onSelect(lesson)} />
            </div>
          );
        })}

        <div style={{ height: totalHeight }} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { profile } = useProfile();
  const [selected, setSelected] = useState<Lesson | null>(null);

  return (
    <div className="home-root">
      <div className="home-bg-grid" />

      <header className="home-header">
        <div className="home-logo">
          <span className="home-logo-icon">{"</>"}</span>
          <span className="home-logo-text">CodeQuest</span>
        </div>
        <nav className="home-nav">
          <a href="/" className="nav-link active">Learn</a>
          <a href="/lessons" className="nav-link">Practice</a>
          <a href="#" className="nav-link">Leaderboard</a>
        </nav>
        <div className="home-header-right">
          <div className="home-streak-pill"><span>🔥</span><span>{profile?.current_streak ?? 0}</span></div>
          <div className="home-avatar" style={{cursor:"pointer"}} onClick={() => navigate("/settings")}>
            {(profile?.username ?? user?.email ?? "?").slice(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="home-body">
        {/* Left: skill tree */}
        <main className="tree-main">
          <div className="tree-main-header">
            <h1 className="home-greeting">Hey {profile?.username ?? user?.email?.split("@")[0] ?? "there"} 👋</h1>
            <p className="home-greeting-sub">Keep going — you're building real muscle memory</p>
          </div>

          <div className="skill-tree">
            {SECTIONS.map(section => (
              <SectionBlock key={section.id} section={section} onSelect={setSelected} />
            ))}
          </div>
        </main>

        {/* Right: sticky sidebar */}
        <Sidebar profile={profile} />
      </div>

      <footer className="home-footer">
        <p>© 2025 CodeQuest · Built to make syntax <em>stick</em></p>
      </footer>

      {selected && (
        <LessonTooltip lesson={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
