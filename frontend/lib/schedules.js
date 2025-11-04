export async function listSchedules(masterId) {
  const res = await fetch(`/api/schedules/masters/${masterId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load schedules");
  return res.json();
}

export async function createSchedule(masterId, { day_of_week, start_time, end_time }) {
  const res = await fetch(`/api/schedules/masters/${masterId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ day_of_week, start_time, end_time }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail || "Failed to create schedule");
  }
  return res.json();
}

export async function updateSchedule(scheduleId, payload) {
  const res = await fetch(`/api/schedules/${scheduleId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail || "Failed to update schedule");
  }
  return res.json();
}

export async function deleteSchedule(scheduleId) {
  const res = await fetch(`/api/schedules/${scheduleId}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail || "Failed to delete schedule");
  }
  return res.json();
}


