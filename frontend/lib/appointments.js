export async function getAppointment(id) {
  const res = await fetch(`/api/appointments/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load appointment");
  return res.json();
}

export async function rescheduleAppointment(id, isoDate) {
  const res = await fetch(`/api/appointments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appointment_date: isoDate }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail || "Failed to reschedule");
  }
  return res.json();
}

export async function cancelAppointment(id) {
  const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail || "Failed to cancel");
  }
  return res.json();
}

export async function updateAppointment(id, payload) {
  const res = await fetch(`/api/appointments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail || "Failed to update appointment");
  }
  return res.json();
}


