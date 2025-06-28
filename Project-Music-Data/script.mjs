// Core Display Script for Music Stats Analysis

import { getUserIDs, getListenEvents, getSong } from "./data.mjs";
import {
  getDay,
  isFridayNight,
  countBy,
  sumBy,
  topN,
  intersection,
} from "./common.mjs";

function qaRow(question, answer) {
  return answer
    ? `<tr><td><strong>${question}</strong></td><td>${answer}</td></tr>`
    : "";
}

window.onload = function () {
  // Set the instruction text
  const instruction = document.getElementById("instruction");
  if (instruction) {
    instruction.textContent =
      "Select a user using the drop down above to view their analysed data.";
  }

  const userSelect = document.getElementById("userSelect");
  const userIDs = getUserIDs();

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select User";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  userSelect.appendChild(defaultOption);

  userIDs.forEach((userID) => {
    const option = document.createElement("option");
    option.value = userID;
    option.textContent = `User ${userID}`;
    userSelect.appendChild(option);
  });

  userSelect.addEventListener("change", async (event) => {
    const selectedUser = event.target.value;
    const resultsDiv = document.getElementById("results");
    const instruction = document.getElementById("instruction");
    resultsDiv.innerHTML = "";

    if (instruction) instruction.style.display = "none";
    if (!selectedUser) return;

    const listens = getListenEvents(Number(selectedUser)) || [];
    if (listens.length === 0) {
      resultsDiv.innerHTML = `<p>This user didn't listen to any songs.</p>`;
      return;
    }

    listens.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const songCounts = countBy(listens, (l) => l.song_id);
    const [topSongID, topSongCount] = topN(songCounts, 1)[0] || [];
    const topSong = topSongID ? getSong(topSongID) : null;

    const artistCounts = countBy(listens, (l) => getSong(l.song_id)?.artist);
    const [topArtist, topArtistCount] = topN(artistCounts, 1)[0] || [];

    const fridayListens = listens.filter((l) => isFridayNight(l.timestamp));
    const fridaySongCounts = countBy(fridayListens, (l) => l.song_id);
    const [topFridaySongID] = topN(fridaySongCounts, 1)[0] || [];
    const topFridaySong = topFridaySongID ? getSong(topFridaySongID) : null;

    const songDurations = sumBy(
      listens,
      (l) => l.song_id,
      (l) => getSong(l.song_id)?.duration_seconds || 0
    );
    const [topSongByTimeID] = topN(songDurations, 1)[0] || [];
    const topSongByTime = topSongByTimeID ? getSong(topSongByTimeID) : null;

    const artistDurations = sumBy(
      listens,
      (l) => getSong(l.song_id)?.artist,
      (l) => getSong(l.song_id)?.duration_seconds || 0
    );
    const [topArtistByTime] = topN(artistDurations, 1)[0] || [];

    // Longest streak (returns multiple if tied)
    let maxStreak = 0,
      curStreak = 0,
      prevSongID = null;
    const streaks = {};
    for (const l of listens) {
      if (l.song_id === prevSongID) {
        curStreak++;
      } else {
        curStreak = 1;
        prevSongID = l.song_id;
      }
      streaks[l.song_id] = Math.max(streaks[l.song_id] || 0, curStreak);
      maxStreak = Math.max(maxStreak, curStreak);
    }
    const topStreakSongs = Object.entries(streaks)
      .filter(([_, count]) => count === maxStreak)
      .map(([id]) => getSong(id))
      .filter(Boolean);

    // Songs listened to every day
    const days = {};
    for (const l of listens) {
      const day = getDay(l.timestamp);
      if (!days[day]) days[day] = new Set();
      days[day].add(l.song_id);
    }
    const dayArrays = Object.values(days).map((set) => [...set]);
    const everyDaySongs = intersection(dayArrays);
    const everyDaySongTitles = [...everyDaySongs]
      .map((id) => {
        const s = getSong(id);
        return s ? `${s.artist} - ${s.title}` : null;
      })
      .filter(Boolean);

    const genreCounts = countBy(listens, (l) => getSong(l.song_id)?.genre);
    const genreEntries = topN(genreCounts, 3);
    const genreLabel =
      genreEntries.length === 1
        ? "Top genre"
        : `Top ${genreEntries.length} genres`;

    const fridaySongDurations = sumBy(
      fridayListens,
      (l) => l.song_id,
      (l) => getSong(l.song_id)?.duration_seconds || 0
    );
    const [topFridaySongByTimeID] = topN(fridaySongDurations, 1)[0] || [];
    const topFridaySongByTime = topFridaySongByTimeID
      ? getSong(topFridaySongByTimeID)
      : null;
    const topArtistByTimeName = topArtistByTime;
    const topArtistByTimeDuration = artistDurations[topArtistByTimeName] || 0;

    // Build QA table
    let html = `<table border="1" cellpadding="6" cellspacing="0">
      <thead><tr><th>Question</th><th>Answer</th></tr></thead><tbody>`;

    html += qaRow(
      "Most listened song (count):",
      topSong
        ? `${topSong.artist} - ${topSong.title} (${topSongCount} times)`
        : null
    );
    html += qaRow(
      "Most listened song (time):",
      topSongByTime ? `${topSongByTime.artist} - ${topSongByTime.title}` : null
    );
    html += qaRow(
      "Most listened artist (count):",
      topArtist ? `${topArtist} (${topArtistCount} times)` : null
    );
    html += qaRow(
      "Most listened artist (time):",
      topArtistByTime
        ? `${topArtistByTime} (${Math.round(topArtistByTimeDuration / 60)} min)`
        : null
    );
    html += qaRow(
      "Friday night song (count):",
      topFridaySong ? `${topFridaySong.artist} - ${topFridaySong.title}` : null
    );
    html += qaRow(
      "Friday night song (time):",
      topFridaySongByTime
        ? `${topFridaySongByTime.artist} - ${topFridaySongByTime.title}`
        : null
    );
    html += qaRow(
      "Longest streak song:",
      topStreakSongs.length && maxStreak > 1
        ? topStreakSongs
            .map((s) => `${s.artist} - ${s.title} (${maxStreak} times)`)
            .join(", ")
        : null
    );
    html += qaRow(
      "Every day songs:",
      everyDaySongTitles.length ? everyDaySongTitles.join(", ") : null
    );
    html += genreEntries.length
      ? qaRow(genreLabel + ":", genreEntries.map(([g]) => g).join(", "))
      : "";

    html += `</tbody></table>`;
    resultsDiv.innerHTML = html;
  });
};
