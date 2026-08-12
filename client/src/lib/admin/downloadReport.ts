import api from "@/lib/api";

export async function downloadReport(
  type: string,
  filename: string,
  params?: Record<string, string>
): Promise<void> {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const res = await api.get(`/admin/reports/${type}${query}`, {
    responseType: "blob",
  });

  const blob = new Blob([res.data], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
