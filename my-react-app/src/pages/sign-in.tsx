import Auth from "../Auth";
import "./sign-in.css";

export default function SignIn() {
  return (
    <div className="signin-root">
      <div className="signin-bg-grid" />
      <div className="signin-card">
        <div className="signin-logo">
          <span className="signin-logo-icon">{"◈"}</span>
          <span className="signin-logo-text">Rosetta</span>
        </div>
        <p className="signin-tagline">Learn using what you know</p>
        <Auth />
      </div>
    </div>
  );
}
