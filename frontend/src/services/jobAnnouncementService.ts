import apiClient from "./apiClient";

// =====================================================
// Types
// =====================================================

export interface SuggestedCriteria {
  name: string;
  description: string;
  weight: number;
}

export interface JobAnalysisResult {
  title: string;
  department: string;
  location: string;
  employment_type: string;
  salary: string;

  description: string[];
  responsibilities: string[];
  requirements: string[];

  technical_skills: string[];
  soft_skills: string[];

  education: string;
  experience: string;

  suggested_criteria: SuggestedCriteria[];
}

export interface JobAnnouncement {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;

  job_position_id: number;

  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;

  status: string;

  ocr_text?: string;
  gemini_result?: string;
}

export interface JobCriteria {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;

  job_position_id: number;

  name: string;
  description: string;
  weight: number;
  is_required: boolean;
}

// =====================================================
// Upload ประกาศงาน
// POST /job-positions/:id/announcements/upload
// =====================================================

export async function uploadJobAnnouncement(
  jobId: number,
  file: File
) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await apiClient.post(
    `/job-positions/${jobId}/announcements/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

// =====================================================
// วิเคราะห์ประกาศด้วย Gemini
// POST /job-announcements/:announcementId/analyze
// =====================================================

export async function analyzeJobAnnouncement(
  announcementId: number
) {
  const response = await apiClient.post(
    `/job-announcements/${announcementId}/analyze`
  );

  return response.data;
}

// =====================================================
// ดึงประกาศทั้งหมดของตำแหน่ง
// GET /job-positions/:id/announcements
// =====================================================

export async function getJobAnnouncements(
  jobId: number
) {
  const response = await apiClient.get(
    `/job-positions/${jobId}/announcements`
  );

  return response.data;
}

// =====================================================
// ลบประกาศ
// DELETE /job-announcements/:announcementId
// =====================================================

export async function deleteJobAnnouncement(
  announcementId: number
) {
  const response = await apiClient.delete(
    `/job-announcements/${announcementId}`
  );

  return response.data;
}

// =====================================================
// ดึงเกณฑ์ทั้งหมด
// GET /job-positions/:id/criteria
// =====================================================

export async function getJobCriteria(
  jobId: number
) {
  const response = await apiClient.get(
    `/job-positions/${jobId}/criteria`
  );

  return response.data;
}

// =====================================================
// เพิ่มเกณฑ์
// POST /job-positions/:id/criteria
// =====================================================

export async function createJobCriteria(
  jobId: number,
  data: {
    name: string;
    description: string;
    weight: number;
    is_required: boolean;
  }
) {
  const response = await apiClient.post(
    `/job-positions/${jobId}/criteria`,
    data
  );

  return response.data;
}

// =====================================================
// แก้ไขเกณฑ์
// PUT /job-criteria/:criteriaId
// =====================================================

export async function updateJobCriteria(
  criteriaId: number,
  data: {
    name: string;
    description: string;
    weight: number;
    is_required: boolean;
  }
) {
  const response = await apiClient.put(
    `/job-criteria/${criteriaId}`,
    data
  );

  return response.data;
}

// =====================================================
// ลบเกณฑ์
// DELETE /job-criteria/:criteriaId
// =====================================================

export async function deleteJobCriteria(
  criteriaId: number
) {
  const response = await apiClient.delete(
    `/job-criteria/${criteriaId}`
  );

  return response.data;
}