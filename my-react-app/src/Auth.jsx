
import { useState } from "react";
import { supabase } from "./supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [message, setMessage] = useState("");

  const handleEmailAuth = async () => {
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });
      if (error) setMessage(error.message);
      else setMessage("Check your email to confirm your account!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) setMessage(error.message);
    }
  };

  const handleGitHub = async () => {
    await supabase.auth.signInWithOAuth({ provider: "github" });
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>{isSignUp ? "Sign Up" : "Log In"}</h2>

      {isSignUp && (
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
        />
      )}

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
      />

      <button onClick={handleEmailAuth} style={{ width: "100%", padding: "10px", marginBottom: "10px" }}>
        {isSignUp ? "Sign Up" : "Log In"}
      </button>

      <button onClick={handleGitHub} style={{ width: "100%", padding: "10px", marginBottom: "10px", background: "#333", color: "white" }}>
        Continue with GitHub
      </button>

      <button onClick={handleGoogle} style={{ width: "100%", padding: "10px", marginBottom: "10px", background: "#4285F4", color: "white" }}>
        Continue with Google
      </button>

      <p onClick={() => setIsSignUp(!isSignUp)} style={{ cursor: "pointer", color: "blue" }}>
        {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
      </p>

      {message && <p>{message}</p>}
    </div>
  );
}
