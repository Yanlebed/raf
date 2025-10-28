from datetime import datetime, time, timedelta
from typing import List, Optional

from app.models.master_schedule import MasterSchedule
from app.models.appointment import Appointment


def compute_daily_slots(
    schedules: List[MasterSchedule],
    appointments: List[Appointment],
    day: datetime,
    slot_minutes: int = 30,
    service_duration_minutes: Optional[int] = None,
) -> List[datetime]:
    # Collect working intervals for the given weekday
    weekday = day.weekday()  # Monday=0
    work_intervals: List[tuple[time, time]] = [
        (s.start_time, s.end_time) for s in schedules if s.day_of_week == weekday
    ]
    if not work_intervals:
        return []

    # Build occupied intervals from appointments
    occupied: List[tuple[datetime, datetime]] = []
    for appt in appointments:
        start = appt.appointment_date
        effective_minutes = appt.duration_override or (appt.service.duration if appt.service and appt.service.duration else 0)
        duration = timedelta(minutes=effective_minutes)
        end = start + duration
        occupied.append((start, end))

    # Generate slots
    slots: List[datetime] = []
    # If a specific service duration is provided, use it for slot length
    effective_minutes = service_duration_minutes or slot_minutes
    slot_delta = timedelta(minutes=effective_minutes)
    for start_t, end_t in work_intervals:
        cursor = datetime.combine(day.date(), start_t)
        end_dt = datetime.combine(day.date(), end_t)
        while cursor + slot_delta <= end_dt:
            # Check overlap with occupied
            overlaps = any(not (cursor + slot_delta <= o_start or cursor >= o_end) for o_start, o_end in occupied)
            if not overlaps:
                slots.append(cursor)
            cursor += slot_delta
    return slots


