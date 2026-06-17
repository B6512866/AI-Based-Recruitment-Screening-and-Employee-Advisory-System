import { Routes, Route } from "react-router-dom";
import HRDashboard from "../layout/hr/Dashboard";
import HRLayout from "../layout/hr/HRLayout";
import { ProtectedRoute } from "./ProtectedRoute";

export function HRRoutes() {
    return (
        <ProtectedRoute allowedRoles={["hr"]}>
            <Routes>
                <Route element={<HRLayout />}>
                    <Route index element={<HRDashboard />} />
                    <Route path="dashboard" element={<HRDashboard />} />
                    {/* เพิ่ม Route อื่นๆ เช่น screening, interviews ในอนาคต */}
                    <Route path="*" element={<HRDashboard />} />
                </Route>
            </Routes>
        </ProtectedRoute>
    );
}
