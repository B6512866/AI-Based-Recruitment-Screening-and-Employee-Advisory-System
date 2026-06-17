import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "../page/landing/LandingPage.tsx";
import { HRRoutes } from "./HRRoutes";
import { EmployeeRoutes } from "./EmployeeRoutes";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* หน้าหลัก (Landing & Login) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LandingPage />} />

        {/* HR Sub-Routes */}
        <Route path="/hr/*" element={<HRRoutes />} />

        {/* Employee Sub-Routes */}
        <Route path="/employee/*" element={<EmployeeRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}