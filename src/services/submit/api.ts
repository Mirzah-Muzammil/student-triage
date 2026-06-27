export interface IntakeData {
  name: string;
  email: string;
  university: string;
  course: string;
  yearOfStudy: string;
  message: string;
}

export interface ApiResponse {
  requestId?: string;
  disposition: string;
  title: string;
  message: string;
}

/**
 * Sends the student's intake form details to the server-side triage API.
 * Throws a detailed error message if the response is not successful.
 */
export async function submitIntake(data: IntakeData): Promise<ApiResponse> {
  const res = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(
      errData?.error || `Request failed with status ${res.status}`
    );
  }

  return res.json();
}

export async function submitFollowUp(data: {
  requestId: string;
  message: string;
}): Promise<ApiResponse> {
  const res = await fetch("/api/follow-up", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(
      errData?.error || `Request failed with status ${res.status}`
    );
  }

  return res.json();
}
