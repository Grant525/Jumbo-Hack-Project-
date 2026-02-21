import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Pages = [
  { label: "Home", path: "/" },
  { label: "Sign In", path: "/Sign-In" },
  { label: "Lessons", path: "/Lessons" },
  { label: "Question", path: "/Question" },
];

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Home</h1>
    </>
  );
}

export default App;
