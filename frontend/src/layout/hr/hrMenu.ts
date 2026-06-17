import React from "react";
import {
    LayoutDashboard,
    FileSearch,
    CalendarCheck,
    Users,
    MessageSquare,
    BarChart3,
    FileText,
    Settings,
} from "lucide-react";

export interface MenuItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
}

export const hrMenuItems: MenuItem[] = [
    {
        id: "dashboard",
        label: "ภาพรวม",
        icon: LayoutDashboard,
        path: "/hr/dashboard",
    },
    {
        id: "screening",
        label: "คัดกรอง Resume",
        icon: FileSearch,
        path: "/hr/screening",
    },
    {
        id: "interviews",
        label: "ตารางสัมภาษณ์",
        icon: CalendarCheck,
        path: "/hr/interviews",
    },
    {
        id: "candidates",
        label: "ผู้สมัครทั้งหมด",
        icon: Users,
        path: "/hr/candidates",
    },
    {
        id: "advisor",
        label: "HR Advisor",
        icon: MessageSquare,
        path: "/hr/advisor",
    },
    {
        id: "reports",
        label: "รายงาน",
        icon: BarChart3,
        path: "/hr/reports",
    },
    {
        id: "knowledge",
        label: "คลังความรู้",
        icon: FileText,
        path: "/hr/knowledge",
    },
    {
        id: "settings",
        label: "ตั้งค่า",
        icon: Settings,
        path: "/hr/settings",
    },
];
