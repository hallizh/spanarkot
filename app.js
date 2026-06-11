// Spánarkot — dagskipulag fyrir Los Dolses, Torrevieja
// Veðurgögn: Open-Meteo (engir lyklar, ókeypis)

const LAT = 37.92; // Los Dolses / Orihuela Costa (námunduð staðsetning)
const LON = -0.75;
const SEA_LAT = 37.9; // punktur úti á sjó fyrir sjávarhita
const SEA_LON = -0.6;
const DEPARTURE = "2026-07-02";
const TZ = "Europe/Madrid";

const WEEKDAYS = [
  "sunnudagur", "mánudagur", "þriðjudagur", "miðvikudagur",
  "fimmtudagur", "föstudagur", "laugardagur",
];
const MONTHS = [
  "janúar", "febrúar", "mars", "apríl", "maí", "júní",
  "júlí", "ágúst", "september", "október", "nóvember", "desember",
];

const WEATHER_CODES = {
  0: { emoji: "☀️", text: "Heiðskírt" },
  1: { emoji: "🌤️", text: "Léttskýjað" },
  2: { emoji: "⛅", text: "Hálfskýjað" },
  3: { emoji: "☁️", text: "Skýjað" },
  45: { emoji: "🌫️", text: "Þoka" },
  48: { emoji: "🌫️", text: "Þoka" },
  51: { emoji: "🌦️", text: "Súld" },
  53: { emoji: "🌦️", text: "Súld" },
  55: { emoji: "🌦️", text: "Súld" },
  61: { emoji: "🌧️", text: "Rigning" },
  63: { emoji: "🌧️", text: "Rigning" },
  65: { emoji: "🌧️", text: "Úrhelli" },
  80: { emoji: "🌦️", text: "Skúrir" },
  81: { emoji: "🌦️", text: "Skúrir" },
  82: { emoji: "🌧️", text: "Hellidemba" },
  95: { emoji: "⛈️", text: "Þrumuveður" },
  96: { emoji: "⛈️", text: "Þrumuveður" },
  99: { emoji: "⛈️", text: "Þrumuveður" },
};

const RAINY_CODES = new Set([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99]);

// ---------- Dagsetningar ----------

function todayInMadrid() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

function dateRange(fromISO, toISO) {
  const dates = [];
  const d = new Date(fromISO + "T12:00:00Z");
  const end = new Date(toISO + "T12:00:00Z");
  while (d <= end) {
    dates.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return dates;
}

function weekdayOf(iso) {
  return new Date(iso + "T12:00:00Z").getUTCDay();
}

function formatDate(iso) {
  const d = new Date(iso + "T12:00:00Z");
  return `${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]}`;
}

// ---------- Veðurgögn ----------

async function fetchJSON(url, tries = 3) {
  let delay = 600;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (err) {
      if (i === tries - 1) throw err;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

async function fetchForecast() {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,` +
    `precipitation_probability_max,wind_speed_10m_max` +
    `&timezone=${encodeURIComponent(TZ)}&forecast_days=16`;
  const data = await fetchJSON(url);
  if (!data || !data.daily || !Array.isArray(data.daily.time)) {
    throw new Error("forecast: óvænt svar");
  }
  const byDate = {};
  data.daily.time.forEach((date, i) => {
    byDate[date] = {
      code: data.daily.weather_code[i],
      tempMax: data.daily.temperature_2m_max[i],
      tempMin: data.daily.temperature_2m_min[i],
      uv: data.daily.uv_index_max[i],
      precip: data.daily.precipitation_probability_max[i],
      wind: data.daily.wind_speed_10m_max[i],
    };
  });
  return byDate;
}

async function fetchMarine() {
  const url =
    `https://marine-api.open-meteo.com/v1/marine?latitude=${SEA_LAT}&longitude=${SEA_LON}` +
    `&hourly=sea_surface_temperature,wave_height&timezone=${encodeURIComponent(TZ)}&forecast_days=10`;
  const data = await fetchJSON(url);
  if (!data || !data.hourly || !Array.isArray(data.hourly.time)) {
    throw new Error("marine: óvænt svar");
  }
  const byDate = {};
  data.hourly.time.forEach((t, i) => {
    if (t.endsWith("T14:00")) {
      byDate[t.slice(0, 10)] = {
        sea: data.hourly.sea_surface_temperature[i],
        wave: data.hourly.wave_height[i],
      };
    }
  });
  return byDate;
}

// Síðasta vel heppnaða spá geymd í vafranum svo bilun sýni alvöru gögn, ekki ágiskun
const CACHE_KEY = "spanarkot-data-v1";
const CACHE_TTL = 24 * 60 * 60 * 1000;

function saveCache(forecast, marine) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), forecast, marine }));
  } catch (e) { /* full eða læst geymsla — sleppum */ }
}

