import Auth from "../Auth";
import "./sign-in.css";

export default function SignIn() {
  return (
    <div className="signin-root">
      <div className="signin-bg-grid" />
      <div className="signin-card">
        <div className="signin-logo">
          <span className="signin-logo-icon">{"</>"}</span>
          <span className="signin-logo-text">CodeQuest</span>
        </div>
        <p className="signin-tagline">Learn syntax by doing — one snippet at a time</p>
        <Auth />
      </div>
    </div>
  );
}
