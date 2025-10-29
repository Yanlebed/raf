"use client";

import { useEffect, useMemo, useState } from "react";
import { listServices, createService, updateService, deleteService } from "../../../lib/services";

function ServiceForm({ initial = {}, onSubmit, submitLabel = "Save", busy = false }) {
  const [name, setName] = useState(initial.name || "");
  const [description, setDescription] = useState(initial.description || "");
  const [price, setPrice] = useState(initial.price ?? "");
  const [duration, setDuration] = useState(initial.duration ?? "");
  const [isActive, setIsActive] = useState(initial.is_active ?? true);

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      name,
      description: description || null,
      price: price === "" ? null : Number(price),
      duration: duration === "" ? null : Number(duration),
      is_active: Boolean(isActive),
    };
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
      <label>
        <div className="muted" style={{ marginBottom: 4 }}>Name</div>
        <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }} />
      </label>
      <label>
        <div className="muted" style={{ marginBottom: 4 }}>Description</div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)" }} />
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <label style={{ flex: 1 }}>
          <div className="muted" style={{ marginBottom: 4 }}>Price</div>
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" step="0.01" style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }} />
        </label>
        <label style={{ flex: 1 }}>
          <div className="muted" style={{ marginBottom: 4 }}>Duration (min)</div>
          <input value={duration} onChange={(e) => setDuration(e.target.value)} type="number" min="0" step="1" style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)" }} />
        </label>
      </div>
      <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Active
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="button" type="submit" disabled={busy}>{busy ? "Saving…" : submitLabel}</button>
      </div>
    </form>
  );
}

export default function AdminServicesPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const hasPrev = page > 1;
  const hasNext = (page - 1) * limit + items.length < total;

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await listServices({ page, limit });
      setItems(data.items || []);
      setTotal(typeof data.total === "number" ? data.total : (data.items || []).length);
    } catch (err) {
      setError(err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page, limit]);

  async function handleCreate(payload) {
    setCreating(true);
    try {
      await createService(payload);
      await load();
    } catch (err) {
      alert(err?.message || "Failed to create");
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(id, payload) {
    setBusyId(id);
    try {
      await updateService(id, payload);
      setEditingId(null);
      await load();
    } catch (err) {
      alert(err?.message || "Failed to update");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this service?")) return;
    setBusyId(id);
    try {
      await deleteService(id);
      await load();
    } catch (err) {
      alert(err?.message || "Failed to delete");
    } finally {
      setBusyId(null);
    }
  }

  const showingStart = items.length ? (page - 1) * limit + 1 : 0;
  const showingEnd = (page - 1) * limit + items.length;

  return (
    <section>
      <h1 className="hero-title">Admin: Services</h1>
      <p className="hero-subtitle">Create, update, and delete services.</p>

      <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Create service</h3>
        <ServiceForm onSubmit={handleCreate} submitLabel="Create" busy={creating} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "12px 0" }}>
        <div className="muted">{`Showing ${showingStart}-${showingEnd} of ${total}`}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="nav-link" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!hasPrev} style={{ background: "transparent", border: 0, cursor: hasPrev ? "pointer" : "not-allowed", opacity: hasPrev ? 1 : 0.5 }}>Prev</button>
          <button className="nav-link" onClick={() => setPage((p) => p + 1)} disabled={!hasNext} style={{ background: "transparent", border: 0, cursor: hasNext ? "pointer" : "not-allowed", opacity: hasNext ? 1 : 0.5 }}>Next</button>
          <select value={limit} onChange={(e) => setLimit(parseInt(e.target.value, 10))} style={{ height: 34, borderRadius: 6, border: "1px solid var(--border)" }}>
            {[10, 20, 50].map((n) => <option key={n} value={n}>{n}/page</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="muted">Loading…</div>
      ) : error ? (
        <div style={{ color: "#b91c1c" }}>{error}</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((s) => (
            <div key={s.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
              {editingId === s.id ? (
                <ServiceForm
                  initial={s}
                  onSubmit={(payload) => handleUpdate(s.id, payload)}
                  submitLabel="Update"
                  busy={busyId === s.id}
                />
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                    <strong>{s.name}</strong>
                    <span className="muted">ID: {s.id}</span>
                  </div>
                  {s.description ? <div className="muted" style={{ marginTop: 6 }}>{s.description}</div> : null}
                  <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                    {typeof s.price === "number" ? <div><span className="muted">Price:</span> {s.price}</div> : null}
                    {typeof s.duration === "number" ? <div><span className="muted">Duration:</span> {s.duration} min</div> : null}
                    <div><span className="muted">Active:</span> {String(s.is_active)}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button className="button" onClick={() => setEditingId(s.id)} disabled={busyId === s.id}>Edit</button>
                    <button className="nav-link" onClick={() => handleDelete(s.id)} disabled={busyId === s.id} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 6, height: 40, padding: "0 12px" }}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
          {items.length === 0 ? <div className="muted">No services found.</div> : null}
        </div>
      )}
    </section>
  );
}


