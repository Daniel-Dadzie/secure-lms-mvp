import api from "./api";

// ----------------------------------------------------------------------------
// Upload avatar — multipart/form-data to Cloudinary via our API
// ----------------------------------------------------------------------------
export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post("/uploads", formData);
  return response.data.url;
}

// ----------------------------------------------------------------------------
// Upload thumbnail — sends as multipart/form-data to our Express API
// which then uploads to Cloudinary server-side
// ----------------------------------------------------------------------------
export async function uploadCourseThumbnail(
  courseId: string,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append("thumbnail", file);

  // Do NOT set Content-Type manually — axios/browser must compute the
  // multipart boundary automatically. Setting it here strips the boundary
  // and breaks server-side parsing (same "Malformed part header" issue
  // we hit testing this in Postman).
  const response = await api.post(`/courses/${courseId}/thumbnail`, formData);

  return response.data.thumbnailUrl;
}

// ----------------------------------------------------------------------------
// Upload lesson video — sends multipart/form-data to our Express API
// which uploads to Cloudinary server-side
// ----------------------------------------------------------------------------
export async function uploadLessonVideo(
  courseId: string,
  moduleId: string,
  lessonId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const formData = new FormData();
  formData.append("video", file);

  const response = await api.post(
    `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/video`,
    formData,
    {
       
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    }
  );

  return response.data.videoUrl;
}