function loadCache() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (c && c.forecast && Date.now() - c.ts < CACHE_TTL) return c;
  } catch (e) { /* skemmd geymsla */ }
  return null;
}

// ---------- UV ----------

// ---------- Sjólag ----------
// Ölduhæð metin með börnin í huga

function waveInfo(wave) {
  if (wave == null) return null;
  const m = wave.toFixed(1).replace(".", ",");
  if (wave < 0.3) return { label: `〰️ Sléttur sjór · ${m} m`, cls: "wave-calm", kids: "great" };
  if (wave < 0.7) return { label: `🌊 Smá öldur · ${m} m`, cls: "wave-ok", kids: "ok" };
  if (wave < 1.2) return { label: `🌊 Öldugangur · ${m} m`, cls: "wave-rough", kids: "caution" };
  return { label: `🌊 Stórar öldur · ${m} m`, cls: "wave-big", kids: "bad" };
}

function uvInfo(uv) {
  if (uv == null) return { label: "—", cls: "uv-mid" };
  if (uv < 3) return { label: `UV ${Math.round(uv)} · Lágt`, cls: "uv-low" };
  if (uv < 6) return { label: `UV ${Math.round(uv)} · Miðlungs`, cls: "uv-mid" };
  if (uv < 8) return { label: `UV ${Math.round(uv)} · Hátt`, cls: "uv-high" };
  return { label: `UV ${Math.round(uv)} · Mjög hátt`, cls: "uv-extreme" };
}

// ---------- Hugmyndavél ----------
// Velur aðaltillögu og tvær til vara fyrir hvern dag, án endurtekninga
// á meðan hugmyndir endast, og tekur tillit til veðurs og vikudaga.

function buildSuggestions(days) {
  const rotation = ["beach", "relax", "trip", "food"];
  const counters = { beach: 0, relax: 0, trip: 0, food: 0, indoor: 0 };
  const marketUsed = { 5: false, 6: false };

  function take(category, weather) {
    const pool = SUGGESTIONS[category];
    for (let tries = 0; tries < pool.length; tries++) {
      const item = pool[counters[category] % pool.length];
      counters[category]++;
      if (item.noWind && weather && weather.wind >= 35) continue;
      return item;
    }
    return pool[0];
  }

  return days.map((day, i) => {
    const w = day.weather;
    const weekday = weekdayOf(day.date);
    const rainy = w && (RAINY_CODES.has(w.code) || (w.precip != null && w.precip >= 50));

    let main;
    if (day.isDeparture) {
      main = {
        emoji: "🛫",
        title: "Brottfarardagur",
        desc: "Síðasti dagurinn — pakkið rólega, eitt síðasta sund og kveðjuhringur um hverfið. Góða heimferð!",
      };
      return { main, alternates: [] };
    }

    // Stórar öldur: sleppum ströndinni sem aðaltillögu, börnin fá sundlaug í staðinn
    const roughSea = day.wave != null && day.wave >= 0.7;
    let category = rotation[i % rotation.length];
    if (roughSea && category === "beach") category = "relax";

    if (rainy) {
      main = take("indoor", w);
    } else if (MARKETS[weekday] && !marketUsed[weekday]) {
      main = MARKETS[weekday];
      marketUsed[weekday] = true;
    } else {
      main = take(category, w);
    }

    const altCategories = rotation.filter(
      (c) => c !== rotation[i % rotation.length]
    );
    const alternates = [
      take(altCategories[i % altCategories.length], w),
      take(altCategories[(i + 1) % altCategories.length], w),
    ];
    if (MARKETS[weekday] && main !== MARKETS[weekday]) {
      alternates[0] = MARKETS[weekday];
    }

    return { main, alternates };
  });
}

