import { getCommemorativeDatesForYear } from "./common.mjs";
import daysData from "./days.json" with { type: "json" };

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

document.addEventListener("DOMContentLoaded", () => {
  const monthSelect = document.getElementById("month-select");
  const yearSelect = document.getElementById("year-select");

  for (let m = 0; m < 12; m++) {
    const monthOption = document.createElement("option");
    monthOption.value = m;
    monthOption.text = new Date(2000, m).toLocaleString("en-GB", { month: "long" });
    monthSelect.appendChild(monthOption);
  }

  for (let y = 1900; y <= 2100; y++) {
    const yearOption = document.createElement("option");
    yearOption.value = y;
    yearOption.text = y;
    yearSelect.appendChild(yearOption);
  }

  monthSelect.value = currentMonth;
  yearSelect.value = currentYear;

  document.getElementById("prev").addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    updateDropdowns();
    renderCalendar(currentMonth, currentYear);
  });

  document.getElementById("next").addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    updateDropdowns();
    renderCalendar(currentMonth, currentYear);
  });

  document.getElementById("go").addEventListener("click", () => {
    currentMonth = parseInt(monthSelect.value);
    currentYear = parseInt(yearSelect.value);
    renderCalendar(currentMonth, currentYear);
  });

  renderCalendar(currentMonth, currentYear);
});

function updateDropdowns() {
  document.getElementById("month-select").value = currentMonth;
  document.getElementById("year-select").value = currentYear;
}


function renderCalendar(month, year) {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const firstDay = new Date(year, month, 1);

  // We want Monday=0 ... Sunday=6
  const startDay = (firstDay.getDay() + 6) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleString("en-GB", { month: "long" });
  document.getElementById("current-month").textContent = `${monthName} ${year}`;

  // Prepare commemorative dates as before
 const commemorativeDatesArr = Object.entries(
        getCommemorativeDatesForYear(year, daysData)
      ).map(([iso, name]) => ({
        date: new Date(iso),
        name
      }));

  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";

  // Weekday headers (Monday first)
  const headerRow = document.createElement("tr");
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach(day => {
    const th = document.createElement("th");
    th.textContent = day;
    th.style.border = "1px solid black";
    th.style.padding = "5px";
    th.style.backgroundColor = "#f0f0f0";
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  let date = 1 - startDay; // start with negative or zero for empty before first day

  for (let week = 0; week < 6; week++) {
    const row = document.createElement("tr");

    for (let i = 0; i < 7; i++) {
      const cell = document.createElement("td");
      cell.style.border = "1px solid black";
      cell.style.padding = "10px";
      cell.style.height = "80px";
      cell.style.verticalAlign = "top";
      cell.style.width = "110px"
      cell.style.maxWidth = "110px";
      cell.style.wordBreak = "break-word";
      cell.style.whiteSpace = "normal";

      if (date >= 1 && date <= daysInMonth) {
        cell.textContent = date;

        commemorativeDatesArr.forEach(event => {
          if (
            event.date.getFullYear() === year &&
            event.date.getMonth() === month &&
            event.date.getDate() === date
          ) {
            const label = document.createElement("div");
            label.textContent = event.name;
            label.style.fontSize = "1em";
            label.style.color = "blue";
            label.style.marginTop = "5px";
            cell.appendChild(label);
          }
        });
      } else {
        // empty cell before 1st or after last day
        cell.textContent = "";
      }

      row.appendChild(cell);
      date++;
    }

    table.appendChild(row);

    // Stop creating rows once all days rendered
    if (date > daysInMonth) break;
  }

  calendar.appendChild(table);
}
