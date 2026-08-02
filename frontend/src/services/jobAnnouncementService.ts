import apiClient from "./apiClient";

// =====================================================
// Upload Job Announcement
// =====================================================

export async function uploadJobAnnouncement(
  jobId: number,
  file: File
) {
  const formData = new FormData();

  formData.append("file", file);

  const res = await apiClient.post(
    `/job-positions/${jobId}/announcements/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
}

// =====================================================
// Get Job Announcements
// =====================================================

export async function getJobAnnouncements(
  jobId: number
) {
  const res = await apiClient.get(
    `/job-positions/${jobId}/announcements`
  );

  return res.data;
}

// =====================================================
// Analyze by Gemini
// =====================================================

export async function analyzeJobAnnouncement(
  announcementId: number
) {
  const res = await apiClient.post(
    `/job-announcements/${announcementId}/analyze`,
    {},
    {
      timeout: 60000, // 💡 ตั้ง Timeout เป็น 60 วินาที สำหรับกระบวนการ AI
    }
  );

  return res.data;
}

// =====================================================
// Delete Job Announcement
// =====================================================

export async function deleteJobAnnouncement(
  announcementId: number
) {
  const res = await apiClient.delete(
    `/job-announcements/${announcementId}`
  );

  return res.data;
}

export async function getJobAnnouncementImage(announcementId: number) {
  const res = await apiClient.get(`/job-announcements/${announcementId}/image`, {
    responseType: "blob",
  });
  return res.data;
}