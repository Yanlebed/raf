"use client";

import { useEffect, useState } from "react";
import { listSchedules, createSchedule, updateSchedule, deleteSchedule } from "../../../lib/schedules";

export default function ManageSchedulesPage() {
  const [me, setMe] = useState(null);
  const [masterId, setMasterId] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ day_of_week: 1, start_time: "09:00", end_time: "18:00" });
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((u) => {
        setMe(u);
        if (u?.user_type === "MASTER") setMasterId(String(u.id));
      })
      .catch(() => {});
  }, []);

  async function load() {
    if (!masterId) return setItems([]);
    setLoading(true);
    setError("");
    try {
      const data = await listSchedules(masterId);
      setItems(data || []);
    } catch (err) {
      setError(err?.message || "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [masterId]);

  async function onCreate(e) {
    e.preventDefault();
    if (!masterId) return;
    // validate start < end
    if (form.start_time >= form.end_time) {
      alert("Start time must be before end time");
      return;
    }
    try {
      await createSchedule(masterId, form);
      await load();
    } catch (err) {
      alert(err?.message || "Failed to create");
    }
  }

  async function onUpdate(id, patch) {
    setBusyId(id);
    try {
      await updateSchedule(id, patch);
      await load();
    } catch (err) {
      alert(err?.message || "Failed to update");
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this schedule?")) return;
    setBusyId(id);
    try {
      await deleteSchedule(id);
      await load();
    } catch (err) {
      alert(err?.message || "Failed to delete");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section>
      <h1 className="hero-title">Manage schedules</h1>
      <p className="hero-subtitle">Admins can manage any master; masters can manage their own.</p>
      <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "8px 0 16px" }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="muted">Master ID</span>
          <input value={masterId} onChange={(e) => setMasterId(e.target.value)} placeholder="e.g., 42" style={{ height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid var(--border)" }} />
        </label>
        <button className="button" onClick={() => load()}>Load</button>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Add working interval</h3>
        <form onSubmit={onCreate} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <label className="muted">Day
            <select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: parseInt(e.target.value, 10) })} style={{ marginLeft: 8, height: 34, borderRadius: 6, border: "1px solid var(--border)" }}>
              {[
                [1, "Mon"], [2, "Tue"], [3, "Wed"], [4, "Thu"], [5, "Fri"], [6, "Sat"], [0, "Sun"],
              ].map(([v, label]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </label>
          <label className="muted">Start<input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} style={{ marginLeft: 8, height: 34, borderRadius: 6, border: "1px solid var(--border)" }} /></label>
          <label className="muted">End<input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} style={{ marginLeft: 8, height: 34, borderRadius: 6, border: "1px solid var(--border)" }} /></label>
          <button className="button" type="submit">Add</button>
        </form>
      </div>

      {loading ? (
        <div className="muted">Loading…</div>
      ) : error ? (
        <div style={{ color: "#b91c1c" }}>{error}</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((s) => {
            const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][s.day_of_week] ?? s.day_of_week;
            return (
              <div key={s.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <strong>ID {s.id}</strong>
                    <span className="muted" style={{ marginLeft: 8 }}>{weekday} · {s.start_time} - {s.end_time}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <label className="muted">Day
                      <select defaultValue={s.day_of_week} onChange={(e) => onUpdate(s.id, { day_of_week: parseInt(e.target.value, 10) })} style={{ marginLeft: 8, height: 34, borderRadius: 6, border: "1px solid var(--border)" }}>
                        {[[1,"Mon"],[2,"Tue"],[3,"Wed"],[4,"Thu"],[5,"Fri"],[6,"Sat"],[0,"Sun"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </label>
                    <label className="muted">Start<input type="time" defaultValue={s.start_time} onBlur={(e) => { const val = e.target.value; if (val >= s.end_time) { alert("Start must be before end"); e.target.value = s.start_time; return; } onUpdate(s.id, { start_time: val }); }} style={{ marginLeft: 8, height: 34, borderRadius: 6, border: "1px solid var(--border)" }} /></label>
                    <label className="muted">End<input type="time" defaultValue={s.end_time} onBlur={(e) => { const val = e.target.value; if (s.start_time >= val) { alert("End must be after start"); e.target.value = s.end_time; return; } onUpdate(s.id, { end_time: val }); }} style={{ marginLeft: 8, height: 34, borderRadius: 6, border: "1px solid var(--border)" }} /></label>
                    <button className="nav-link" onClick={() => onDelete(s.id)} disabled={busyId === s.id} style={{ border: "1px solid var(--border)", borderRadius: 6, height: 36, padding: "0 12px" }}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
          {items.length === 0 ? <div className="muted">No schedules.</div> : null}
        </div>
      )}
    </section>
  );
}


