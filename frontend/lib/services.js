export async function listServices({ page = 1, limit = 10 } = {}) {
  const skip = (page - 1) * limit;
  const qs = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  const res = await fetch(`/api/services?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load services");
  return res.json();
}

export async function createService(payload) {
  const res = await fetch(`/api/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail || "Failed to create service");
  }
  return res.json();
}

export async function updateService(serviceId, payload) {
  const res = await fetch(`/api/services/${serviceId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail || "Failed to update service");
  }
  return res.json();
}

export async function deleteService(serviceId) {
  const res = await fetch(`/api/services/${serviceId}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail || "Failed to delete service");
  }
  return res.json();
}


