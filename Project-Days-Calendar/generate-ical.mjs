import { getCommemorativeDatesForYear } from "./common.mjs";
import { readFileSync } from "fs";
import { writeFileSync } from "fs";

const jsonText = readFileSync("./days.json", "utf8");
const days = JSON.parse(jsonText);


// Helper to format date as YYYYMMDD for iCal
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CYF//Commemorative Days//EN
CALSCALE:GREGORIAN
`;

for (let year = 2020; year <= 2030; year++) {
  const events = getCommemorativeDatesForYear(year, days);
  for (const [iso, name] of Object.entries(events)) {
    const date = new Date(iso);
    const dt = formatDate(date);
    ical += `BEGIN:VEVENT
SUMMARY:${name}
DTSTART;VALUE=DATE:${dt}
DTEND;VALUE=DATE:${dt}
DESCRIPTION:${name}
UID:${dt}-${name.replace(/\s+/g, "")}@cyf
END:VEVENT
`;
  }
}

ical += "END:VCALENDAR\n";

writeFileSync("days.ics", ical);

console.log("days.ics generated for years 2020–2030.");
