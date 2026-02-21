import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import Auth from "../Auth";
import "./sign-in.css";

export default function SignIn() {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  // Already logged in → go home
  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  if (loading) return null;

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