// ---------- Ábendingar dagsins ----------

function dayTips(w, wave) {
  if (!w) return [];
  const tips = [];
  if (w.uv >= 8) tips.push("☀️ Mjög sterk sól — sólarvörn 50 og skuggi kl. 13–16.");
  else if (w.uv >= 6) tips.push("🧴 Sterk sól — munið sólarvörnina.");
  if (w.precip >= 40) tips.push("🌧️ Gæti rignt — gott að hafa plan B innandyra.");
  if (w.tempMax >= 33) tips.push("🥵 Mjög heitt — drekkið vel af vatni.");
  const wi = waveInfo(wave);
  if (wi) {
    if (wi.kids === "bad") tips.push("🚫 Stórar öldur — sjórinn er ekki fyrir börnin í dag, sundlaugin er planið.");
    else if (wi.kids === "caution") tips.push("⚠️ Öldugangur — fylgist vel með börnunum í sjónum, eða veljið laugina.");
    else if (wi.kids === "great" && !RAINY_CODES.has(w.code)) tips.push("🏖️ Sléttur sjór — fullkominn dagur fyrir börnin á ströndinni!");
  } else if (w.wind >= 30) {
    tips.push("💨 Hvasst í dag — sjórinn gæti verið úfinn.");
  }
  return tips;
}

// ---------- Birting ----------

function suggestionHTML(s, isAlt) {
  if (isAlt) {
    return `<div class="alt-item">
      <span class="s-emoji">${s.emoji}</span>
      <div><h4>${s.title}</h4><p>${s.desc}</p></div>
    </div>`;
  }
  return `<div class="suggestion">
    <span class="s-emoji">${s.emoji}</span>
    <div><h3>${s.title}</h3><p>${s.desc}</p></div>
  </div>`;
}

function renderDay(day, suggestion) {
  const w = day.weather;
  const wc = w ? WEATHER_CODES[w.code] || WEATHER_CODES[1] : null;
  const uv = w ? uvInfo(w.uv) : null;
  const wave = waveInfo(day.wave);
  const approx = day.approximate ? " approx" : "";
  const tips = day.approximate ? [] : dayTips(w, day.wave);

  const classes = ["day-card"];
  if (day.isToday) classes.push("today");
  if (day.isDeparture) classes.push("departure");

  let weatherBlock = "";
  if (w) {
    weatherBlock = `
      <div class="weather-main">
        <span class="weather-emoji">${wc.emoji}</span>
        <div class="weather-temps">
          <span class="temp-max">${Math.round(w.tempMax)}°</span>
          <span class="temp-min">nótt ${Math.round(w.tempMin)}°</span>
        </div>
        <span class="weather-desc">${wc.text}</span>
      </div>
      <div class="meta-row">
        <span class="meta ${uv.cls}${approx}">${uv.label}</span>
        ${day.sea != null ? `<span class="meta${approx}">🌡️ Sjór ${Math.round(day.sea)}°C</span>` : ""}
        ${wave ? `<span class="meta ${wave.cls}${approx}">${wave.label}</span>` : ""}
        <span class="meta${approx}">💨 ${Math.round(w.wind)} km/klst</span>
        <span class="meta${approx}">☔ ${Math.round(w.precip)}%</span>
      </div>
      ${day.approximate ? `<p class="forecast-note">Spá nær ekki svona langt enn — dæmigert veður fyrir árstímann sýnt.</p>` : ""}
    `;
  }

  const tipsBlock = tips.length
    ? `<div class="tip">${tips.join("<br>")}</div>`
    : "";

  const altBlock = suggestion.alternates.length
    ? `<details class="alternates">
        <summary>Fleiri hugmyndir</summary>
        ${suggestion.alternates.map((a) => suggestionHTML(a, true)).join("")}
      </details>`
    : "";

  return `<article class="${classes.join(" ")}">
    ${day.isToday ? `<span class="today-badge">Í DAG</span>` : ""}
    <div class="day-head">
      <span class="day-name">${WEEKDAYS[weekdayOf(day.date)]}</span>
      <span class="day-date">${formatDate(day.date)}</span>
    </div>
    ${weatherBlock}
    ${tipsBlock}
    ${suggestionHTML(suggestion.main, false)}
    ${altBlock}
  </article>`;
}

