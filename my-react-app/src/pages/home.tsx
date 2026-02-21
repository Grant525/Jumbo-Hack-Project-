import { useState } from "react";
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

// ─── Mock data ─────────────────────────────────────────────────────────────────

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
      { id: 5,  title: "Ownership Rules",    description: "Move, copy, and drop",                  icon: "🧠", status: "locked",    xp: 30 },
      { id: 6,  title: "Borrowing",          description: "References and the borrow checker",     icon: "🔗", status: "locked",    xp: 30 },
      { id: 7,  title: "Lifetimes",          description: "Annotating reference lifetimes",        icon: "⏳", status: "locked",    xp: 30 },
    ],
  },
  {
    id: 3,
    title: "Data Structures",
    lessons: [
      { id: 8,  title: "Structs",            description: "Custom data types",                     icon: "🏗️", status: "locked",    xp: 25 },
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

const STREAK_DAYS = ["M","T","W","T","F","S","S"];
const STREAK_DONE = [true, true, true, false, false, false, false];

const ALL_LESSONS   = SECTIONS.flatMap(s => s.lessons);
const DONE_LESSONS  = ALL_LESSONS.filter(l => l.status === "complete").length;
const TOTAL_LESSONS = ALL_LESSONS.length;

// Zigzag column positions (1 = left, 2 = center, 3 = right)
const ZIGZAG = [2, 1, 2, 3, 2, 1, 2, 3];

// ─── Sub-components ────────────────────────────────────────────────────────────

function StreakBar() {
  return (
    <div className="streak-bar">
      <div className="streak-bar-left">
        <span className="streak-fire">🔥</span>
        <div>
          <p className="streak-count">3-day streak</p>
          <p className="streak-sub">Keep it going — don't break the chain</p>
        </div>
      </div>
      <div className="streak-days">
        {STREAK_DAYS.map((d, i) => (
          <div key={i} className={`streak-pip ${STREAK_DONE[i] ? "done" : ""} ${i === 3 ? "today" : ""}`}>
            <span className="streak-pip-icon">{STREAK_DONE[i] ? "🔥" : "·"}</span>
            <span className="streak-pip-label">{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LangBadge() {
  return (
    <div className="lang-badge">
      <span className="lang-badge-from">Python</span>
      <span className="lang-badge-arrow">→</span>
      <span className="lang-badge-to">Rust</span>
      <button className="lang-badge-change" title="Change language">✎</button>
    </div>
  );
}

function ProgressSummary() {
  const pct = Math.round((DONE_LESSONS / TOTAL_LESSONS) * 100);
  return (
    <div className="overall-progress">
      <div className="overall-progress-labels">
        <span>{DONE_LESSONS} / {TOTAL_LESSONS} lessons</span>
        <span>{pct}% complete</span>
      </div>
      <div className="overall-progress-track">
        <div className="overall-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function LessonNode({ lesson, onClick }: { lesson: Lesson; onClick: () => void }) {
  const clickable = lesson.status !== "locked";
  return (
    <button
      className={`lesson-node status-${lesson.status}`}
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
    >
      <span className="lesson-node-icon">
        {lesson.status === "locked" ? "🔒" : lesson.icon}
      </span>
      {lesson.status === "active" && <span className="lesson-node-pulse" />}
      {lesson.status === "complete" && <span className="lesson-node-check">✓</span>}
      <span className="lesson-node-label">{lesson.title}</span>
    </button>
  );
}

function LessonTooltip({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  return (
    <div className="tooltip-overlay" onClick={onClose}>
      <div className="lesson-tooltip" onClick={e => e.stopPropagation()}>
        <span className="tooltip-icon">{lesson.icon}</span>
        <div className="tooltip-body">
          <p className="tooltip-title">{lesson.title}</p>
          <p className="tooltip-desc">{lesson.description}</p>
          <p className="tooltip-xp">+{lesson.xp} XP</p>
        </div>
        <a href="/lessons" className="tooltip-btn">
          {lesson.status === "complete" ? "Practice again" : "Start lesson"} →
        </a>
      </div>
    </div>
  );
}

function SectionBlock({ section, onSelect }: { section: Section; onSelect: (l: Lesson) => void }) {
  const allDone   = section.lessons.every(l => l.status === "complete");
  const anyActive = section.lessons.some(l => l.status !== "locked");

  return (
    <div className={`section-block ${allDone ? "all-done" : ""} ${!anyActive ? "all-locked" : ""}`}>
      <div className="section-header">
        <span className="section-title">{section.title}</span>
        {allDone  && <span className="section-badge done-badge">✓ Complete</span>}
        {!anyActive && <span className="section-badge locked-badge">🔒 Locked</span>}
      </div>

      <div className="section-tree">
        {section.lessons.map((lesson, idx) => {
          const col = ZIGZAG[idx % ZIGZAG.length];
          return (
            <div key={lesson.id} className="tree-row" style={{ "--col": col } as React.CSSProperties}>
              {idx > 0 && (
                <div className={`connector ${lesson.status !== "locked" ? "connector-lit" : ""}`} />
              )}
              <LessonNode lesson={lesson} onClick={() => onSelect(lesson)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [selected, setSelected] = useState<Lesson | null>(null);

  return (
    <div className="home-root">
      <div className="home-bg-grid" />

      <header className="home-header">
        <div className="home-logo">
          <span className="home-logo-icon">{"</>"}</span>
          <span className="home-logo-text">CodeQuest</span>
        </div>
        <div className="home-header-right">
          <div className="home-xp-pill"><span>⚡</span><span>140 XP</span></div>
          <div className="home-streak-pill"><span>🔥</span><span>3</span></div>
          <div className="home-avatar">JD</div>
        </div>
      </header>

      <main className="home-main">
        <div className="home-topbar">
          <div>
            <h1 className="home-greeting">Hey Jamie 👋</h1>
            <p className="home-greeting-sub">Pick up where you left off</p>
          </div>
          <LangBadge />
        </div>

        <StreakBar />
        <ProgressSummary />

        <div className="skill-tree">
          {SECTIONS.map(section => (
            <SectionBlock key={section.id} section={section} onSelect={setSelected} />
          ))}
        </div>
      </main>

      <footer className="home-footer">
        <p>© 2025 CodeQuest · Built to make syntax <em>stick</em></p>
      </footer>

      {selected && (
        <LessonTooltip lesson={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
