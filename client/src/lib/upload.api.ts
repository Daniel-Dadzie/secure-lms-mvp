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
// Upload lesson video — gets signed URL from our API,
// uploads directly to Firebase Storage (bypasses our server)
// ----------------------------------------------------------------------------
export async function uploadLessonVideo(
  courseId: string,
  moduleId: string,
  lessonId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  console.log("[Video Upload] Starting upload process", {
    courseId,
    moduleId,
    lessonId,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  });

  // 1. Get signed upload URL from our backend
  try {
    console.log("[Video Upload] Requesting signed URL from backend...");
    const { data } = await api.post(
      `/courses/${courseId}/lessons/${lessonId}/video-upload-url`,
      { mimeType: file.type }
    );
    console.log("[Video Upload] Signed URL received", {
      uploadUrl: data.uploadUrl ? "present" : "missing",
      filePath: data.filePath,
    });

    const { uploadUrl, filePath } = data;

    if (!uploadUrl || !filePath) {
      console.error("[Video Upload] Invalid response from backend", data);
      throw new Error("Invalid response from backend: missing uploadUrl or filePath");
    }

    // 2. Upload directly to Firebase Storage using the signed URL
    console.log("[Video Upload] Starting Firebase upload...");
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.timeout = 15 * 60 * 1000; // 15 minute timeout

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          console.log(`[Video Upload] Progress: ${percent}%`);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        console.log(`[Video Upload] Upload completed with status: ${xhr.status}`);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          console.error("[Video Upload] Upload failed", {
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText,
          });
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        console.error("[Video Upload] Network error during upload");
        reject(new Error("Network error during upload - check your connection and try again"));
      };

      xhr.ontimeout = () => {
        console.error("[Video Upload] Upload timed out");
        reject(new Error("Upload timed out - file may be too large or connection too slow"));
      };

      xhr.send(file);
    });

    console.log("[Video Upload] Firebase upload successful");

    // Persist the Firebase storage path — the server resolves it to a signed
    // playback URL when a student loads the lesson.
    console.log("[Video Upload] Updating lesson with contentUrl...");
    await api.patch(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
      contentUrl: filePath,
    });
    console.log("[Video Upload] Lesson updated successfully");

    return filePath;
  } catch (error: any) {
    console.error("[Video Upload] Error during upload process:", error);
    if (error.response) {
      console.error("[Video Upload] API Error Response:", {
        status: error.response.status,
        data: error.response.data,
      });
    }
    throw error;
  }
}