// ---------- Keyrsla ----------

async function init() {
  const status = document.getElementById("status");
  const grid = document.getElementById("days");
  const today = todayInMadrid();

  if (today > DEPARTURE) {
    status.textContent = "Fríið er búið — takk fyrir samveruna! 🇮🇸";
    return;
  }

  const dates = dateRange(today, DEPARTURE);

  // Dagateljari í haus
  const daysLeft = dates.length - 1;
  document.getElementById("chip-days").textContent =
    daysLeft === 1 ? "⏳ 1 dagur eftir" : `⏳ ${daysLeft} dagar eftir`;

  let forecast = {};
  let marine = {};
  let source = "live";
  let marineFailed = false;
  let cacheTime = null;

  try {
    forecast = await fetchForecast();
    try {
      marine = await fetchMarine();
    } catch (err) {
      marineFailed = true;
    }
    if (!marineFailed) saveCache(forecast, marine);
  } catch (err) {
    const cached = loadCache();
    if (cached) {
      forecast = cached.forecast;
      marine = cached.marine || {};
      source = "cache";
      cacheTime = cached.ts;
    } else {
      source = "none";
    }
  }

  let lastSea = null;
  const days = dates.map((date) => {
    const real = forecast[date];
    const m = marine[date];
    if (m && m.sea != null) lastSea = m.sea;
    return {
      date,
      weather: real || { ...TYPICAL },
      approximate: !real,
      // Sjávarhiti: alvöru gögn eða síðasta þekkta gildi — aldrei ágiskun nema á fjarlægum dögum
      sea: m && m.sea != null ? m.sea : lastSea != null ? lastSea : real ? null : TYPICAL.sea,
      wave: m ? m.wave : null, // engin öldu-ágiskun út fyrir spána
      isToday: date === today,
      isDeparture: date === DEPARTURE,
    };
  });

  // Sjórinn í dag í haus: hiti + sjólag
  const todayDay = days[0];
  const wi = waveInfo(todayDay.wave);
  document.getElementById("chip-sea").textContent =
    todayDay.sea != null
      ? `🌊 Sjórinn í dag: ${Math.round(todayDay.sea)}°C` +
        (wi ? ` · öldur ${todayDay.wave.toFixed(1).replace(".", ",")} m` : "")
      : "🌊 Sjór: engin gögn";

  const suggestions = buildSuggestions(days);
  grid.innerHTML = days.map((d, i) => renderDay(d, suggestions[i])).join("");

  status.classList.remove("error");
  if (source === "none") {
    status.classList.add("error");
    status.innerHTML =
      "Ekki náðist í veðurþjónustuna — sýni dæmigert veður fyrir árstímann. " +
      '<button class="retry-btn" id="retry">Reyna aftur</button>';
  } else if (source === "cache") {
    const t = new Date(cacheTime);
    const hhmm = `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
    status.innerHTML =
      `Náði ekki í nýja spá — sýni síðustu spá (sótt kl. ${hhmm}). ` +
      '<button class="retry-btn" id="retry">Reyna aftur</button>';
  } else if (marineFailed) {
    status.innerHTML =
      "Sjávargögn bárust ekki — öldur og sjávarhiti birtast ekki í bili. " +
      '<button class="retry-btn" id="retry">Reyna aftur</button>';
  } else {
    status.classList.add("hidden");
  }

  const retry = document.getElementById("retry");
  if (retry) {
    retry.addEventListener("click", () => {
      status.classList.remove("hidden", "error");
      status.textContent = "Sæki veðurspá fyrir Los Dolses…";
      grid.innerHTML = "";
      init();
    });
  }
}

init();
