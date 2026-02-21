import { Navigate } from "react-router-dom";
import { useUser } from "./hooks/useUser";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div style={{
        width: "100vw", height: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#0d0f14", color: "#5a607a",
        fontFamily: "Syne, sans-serif", fontSize: "1rem"
      }}>
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/sign-in" replace />;

  return <>{children}</>;
}
