// Helper: Get day string (YYYY-MM-DD) from timestamp
export function getLocalDay(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// Helper: Check if listen is on Friday night (Fri 5pm–Sat 4am)
export function isFridayNight(ts) {
  const d = new Date(ts);
  const day = d.getDay();
  const hour = d.getHours();
  return (day === 5 && hour >= 17) || (day === 6 && hour < 4);
}