import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "../page/landing/LandingPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes> 
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}