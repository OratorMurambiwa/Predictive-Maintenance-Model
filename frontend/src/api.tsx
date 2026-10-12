const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

export interface PredictionResult {
  rul: number;
  status: "healthy" | "monitor" | "critical";
  color: "green" | "yellow" | "red";
  cycles_analyzed: number;
  rows_received: number;
  last_cycle: number | null;
}

export async function predictRUL(file: File): Promise<PredictionResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = `Prediction failed (${response.status})`;

    try {
      const error = await response.json();

      if (typeof error.detail === "string") {
        message = error.detail;
      } else if (Array.isArray(error.detail)) {
        message = error.detail
          .map((item: { msg?: string }) => item.msg || "Invalid input")
          .join("; ");
      }
    } catch {
      // Keep the fallback message if the response is not JSON.
    }

    throw new Error(message);
  }

  return response.json();
}