import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../user/useProfile";
import { useUser } from "../user/useUser";
import { supabase } from "../supabase";
import "./settings.css";

const LANGUAGES = ["Python", "JavaScript", "TypeScript", "Go", "Rust", "C", "C++", "Java", "Ruby", "Swift"];

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { profile, loading, updateProfile } = useProfile();

  const [username, setUsername]               = useState("");
  const [sourceLanguage, setSourceLanguage]   = useState("Python");
  const [targetLanguage, setTargetLanguage]   = useState("Rust");
  const [saved, setSaved]                     = useState(false);
  const [saving, setSaving]                   = useState(false);

  // Populate form once profile loads
  useEffect(() => {
    if (profile) {
      setUsername(profile.username ?? "");
      setSourceLanguage(profile.source_language);
      setTargetLanguage(profile.target_language);
    }
  }, [profile]);

  async function handleSave() {
    setSaving(true);
    await updateProfile({ username, source_language: sourceLanguage, target_language: targetLanguage });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleSignOut() {
    await (supabase as any).auth.signOut();
    navigate("/sign-in");
  }

  if (loading) return (
    <div className="settings-loading">Loading...</div>
  );

  return (
    <div className="settings-root">
      <div className="settings-bg-grid" />

      <header className="settings-header">
        <button className="settings-back" onClick={() => navigate("/")}>← Back</button>
        <span className="settings-header-title">Settings</span>
        <div />
      </header>

      <main className="settings-main">

        {/* Profile */}
        <section className="settings-card">
          <h2 className="settings-card-title">Profile</h2>

          <div className="settings-field">
            <label className="settings-label">Username</label>
            <input
              className="settings-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. jamie123"
            />
          </div>

          <div className="settings-field">
            <label className="settings-label">Email</label>
            <input
              className="settings-input disabled"
              value={user?.email ?? ""}
              disabled
            />
            <p className="settings-hint">Email cannot be changed here</p>
          </div>
        </section>

        {/* Language pair */}
        <section className="settings-card">
          <h2 className="settings-card-title">Language Path</h2>
          <p className="settings-card-sub">The language you know, and the one you're learning</p>

          <div className="settings-lang-row">
            <div className="settings-field">
              <label className="settings-label">I know</label>
              <select
                className="settings-select"
                value={sourceLanguage}
                onChange={e => setSourceLanguage(e.target.value)}
              >
                {LANGUAGES.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <span className="settings-lang-arrow">→</span>

            <div className="settings-field">
              <label className="settings-label">I'm learning</label>
              <select
                className="settings-select"
                value={targetLanguage}
                onChange={e => setTargetLanguage(e.target.value)}
              >
                {LANGUAGES.filter(l => l !== sourceLanguage).map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Streak stats */}
        <section className="settings-card">
          <h2 className="settings-card-title">Stats</h2>
          <div className="settings-stats">
            <div className="settings-stat">
              <span className="settings-stat-val">🔥 {profile?.current_streak ?? 0}</span>
              <span className="settings-stat-key">Current streak</span>
            </div>
            <div className="settings-stat">
              <span className="settings-stat-val">🏆 {profile?.longest_streak ?? 0}</span>
              <span className="settings-stat-key">Longest streak</span>
            </div>
            <div className="settings-stat">
              <span className="settings-stat-val">📅 {profile?.last_completed_date ?? "—"}</span>
              <span className="settings-stat-key">Last active</span>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="settings-actions">
          <button
            className={`settings-save-btn ${saved ? "saved" : ""}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saved ? "✓ Saved" : saving ? "Saving..." : "Save changes"}
          </button>

          <button className="settings-signout-btn" onClick={handleSignOut}>
            Sign out
          </button>
        </div>

      </main>
    </div>
  );
}
