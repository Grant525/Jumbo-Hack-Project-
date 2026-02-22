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
      { id: 1, title: "Variables & Types", description: "Declare and assign basic types", icon: "", status: "complete", xp: 20 },
      { id: 2, title: "Functions", description: "Define and call functions", icon: "", status: "complete", xp: 20 },
      { id: 3, title: "Control Flow", description: "if / else / match expressions", icon: "", status: "active", xp: 20 },
      { id: 4, title: "Loops", description: "for, while, and iterators", icon: "", status: "available", xp: 20 },
    ],
  },
  {
    id: 2,
    title: "Ownership & Memory",
    lessons: [
      { id: 5, title: "Ownership Rules", description: "Move, copy, and drop semantics", icon: "", status: "locked", xp: 30 },
      { id: 6, title: "Borrowing", description: "References and the borrow checker", icon: "", status: "locked", xp: 30 },
      { id: 7, title: "Lifetimes", description: "Annotating reference lifetimes", icon: "", status: "locked", xp: 30 },
    ],
  },
  {
    id: 3,
    title: "Data Structures",
    lessons: [
      { id: 8, title: "Structs", description: "Custom composite data types", icon: "", status: "locked", xp: 25 },
      { id: 9, title: "Enums", description: "Algebraic types and pattern matching", icon: "", status: "locked", xp: 25 },
      { id: 10, title: "Collections", description: "Vec, HashMap, HashSet", icon: "", status: "locked", xp: 25 },
    ],
  },
  {
    id: 4,
    title: "Error Handling",
    lessons: [
      { id: 11, title: "Option & Result", description: "Handling absence and failure", icon: "", status: "locked", xp: 35 },
      { id: 12, title: "The ? Operator", description: "Propagating errors elegantly", icon: "", status: "locked", xp: 35 },
    ],
  },
  {
    id: 5,
    title: "Traits & Generics",
    lessons: [
      { id: 13, title: "Traits", description: "Shared behaviour across types", icon: "", status: "locked", xp: 40 },
      { id: 14, title: "Generics", description: "Write once, use for any type", icon: "", status: "locked", xp: 40 },
      { id: 15, title: "Trait Objects", description: "Dynamic dispatch with dyn", icon: "", status: "locked", xp: 40 },
    ],
  },
];

const STREAK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const STREAK_DONE = [true, true, true, false, false, false, false];
const ZIGZAG = [2, 1, 2, 3, 2, 1, 2, 3];

const ALL_LESSONS = SECTIONS.flatMap(s => s.lessons);
const DONE_COUNT = ALL_LESSONS.filter(l => l.status === "complete").length;
const TOTAL_COUNT = ALL_LESSONS.length;

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ profile }: { profile: any }) {
  const navigate = useNavigate();
  const pct = Math.round((DONE_COUNT / TOTAL_COUNT) * 100);

  return (
    <aside className="sidebar">
      <div className="sidebar-card lang-card">
        <p className="sidebar-label">Current path</p>
        <div className="lang-pair">
          <div className="lang-chip from">
            <span className="lang-chip-icon">Python</span>
            <span>{profile?.source_language ?? "Python"}</span>
          </div>
          <span className="lang-arrow">→</span>
          <div className="lang-chip to">
            <span className="lang-chip-icon">Rust</span>
            <span>{profile?.target_language ?? "Rust"}</span>
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
      </div>

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
            <span className="stat-val">Gold</span>
            <span className="stat-key">League</span>
          </div>
        </div>
      </div>
    </aside>
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
          <div className="home-streak-pill">
            <span>🔥</span>
            <span>{profile?.current_streak ?? 0}</span>
          </div>
          <div
            className="home-avatar"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/settings")}
          >
            {(profile?.username ?? user?.email ?? "?").slice(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="home-body">
        <main className="tree-main">
          <div className="tree-main-header">
            <h1 className="home-greeting">
              Hey {profile?.username ?? user?.email?.split("@")[0] ?? "there"}
            </h1>
            <p className="home-greeting-sub">
              Keep going — you're building real muscle memory
            </p>
          </div>
        </main>

        <Sidebar profile={profile} />
      </div>

      <footer className="home-footer">
        <p>© 2025 CodeQuest · Built to make syntax stick</p>
      </footer>
    </div>
  );
}