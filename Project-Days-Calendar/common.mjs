import days from "./days.json" with { type: "json" };

const pad = n => String(n).padStart(2, "0");

// Helper to convert names to numbers
const weekdayMap = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6

};
//  Maps ordinal names to numbers
const ordinalMap = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  last: -1
};

// Converts month name to 0–11 number
const getMonthIndex = (monthName) =>
  new Date(`${monthName} 1, 2000`).getMonth();

// Finds correct date in a year for a given rule
function calculateDate({ monthName, dayName, occurence }, year) {
  const month = getMonthIndex(monthName);
  const weekday = weekdayMap[dayName.toLowerCase()];
  const target = ordinalMap[occurence.toLowerCase()];

  let date = new Date(year, month, 1);
  let count = 0, lastMatch = null;

  while (date.getMonth() === month) {
    if (date.getDay() === weekday) {
      count++;
      lastMatch = new Date(date);
      if (count === target) return date;
    }
    date.setDate(date.getDate() + 1);
  }

  return target === -1 ? lastMatch : null;
}

// Generates a map of commemorative dates for a given year
export function getCommemorativeDatesForYear(year, data = days) {
  const result = {};
  for (const day of data) {
    const date = calculateDate(day, year);
    if (date) {
      const key = `${year}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      result[key] = day.name;
    }
  }
  return result;
}
