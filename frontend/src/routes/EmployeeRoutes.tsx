import { Routes, Route } from "react-router-dom";
import EmployeeChat from "../page/employee/Chat";
import { ProtectedRoute } from "./ProtectedRoute";

export function EmployeeRoutes() {
    return (
        <Routes>
            <Route
                path="chat"
                element={
                    <ProtectedRoute allowedRoles={["employee"]}>
                        <EmployeeChat />
                    </ProtectedRoute>
                }
            />
            {/* สามารถเพิ่ม Route อื่นๆ ของ Employee ได้ที่นี่ เช่น /employee/profile */}
        </Routes>
    );
}
