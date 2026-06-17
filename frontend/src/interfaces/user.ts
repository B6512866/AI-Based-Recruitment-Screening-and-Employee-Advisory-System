import type { Role } from "./role";

// ─── User ─────────────────────────────────────────────
// ตาม entity/user.go
export interface User {
    id: number;           // gorm.Model ID
    created_at: string;
    updated_at: string;
    first_name: string;
    last_name: string;
    email: string;
    department: string;
    hire_date: string;

    role_id: number;
    role: Role;
}

// ─── Candidate ────────────────────────────────────────
// ตาม entity/candidate.go
export interface Candidate {
    id: number;
    created_at: string;
    updated_at: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    skills: string; // stored as comma-separated string
    applications?: Application[];
}

// ─── AIScreening ──────────────────────────────────────
// ตาม entity/ai_screening.go
export interface AIScreening {
    id: number;
    created_at: string;
    updated_at: string;
    skill_score: number;
    strengths: string;
    model_used: string;
}

// ─── Application ──────────────────────────────────────
// ตาม entity/application.go
export interface Application {
    id: number;
    created_at: string;
    updated_at: string;
    status: "pending" | "approved" | "interview" | "rejected";
    ai_score: number;
    position: string;
    resume_url: string;

    candidate_id: number;
    candidate?: Candidate;

    user_id: number;       // HR responsible
    user?: User;

    screening_id: number;
    ai_screening?: AIScreening;
}

// ─── ChatMessage ──────────────────────────────────────
// ตาม entity/chat_message.go
export interface ChatMessage {
    id: number;
    created_at: string;
    question: string;
    answer: string;
    source_doc: string;
    user_id: number;
    user?: User;
}