import api from "./api";

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

  const response = await api.post(
    `/courses/${courseId}/thumbnail`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return response.data.thumbnailUrl;
}

// ----------------------------------------------------------------------------
// Upload lesson video — gets signed URL from our API,
// uploads directly to Firebase Storage (bypasses our server)
// ----------------------------------------------------------------------------
export async function uploadLessonVideo(
  courseId: string,
  lessonId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  // 1. Get signed upload URL from our backend
  const { data } = await api.post(
    `/courses/${courseId}/lessons/${lessonId}/video-upload-url`,
    { mimeType: file.type }
  );

  const { uploadUrl, filePath } = data;

  // 2. Upload directly to Firebase Storage using the signed URL
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => xhr.status === 200 ? resolve() : reject(new Error("Upload failed"));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });

  return filePath;
}