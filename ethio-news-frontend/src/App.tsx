import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import FeedPage from "./pages/FeedPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/signin" element={<div>Sign in coming soon</div>} />
        <Route path="/signup" element={<div>Sign up coming soon</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
