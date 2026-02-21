import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Lessons from "./pages/lessons";
import Question from "./pages/question";
import SignIn from "./pages/sign-in";
import Auth from "./Auth";

function App() {
  return (
    <BrowserRouter>
      <Auth />
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/lessons"        element={<Lessons />} />
        <Route path="/question/:id"   element={<Question />} />
        <Route path="/sign-in"        element={<SignIn />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
