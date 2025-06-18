import { getUserIDs, getListenEvents, getSong } from "./data.mjs";
import {
  getDay,
  isFridayNight,
  countBy,
  sumBy,
  topN,
  intersection,
} from "./common.mjs";

// Helper to build Q&A block only if answer exists
function qaBlock(question, answer) {
  return answer ? `<p><strong>${question}</strong> ${answer}</p>` : "";
}

// Main
window.onload = function () {
  const userSelect = document.getElementById("userSelect");
  const userIDs = getUserIDs();

  userIDs.forEach((userID) => {
    const option = document.createElement("option");
    option.value = userID;
    option.textContent = userID;
    userSelect.appendChild(option);
  });

  userSelect.addEventListener("change", async (event) => {
    const selectedUser = event.target.value;
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (!selectedUser) return;

    const listens = getListenEvents(Number(selectedUser)) || [];
    if (listens.length === 0) {
      resultsDiv.innerHTML = `<p>This user didn't listen to any songs.</p>`;
      return;
    }

    // Sort listens by time to support streaks
    listens.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // 1. Most listened song (by count)
    const songCounts = countBy(listens, (l) => l.song_id);
    const [topSongID, topSongCount] = topN(songCounts, 1)[0] || [];
    const topSong = topSongID ? getSong(topSongID) : null;

    // 2. Most listened artist (by count)
    const artistCounts = countBy(listens, (l) => getSong(l.song_id)?.artist);
    const [topArtist, topArtistCount] = topN(artistCounts, 1)[0] || [];

    // 3. Most listened song on Friday nights (by count)
    const fridayListens = listens.filter((l) => isFridayNight(l.timestamp));
    const fridaySongCounts = countBy(fridayListens, (l) => l.song_id);
    const [topFridaySongID] = topN(fridaySongCounts, 1)[0] || [];
    const topFridaySong = topFridaySongID ? getSong(topFridaySongID) : null;

    // 4. Most listened song/artist by listening time
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

    // 5. Longest streak
    let maxStreak = 0,
      streakSongID = null,
      curStreak = 0,
      prevSongID = null;
    for (const l of listens) {
      if (l.song_id === prevSongID) {
        curStreak++;
      } else {
        curStreak = 1;
        prevSongID = l.song_id;
      }
      if (curStreak > maxStreak) {
        maxStreak = curStreak;
        streakSongID = l.song_id;
      }
    }
    const streakSong = streakSongID ? getSong(streakSongID) : null;

    // 6. Songs listened to every day
    const days = {};
    for (const l of listens) {
      const day = getDay(l.timestamp);
      if (!days[day]) days[day] = new Set();
      days[day].add(l.song_id);
    }
    const everyDaySongs = intersection(Object.values(days));
    const everyDaySongTitles = [...everyDaySongs]
      .map((id) => {
        const s = getSong(id);
        return s ? `${s.artist} - ${s.title}` : null;
      })
      .filter(Boolean);

    // 7. Top genres
    const genreCounts = countBy(listens, (l) => getSong(l.song_id)?.genre);
    const genreEntries = topN(genreCounts, 3);
    const genreLabel =
      genreEntries.length === 1
        ? "Top genre"
        : `Top ${genreEntries.length} genres`;

    // Build results HTML
    let html = "";
    html += qaBlock(
      "Most listened song:",
      topSong
        ? `${topSong.artist} - ${topSong.title} (${topSongCount} times)`
        : null
    );
     html += qaBlock(
      "Most listened song based on time:",
      topSongByTime ? `${topSongByTime.artist} - ${topSongByTime.title}` : null
    );
    html += qaBlock(
      "Most listened to artist:",
      topArtist ? `${topArtist} (${topArtistCount} times)` : null
    );
    html += qaBlock(
      "Most often listened to song on Friday nights (5pm–4am):",
      topFridaySong ? `${topFridaySong.artist} - ${topFridaySong.title}` : null
    );
   
    html += qaBlock(
      "Most listened to artist by listening time:",
      topArtistByTime || null
    );
    html += qaBlock(
      "Song listened to the most times in a row:",
      streakSong && maxStreak > 1
        ? `${streakSong.artist} - ${streakSong.title} (${maxStreak} times)`
        : null
    );
    html += everyDaySongTitles.length
      ? qaBlock("Song(s) listened to every day:", everyDaySongTitles.join(", "))
      : "";
    html += genreEntries.length
      ? qaBlock(
        genreLabel + ":",
        genreEntries.map(([g, c]) => `${g} (${c})`).join(", ")
      )
      : "";

    resultsDiv.innerHTML = html;
  });
};
