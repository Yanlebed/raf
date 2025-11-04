export async function placeHold({ master_id, service_id, start_time, duration_minutes }) {
  const res = await fetch("/api/holds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ master_id, service_id, start_time, duration_minutes }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data?.detail || "Failed to place hold");
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function releaseHold(hold_id) {
  await fetch(`/api/holds/${hold_id}`, { method: "DELETE" }).catch(() => {});
}

export async function createAppointment(payload) {
  const res = await fetch("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data?.detail || "Failed to create appointment");
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function listMyAppointments({ page = 1, limit = 20, order = "asc", startDate, endDate, status } = {}) {
  const skip = (page - 1) * limit;
  const qs = new URLSearchParams({ skip: String(skip), limit: String(limit), order });
  if (startDate) qs.set("start_date", startDate);
  if (endDate) qs.set("end_date", endDate);
  if (status) qs.set("status", status);
  const res = await fetch(`/api/appointments?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load appointments");
  return res.json();
}


