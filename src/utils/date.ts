// src/utils/date.ts
export function toDateInputValue(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayRange(now = new Date()) {
  const from = toDateInputValue(now);
  const to = from;
  return { from, to };
}

export function weekendRange(ref = new Date()) {
  // 0=Dom ... 6=Sáb
  const day = ref.getDay();
  const diffToSat = (6 - day + 7) % 7;
  const saturday = new Date(ref);
  saturday.setDate(ref.getDate() + diffToSat);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  return { from: toDateInputValue(saturday), to: toDateInputValue(sunday) };
}