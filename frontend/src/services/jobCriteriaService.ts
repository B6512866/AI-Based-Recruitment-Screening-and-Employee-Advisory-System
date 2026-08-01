import apiClient from "./apiClient";

// ==========================================
// Types
// ==========================================

export interface JobCriteria {
  ID: number;
  CreatedAt?: string;
  UpdatedAt?: string;

  job_position_id: number;
  name: string;
  description: string;

  // รองรับทั้งโครงสร้างเดิมและโครงสร้างใหม่
  weight?: number;
  max_score?: number;

  is_required: boolean;
}

export interface JobCriteriaOption {
  ID: number;
  CreatedAt?: string;
  UpdatedAt?: string;

  job_criteria_id: number;

  name: string;
  description: string;
  score: number;

  is_active: boolean;
}

// ==========================================
// Job Criteria
// ==========================================

// ดึงเกณฑ์ทั้งหมดของตำแหน่งงาน
export async function getJobCriteria(
  jobPositionId: number
) {
  const res = await apiClient.get(
    `/job-positions/${jobPositionId}/criteria`
  );

  return res.data;
}

// เพิ่มเกณฑ์หลัก
export async function createJobCriteria(
  jobPositionId: number,
  data: {
    name: string;
    description: string;
    weight: number;
    is_required: boolean;
  }
) {
  const res = await apiClient.post(
    `/job-positions/${jobPositionId}/criteria`,
    data
  );

  return res.data;
}

// แก้ไขเกณฑ์หลัก
export async function updateJobCriteria(
  criteriaId: number,
  data: {
    name: string;
    description: string;
    weight: number;
    is_required: boolean;
  }
) {
  const res = await apiClient.put(
    `/job-criteria/${criteriaId}`,
    data
  );

  return res.data;
}

// ลบเกณฑ์หลัก
export async function deleteJobCriteria(
  criteriaId: number
) {
  const res = await apiClient.delete(
    `/job-criteria/${criteriaId}`
  );

  return res.data;
}

// ==========================================
// Criteria Options
// ==========================================

// ดึงตัวเลือกทั้งหมดของเกณฑ์
export async function getCriteriaOptions(
  criteriaId: number
) {
  const res = await apiClient.get(
    `/job-criteria/${criteriaId}/options`
  );

  return res.data;
}

// เพิ่มตัวเลือกคะแนน
export async function createCriteriaOption(
  criteriaId: number,
  data: {
    name: string;
    description: string;
    score: number;
    is_active: boolean;
  }
) {
  const res = await apiClient.post(
    `/job-criteria/${criteriaId}/options`,
    data
  );

  return res.data;
}

// แก้ไขตัวเลือกคะแนน
export async function updateCriteriaOption(
  optionId: number,
  data: {
    name: string;
    description: string;
    score: number;
    is_active: boolean;
  }
) {
  const res = await apiClient.put(
    `/job-criteria-options/${optionId}`,
    data
  );

  return res.data;
}

// ลบตัวเลือกคะแนน
export async function deleteCriteriaOption(
  optionId: number
) {
  const res = await apiClient.delete(
    `/job-criteria-options/${optionId}`
  );

  return res.data;
}