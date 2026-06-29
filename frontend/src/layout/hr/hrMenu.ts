import React from "react";
import {
    LayoutDashboard,
    Briefcase,
    Users,
    CalendarCheck,
    FolderOpen,
    FileSearch,
    BookOpen,
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
        label: "Dashbord",
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
        id: "knowledge",
        label: "คลังความรู้ (นโยบาย)",
        icon: BookOpen,
        path: "/hr/knowledge",
    },
    {
        id: "positions",
        label: "ตำแหน่งงาน",
        icon: Briefcase,
        path: "/hr/positions",
    },
    {
        id: "candidates",
        label: "โปรไฟล์ผู้สมัคร",
        icon: Users,
        path: "/hr/candidates",
    },
    {
        id: "interviews",
        label: "นัดหมายสัมภาษณ์",
        icon: CalendarCheck,
        path: "/hr/interviews",
    },
    {
        id: "cases",
        label: "ทะเบียนของกรณี",
        icon: FolderOpen,
        path: "/hr/cases",
    },
];
