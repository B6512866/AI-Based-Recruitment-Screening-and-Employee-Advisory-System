// ─── Auth DTO ────────────────────────────────────────
// ตาม dto/auth_dto.go

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterHRRequest {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export interface LoginResponse {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: "hr" | "employee"; // ตรง backend entity role.go
    token: string;
}