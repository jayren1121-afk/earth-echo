const state = {
  lang: "zh",
  variable: "temp",
  year: 2025,
  mapMode: "trend",
  rankOrder: "desc",
  ui: null,
  playingYear: false,
  place: null,
  chartMode: "trend",
  data: null,
  land: null,
  eonet: null,
  eonetLive: null,
  giovanni: null,
  extra: null,
  nex: null,
  tourTopics: [],
  events: [],
  eventsSource: "fallback",
  map: null,
  narrator: new Narrator(),
  yearTimer: null,
  lastNarratedLatLon: null,
  watchId: null,
  liveFetchId: 0,
};
window.__echoState = state;


async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(path + " " + res.status);
  return res.json();
}


function mergeAnnual(base, year, field, value) {
  let row = base.find((r) => r.year === year);
  if (!row) {
    row = { year };
    base.push(row);
  }
  row[field] = value;
}

function applyOfficialDataToCities() {
  const g = state.giovanni;
  const nex = state.nex;
  if (!state.data?.cities) return;
  for (const city of state.data.cities) {
    if (!city.temp_power) city.temp_power = city.temp;
    if (!city.precip_power) city.precip_power = city.precip;
    if (!city.annual_power) {
      city.annual_power = (city.annual || []).map((r) => ({ year: r.year, t2m: r.t2m, precip_mm: r.precip_mm }));
    }
    const rec = g && g.cities && g.cities[city.id];
    const annual = (city.annual || []).map((r) => ({ ...r }));
    if (rec?.merra2_t2m?.trend && rec.merra2_t2m.annual?.length) {
      city.temp = rec.merra2_t2m.trend;
      city.everyday_temp = rec.merra2_t2m.everyday;
      city.temp_source = "giovanni_merra2";
      for (const row of rec.merra2_t2m.annual) mergeAnnual(annual, row.year, "t2m", row.value);
    }
    if (rec?.imerg_precip?.trend && rec.imerg_precip.annual?.length) {
      city.precip = rec.imerg_precip.trend;
      city.everyday_precip = rec.imerg_precip.everyday;
      city.precip_source = "giovanni_imerg";
      for (const row of rec.imerg_precip.annual) mergeAnnual(annual, row.year, "precip_mm", row.value);
    }
    if (rec?.gldas_soil?.annual?.length && rec.gldas_soil.trend) {
      city.soil = rec.gldas_soil.trend;
      city.everyday_soil = rec.gldas_soil.everyday;
      city.soil_source = "giovanni_gldas";
      for (const row of rec.gldas_soil.annual) mergeAnnual(annual, row.year, "soil", row.value);
    }
    annual.sort((a, b) => a.year - b.year);
    city.annual = annual;
    if (nex?.cities && nex.cities[city.id]) city.nex = nex.cities[city.id];
  }
  const caps = state.data.cities
    .filter((c) => c.capital && c.temp?.sen_slope_per_decade != null)
    .sort((a, b) => b.temp.sen_slope_per_decade - a.temp.sen_slope_per_decade);
  caps.forEach((c, i) => {
    c.temp_rank_among_capitals = i + 1;
    c.temp_rank_n = caps.length;
  });
}


function applyExtraDataToCities() {
  const extra = state.extra;
  if (!extra?.cities || !state.data?.cities) return;
  for (const city of state.data.cities) {
    const rec = extra.cities[city.id];
    if (!rec) continue;
    const annual = (city.annual || []).map((r) => ({ ...r }));
    if (rec.humidity_qv_power?.trend) city.humidity_power = rec.humidity_qv_power.trend;
    if (rec.humidity_qv_power?.annual?.length) {
      for (const row of rec.humidity_qv_power.annual) mergeAnnual(annual, row.year, "qv2m_power", row.value);
    }
    if (rec.humidity_qv?.annual?.length) {
      city.humidity = rec.humidity_qv.trend;
      city.everyday_humidity = rec.humidity_qv.everyday;
      city.humidity_source = rec.humidity_qv_source === "power" ? "power_qv" : "giovanni_merra2_qv";
      for (const row of rec.humidity_qv.annual) mergeAnnual(annual, row.year, "qv2m", row.value);
    }
    if (rec.humidity_rh?.annual?.length) {
      city.rh = rec.humidity_rh.trend;
      city.everyday_rh = rec.humidity_rh.everyday;
      city.rh_source = "power_rh";
      for (const row of rec.humidity_rh.annual) mergeAnnual(annual, row.year, "rh2m", row.value);
    }
    if (rec.radiation?.annual?.length) {
      city.radiation = rec.radiation.trend;
      city.everyday_radiation = rec.radiation.everyday;
      city.radiation_source = "power_sw";
      for (const row of rec.radiation.annual) mergeAnnual(annual, row.year, "sw", row.value);
    }
    if (rec.gldas_gws?.annual?.length && rec.gldas_gws.trend) {
      city.groundwater = rec.gldas_gws.trend;
      city.everyday_groundwater = rec.gldas_gws.everyday;
      city.groundwater_source = "giovanni_gldas_gws";
      for (const row of rec.gldas_gws.annual) mergeAnnual(annual, row.year, "gws", row.value);
    }
    if (rec.oco2_xco2?.annual?.length) {
      city.co2 = rec.oco2_xco2.trend;
      city.co2_source = "giovanni_oco2";
      city.co2_short_record = !!(rec.oco2_xco2.trend && rec.oco2_xco2.trend.short_record);
      for (const row of rec.oco2_xco2.annual) mergeAnnual(annual, row.year, "xco2", row.value);
    }
    annual.sort((a, b) => a.year - b.year);
    city.annual = annual;
  }
}

function isLocalPoint(place) {
  return !!(place && place.type === "point");
}

function formatPointLabel(lat, lon) {
  if (lat == null || lon == null) return "";
  return `${Number(lat).toFixed(2)}°, ${Number(lon).toFixed(2)}°`;
}

function applyLivePower(place, live) {
  if (!place || !live) return false;
  place.annual = live.annual || [];
  place.temp = live.temp || null;
  place.precip = live.precip || null;
  place.humidity = live.humidity || null;
  place.rh = live.rh || null;
  place.radiation = live.radiation || null;
  place.temp_source = live.temp ? "power" : undefined;
  place.precip_source = live.precip ? "power" : undefined;
  place.humidity_source = live.humidity ? "power_qv" : undefined;
  place.rh_source = live.rh ? "power_rh" : undefined;
  place.radiation_source = live.radiation ? "power_sw" : undefined;
  place.soil = null;
  place.groundwater = null;
  place.co2 = null;
  place.nex = null;
  place.temp_power = null;
  place.precip_power = null;
  place.humidity_power = null;
  place.city = null;
  place.live = !!(live.temp || live.precip || live.humidity || live.radiation);
  return place.live;
}

function syncVariableOptions() {
  const sel = document.getElementById("variable");
  const place = state.place;
  if (!sel || !place) return;
  const local = isLocalPoint(place);
  for (const opt of sel.options) {
    const available = hasTrendData(trendOf(place, opt.value));
    opt.hidden = local && !available;
  }
  if (local && !hasTrendData(trendOf(place, state.variable))) {
    const first = TOUR_TOPIC_ORDER.find((id) => id !== "events" && hasTrendData(trendOf(place, id)));
    if (first) {
      state.variable = first;
      sel.value = first;
    }
  } else if (sel.value !== state.variable) {
    sel.value = state.variable;
  }
}

function refreshModeUI() {
  const place = state.place;
  const badge = document.getElementById("mode-badge");
  const local = isLocalPoint(place);
  if (badge) {
    if (!place) {
      badge.hidden = true;
    } else {
      badge.hidden = false;
      badge.classList.toggle("tour", local);
      badge.classList.toggle("capital", !local);
      badge.textContent = t(state.lang, local ? "mode_tour" : "mode_capital");
      badge.title = t(state.lang, local ? "mode_tour_hint" : "mode_capital_hint");
    }
  }
  const rankingCard = document.getElementById("ranking-card");
  if (rankingCard) rankingCard.hidden = false;
  document.querySelectorAll('#chart-tabs button[data-chart="ranking"]').forEach((b) => {
    b.hidden = isMobileUI();
  });
  if (isMobileUI() && state.chartMode === "ranking") state.chartMode = "trend";
}

async function loadPointPlace(lat, lon, { fromGeo = false, speak = false } = {}) {
  const id = ++state.liveFetchId;
  const place = {
    type: "point",
    fromGeo: !!fromGeo,
    lat,
    lon,
    label: formatPointLabel(lat, lon),
    live: false,
    loading: true,
  };
  if (state.narrator) state.narrator.stop();
  setPlace(place, { speak: false, fetchEvents: true });
  try {
    const live = await fetchPowerPoint(lat, lon);
    if (id !== state.liveFetchId) return;
    place.loading = false;
    if (!applyLivePower(place, live)) place.liveError = true;
    refreshView();
    if (speak) startTour();
  } catch (err) {
    if (id !== state.liveFetchId) return;
    place.loading = false;
    place.liveError = true;
    refreshView();
    if (speak) startTour();
  }
}

function attachOfficialSeries(place, { keepObserved = false } = {}) {
  if (isLocalPoint(place)) return;
  const city = place.city;
  if (!city) return;
  if (!keepObserved) {
    place.temp = city.temp;
    place.precip = city.precip;
    place.annual = city.annual;
    place.temp_source = city.temp_source || "power";
    place.precip_source = city.precip_source || "power";
    place.everyday_temp = city.everyday_temp;
    place.everyday_precip = city.everyday_precip;
    place.temp_power = city.temp_power;
    place.precip_power = city.precip_power;
    place.annual_power = city.annual_power;
    place.humidity_power = city.humidity_power;
  } else {
    place.temp_source = place.temp_source || "power";
    place.precip_source = place.precip_source || "power";
    if (city.temp_power) place.temp_power = city.temp_power;
    if (city.precip_power) place.precip_power = city.precip_power;
    if (city.annual_power) place.annual_power = city.annual_power;
    if (city.humidity_power) place.humidity_power = city.humidity_power;
  }
  place.soil = city.soil;
  place.everyday_soil = city.everyday_soil;
  place.soil_source = city.soil_source;
  place.humidity = city.humidity;
  place.everyday_humidity = city.everyday_humidity;
  place.humidity_source = city.humidity_source;
  place.rh = city.rh;
  place.everyday_rh = city.everyday_rh;
  place.rh_source = city.rh_source;
  place.groundwater = city.groundwater;
  place.everyday_groundwater = city.everyday_groundwater;
  place.groundwater_source = city.groundwater_source;
  place.radiation = city.radiation;
  place.everyday_radiation = city.everyday_radiation;
  place.radiation_source = city.radiation_source;
  place.co2 = city.co2;
  place.co2_source = city.co2_source;
  place.co2_short_record = city.co2_short_record;
  place.nex = city.nex || (state.nex && state.nex.cities && state.nex.cities[city.id]) || null;
  if (keepObserved && city.annual) {
    const extraKeys = ["soil", "qv2m", "rh2m", "gws", "sw", "xco2"];
    const byYear = new Map((place.annual || []).map((r) => [r.year, { ...r }]));
    for (const row of city.annual) {
      const cur = byYear.get(row.year) || { year: row.year };
      for (const k of extraKeys) {
        if (row[k] != null) cur[k] = row[k];
      }
      byYear.set(row.year, cur);
    }
    place.annual = [...byYear.values()].sort((a, b) => a.year - b.year);
  }
}

function tourIsActive() {
  return !!(state.narrator && (state.narrator.speaking || state.narrator.waitingForNext));
}

function refreshSoWhat() {
  const place = state.place;
  if (!place) return;
  const localOnly = tourIsActive();
  const cards = buildSoWhat(place, state.variable, state.lang, localOnly ? null : state.data.global.temp, { localOnly });
  for (const key of ["finding", "meaning", "tip", "outlook"]) {
    const body = document.getElementById(`sowhat-${key}`);
    const detail = document.getElementById(`sowhat-${key}-details`);
    const sourceEl = document.getElementById(`sowhat-${key}-source`);
    const wrap = detail && detail.closest("details");
    const part = cards[key] || {};
    const article = document.querySelector(`.sowhat-part[data-part="${key}"]`);
    if (body) body.textContent = part.text || "";
    if (sourceEl) {
      sourceEl.textContent = part.source || "";
      sourceEl.hidden = !part.source;
    }
    if (detail) detail.textContent = part.details || "";
    if (wrap) wrap.hidden = !part.details;
    if (article) article.hidden = !part.text;
  }
}

function applyNexToCities() {
  if (!state.nex?.cities || !state.data?.cities) return;
  for (const city of state.data.cities) {
    if (state.nex.cities[city.id]) city.nex = state.nex.cities[city.id];
  }
}

function nexIsComplete(nex) {
  if (!nex?.cities || !state.data?.cities) return false;
  const want = state.data.cities.map((c) => c.id);
  return want.every((id) => {
    const rec = nex.cities[id];
    return rec?.temp?.ssp245?.length && rec?.temp?.ssp585?.length && rec?.precip?.ssp245?.length && rec?.precip?.ssp585?.length;
  });
}

function nexFingerprint(nex) {
  if (!nex?.cities) return "";
  const ids = Object.keys(nex.cities).sort();
  return ids.map((id) => {
    const rec = nex.cities[id];
    const t = rec?.temp;
    const p = rec?.precip;
    return [id, t?.ssp245?.length || 0, t?.ssp585?.length || 0, p?.ssp245?.length || 0, p?.ssp585?.length || 0, t?.ssp245?.slice(-1)[0]?.mean, p?.ssp245?.slice(-1)[0]?.mean].join(":");
  }).join("|") + `#${ids.length}`;
}

function startNexWatch() {
  if (state.nexWatchStarted) return;
  state.nexWatchStarted = true;
  let last = nexFingerprint(state.nex);
  const tick = async () => {
    try {
      const nex = await loadJSON("data/nex_cmip6.json?ts=" + Date.now());
      const fp = nexFingerprint(nex);
      if (nex?.cities && fp && fp !== last) {
        last = fp;
        state.nex = nex;
        applyNexToCities();
        if (state.place) {
          attachOfficialSeries(state.place, { keepObserved: !!state.place.live });
          refreshSoWhat();
          refreshCharts();
        }
      }
      if (nexIsComplete(nex)) return;
    } catch (err) {
      // file may not exist yet
    }
    state.nexPollTimer = setTimeout(tick, 15000);
  };
  state.nexPollTimer = setTimeout(tick, 4000);
}

function highlightSoWhat(partId) {
  document.querySelectorAll(".sowhat-part").forEach((el) => {
    el.classList.toggle("active", el.dataset.part === partId);
  });
}

async function boot() {
  const saved = localStorage.getItem("earth-echo-lang");
  if (saved === "en" || saved === "zh") state.lang = saved;
  applyStaticI18n(state.lang);
  document.getElementById("lang-zh").classList.toggle("active", state.lang === "zh");
  document.getElementById("lang-en").classList.toggle("active", state.lang === "en");

  const [capitals, land, eonet, giovanni, nex, extra] = await Promise.all([
    loadJSON("data/capitals.json"),
    loadJSON("data/land.json"),
    loadJSON("data/eonet_fallback.json"),
    loadJSON("data/giovanni.json").catch(() => null),
    loadJSON("data/nex_cmip6.json").catch(() => null),
    loadJSON("data/extra.json").catch(() => null),
  ]);
  state.data = capitals;
  state.land = land;
  state.eonet = eonet;
  state.giovanni = giovanni;
  state.nex = nex;
  state.extra = extra;
  applyOfficialDataToCities();
  applyExtraDataToCities();

  applyUIMode();

  state.map = new EchoMap(document.getElementById("map"), document.getElementById("map-tooltip"));
  state.map.setData({ land, cities: capitals.cities });
  state.map.onPick = (sel) => onPick(sel);
  state.map.resize();

  const taipei = capitals.cities.find((c) => c.id === "taipei");
  setPlace({ type: "city", city: taipei, lat: taipei.lat, lon: taipei.lon }, { speak: false, fetchEvents: true });

  bindUI();
  maybeShowMobileStart();
  tryLiveEonet();
  startNexWatch();
}

function bindUI() {
  document.getElementById("lang-zh").onclick = () => setLang("zh");
  document.getElementById("lang-en").onclick = () => setLang("en");
  bindTourQr();
  document.getElementById("variable").onchange = (e) => {
    state.variable = e.target.value;
    refreshView();
  };
  document.getElementById("map-mode-trend").onclick = () => setMapMode("trend");
  document.getElementById("map-mode-year").onclick = () => setMapMode("year");
  document.getElementById("year-slider").oninput = (e) => {
    state.year = +e.target.value;
    if (state.mapMode !== "year") setMapMode("year");
    else {
      stopYearPlay();
      refreshYear();
      refreshCharts();
    }
  };
  const sortBtn = document.getElementById("rank-sort");
  if (sortBtn) {
    sortBtn.onclick = () => {
      state.rankOrder = state.rankOrder === "desc" ? "asc" : "desc";
      refreshCharts();
    };
  }
  document.getElementById("play-year").onclick = toggleYearPlay;
  document.getElementById("voice-btn").onclick = () => startTour();
  document.getElementById("voice-pause").onclick = togglePause;
  document.getElementById("start-tour").onclick = () => beginMobileTour(true);
  document.getElementById("tour-next").onclick = () => {
    setTourPrompt("");
    state.narrator.nextTopic();
    const pauseBtn = document.getElementById("voice-pause");
    pauseBtn.classList.remove("hidden");
    document.getElementById("tour-next").classList.add("hidden");
  };
  document.getElementById("tour-chips").addEventListener("click", (e) => {
    const chip = e.target.closest("[data-topic]");
    if (!chip) return;
    setTourPrompt("");
    state.narrator.jumpTo(chip.dataset.topic);
    document.getElementById("voice-pause").classList.remove("hidden");
    document.getElementById("tour-next").classList.add("hidden");
  });

  document.querySelectorAll(".demo-btn").forEach((btn) => {
    btn.onclick = () => {
      const city = state.data.cities.find((c) => c.id === btn.dataset.city);
      hideMobileStart();
      setPlace({ type: "city", city, lat: city.lat, lon: city.lon, demo: true }, { speak: true, fetchEvents: true });
    };
  });
  document.querySelectorAll("#chart-tabs button").forEach((btn) => {
    btn.onclick = () => {
      state.chartMode = btn.dataset.chart;
      refreshCharts();
    };
  });
  document.getElementById("ranking").addEventListener("click", (e) => {
    const row = e.target.closest("[data-id]");
    if (!row) return;
    const city = state.data.cities.find((c) => c.id === row.dataset.id);
    if (city) setPlace({ type: "city", city, lat: city.lat, lon: city.lon }, { speak: false, fetchEvents: true });
  });
  window.addEventListener("resize", () => {
    applyUIMode();
    if (state.map) state.map.resize();
    refreshCharts();
  });
  window.matchMedia("(pointer: coarse)").addEventListener("change", () => applyUIMode());
}

function uiOverride() {
  const q = new URLSearchParams(location.search);
  if (q.get("desktop") === "1") return "desktop";
  if (q.get("mobile") === "1") return "mobile";
  return null;
}

function detectUI() {
  const ov = uiOverride();
  if (ov) return ov;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return (window.innerWidth <= 768 || coarse) ? "mobile" : "desktop";
}

function isMobileUI() {
  return (state.ui || document.documentElement.getAttribute("data-ui")) === "mobile";
}

function applyUIMode() {
  const ui = detectUI();
  const prev = state.ui || document.documentElement.getAttribute("data-ui");
  document.documentElement.setAttribute("data-ui", ui);
  state.ui = ui;
  const qr = document.getElementById("tour-qr");
  if (qr) qr.hidden = ui !== "desktop";
  if (ui === "desktop") {
    const start = document.getElementById("mobile-start");
    if (start) start.hidden = true;
    const box = document.getElementById("subtitles");
    if (box) box.hidden = true;
    hideTourUI();
    setTourPrompt("");
    if (state.narrator && (state.narrator.speaking || state.narrator.waitingForNext)) {
      state.narrator.stop();
    }
    const btn = document.getElementById("voice-btn");
    const pauseBtn = document.getElementById("voice-pause");
    const nextBtn = document.getElementById("tour-next");
    if (btn) btn.classList.remove("playing");
    if (pauseBtn) pauseBtn.classList.add("hidden");
    if (nextBtn) nextBtn.classList.add("hidden");
  } else if (prev !== "mobile") {
    maybeShowMobileStart();
  } else {
    maybeShowMobileStart();
  }
}

function isMobile() {
  return isMobileUI();
}

function maybeShowMobileStart() {
  const el = document.getElementById("mobile-start");
  if (isMobileUI() && !el.dataset.dismissed) el.hidden = false;
  else el.hidden = true;
}

function hideMobileStart() {
  const el = document.getElementById("mobile-start");
  el.hidden = true;
  el.dataset.dismissed = "1";
}


function bindTourQr() {
  const box = document.getElementById("tour-qr");
  const btn = document.getElementById("tour-qr-btn");
  if (!box || !btn) return;
  const setOpen = (open) => {
    box.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  };
  btn.addEventListener("click", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    setOpen(!box.classList.contains("is-open"));
  });
  document.addEventListener("click", (ev) => {
    if (!box.contains(ev.target)) setOpen(false);
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") setOpen(false);
  });
}

function setVoiceLangNote(missing) {
  const el = document.getElementById("voice-lang-note");
  if (!el) return;
  el.hidden = !missing;
}

window.setLang = function setLang(lang) {
  state.lang = lang;
  localStorage.setItem("earth-echo-lang", lang);
  applyStaticI18n(lang);
  document.getElementById("lang-zh").classList.toggle("active", lang === "zh");
  document.getElementById("lang-en").classList.toggle("active", lang === "en");
  if (state.tourTopics && state.tourTopics.length) {
    state.tourTopics.forEach((topic) => { topic.label = topicLabel(topic.id, lang); });
  }
  refreshView();
  const n = state.narrator;
  const tourActive = n && n.topics && n.topics.length && (n.speaking || n.paused || n.waitingForNext);
  if (tourActive && state.place) {
    const topics = buildTourTopics(state.place, lang, state.events);
    state.tourTopics = topics;
    if (typeof n.rebuildInLanguage === "function") n.rebuildInLanguage(lang, topics);
    else n.lang = lang;
  } else if (n) {
    n.lang = lang;
    if (typeof n._notifyEnglishVoice === "function") n._notifyEnglishVoice();
  }
  renderTourChips();
}

function setPlace(place, { speak = false, fetchEvents = true } = {}) {
  state.place = place;
  state.map.setSelected(place);
  if (!isLocalPoint(place)) {
    if (place.city && !place.temp) {
      place.temp = place.city.temp;
      place.precip = place.city.precip;
      place.annual = place.city.annual;
    }
    attachOfficialSeries(place);
  }
  if (fetchEvents) updateEvents(place.lat, place.lon);
  refreshView();
  if (speak) startTour();
}

async function onPick(sel) {
  if (sel.type === "city") {
    setPlace({ type: "city", city: sel.city, lat: sel.city.lat, lon: sel.city.lon }, { speak: false, fetchEvents: true });
    return;
  }
  await loadPointPlace(sel.lat, sel.lon, { fromGeo: false, speak: false });
}

function currentYearList() {
  if (!state.data?.cities) return [];
  return variableYears(state.data.cities, state.variable);
}

function syncYearSlider() {
  const years = currentYearList();
  const slider = document.getElementById("year-slider");
  if (!slider || !years.length) return;
  slider.min = years[0];
  slider.max = years[years.length - 1];
  slider.step = 1;
  if (!years.includes(state.year)) {
    const le = [...years].reverse().find((y) => y <= state.year);
    state.year = le != null ? le : years[years.length - 1];
  }
  slider.value = state.year;
}

function setMapMode(mode) {
  state.mapMode = mode === "year" ? "year" : "trend";
  if (state.mapMode === "trend") stopYearPlay();
  refreshView();
}

function syncMapModeUI() {
  const trendBtn = document.getElementById("map-mode-trend");
  const yearBtn = document.getElementById("map-mode-year");
  if (trendBtn) trendBtn.classList.toggle("active", state.mapMode === "trend");
  if (yearBtn) yearBtn.classList.toggle("active", state.mapMode === "year");
  const row = document.getElementById("slider-row");
  if (row) row.classList.toggle("is-trend", state.mapMode === "trend");
}

function refreshView() {
  applyStaticI18n(state.lang);
  refreshModeUI();
  syncVariableOptions();
  syncYearSlider();
  syncMapModeUI();
  const hintKey = "map_hint_" + (state.variable || "temp");
  const modeHint = t(state.lang, state.mapMode === "year" ? "map_hint_mode_year" : "map_hint_mode_trend");
  document.getElementById("map-hint").textContent = [t(state.lang, hintKey), modeHint].filter(Boolean).join(" ");
  if (state.map) {
    state.map.setVariable(state.variable);
    state.map.setMode(state.mapMode);
    state.map.setYear(state.year);
    state.map.drawLegend(document.getElementById("legend"), state.lang);
  }
  const srcFull = document.getElementById("map-source-full");
  if (srcFull && typeof mapLayerCitation === "function") {
    srcFull.textContent = mapLayerCitation(state.variable, state.lang);
  }
  const srcBase = document.getElementById("map-source-baseline");
  if (srcBase) {
    if (state.mapMode === "year") {
      srcBase.textContent = t(state.lang, "legend_baseline_note");
      srcBase.hidden = false;
    } else {
      srcBase.textContent = "";
      srcBase.hidden = true;
    }
  }
  refreshYear();
  refreshConclusion();
  refreshSoWhat();
  refreshCharts();
  refreshEvents();
  document.getElementById("sources").innerHTML = t(state.lang, "sources_html");
}

function refreshYear() {
  const label = document.getElementById("year-label");
  const note = document.getElementById("year-note");
  if (state.mapMode === "trend") {
    label.textContent = t(state.lang, "map_mode_trend");
    note.textContent = "";
  } else {
    label.textContent = state.year;
    note.textContent = "";
  }
  if (state.map) {
    state.map.setMode(state.mapMode);
    state.map.setYear(state.year);
    state.map.drawLegend(document.getElementById("legend"), state.lang);
  }
  const btn = document.getElementById("play-year");
  if (btn) btn.querySelector(".play-icon").textContent = state.playingYear ? "❚❚" : "▶";
}

function toggleYearPlay() {
  if (state.playingYear) stopYearPlay();
  else startYearPlay();
}

function startYearPlay() {
  const years = currentYearList();
  if (!years.length) return;
  if (state.mapMode !== "year") {
    state.mapMode = "year";
    syncMapModeUI();
  }
  state.playingYear = true;
  if (state.year >= years[years.length - 1]) state.year = years[0];
  document.getElementById("year-slider").value = state.year;
  refreshYear();
  refreshCharts();
  state.yearTimer = setInterval(() => {
    const list = currentYearList();
    const i = list.indexOf(state.year);
    if (i < 0 || i >= list.length - 1) {
      stopYearPlay();
      return;
    }
    state.year = list[i + 1];
    document.getElementById("year-slider").value = state.year;
    refreshYear();
    refreshCharts();
  }, 280);
}

function stopYearPlay() {
  state.playingYear = false;
  if (state.yearTimer) clearInterval(state.yearTimer);
  state.yearTimer = null;
  const icon = document.querySelector("#play-year .play-icon");
  if (icon) icon.textContent = "▶";
}

function conclusionLine(place, lang) {
  const spec = varSpec(state.variable);
  const tr = trendOf(place, state.variable);
  const name = (place.type === "city" && place.city)
    ? cityName(place.city, lang)
    : (place.label || t(lang, "this_point"));
  if (typeof sourcesDisagree === "function" && sourcesDisagree(place, state.variable)) {
    const colon = lang === "zh" ? "：" : ": ";
    const mid = lang === "zh" ? "兩筆 NASA 資料結果不一樣" : "the two NASA sources disagree";
    const badge = `<span class="badge unclear">${lang === "zh" ? "看不出來" : "unknown"}</span>`;
    return `${name}${colon}${mid} ${badge}`;
  }
  if (!tr || tr.sen_slope_per_decade == null) {
    const colon = lang === "zh" ? "：" : ": ";
    const mid = lang === "zh" ? "目前資料看不出來" : "the data do not show this";
    return `${name}${colon}${mid}`;
  }
  const dec = tr.sen_slope_per_decade;
  const abs = fmtDec(Math.abs(dec), spec.slopeDigits);
  let mid;
  if (state.variable === "precip") {
    mid = dec >= 0 ? t(lang, "per_decade_rain_up", abs) : t(lang, "per_decade_rain_down", abs);
  } else if (state.variable === "temp") {
    mid = dec >= 0 ? t(lang, "per_decade_warm", abs) : t(lang, "per_decade_cool", abs);
  } else if (lang === "zh") {
    mid = `每 10 年${dec >= 0 ? "增加" : "減少"} ${abs} ${spec.unit}`;
  } else {
    mid = `${dec >= 0 ? "+" : "−"}${abs} ${spec.unit} per decade`;
  }
  const conf = tr.confidence === "clear" ? t(lang, "clear") : t(lang, "unclear");
  const badge = `<span class="badge ${tr.confidence === "clear" ? "clear" : "unclear"}">${conf}</span>`;
  const colon = lang === "zh" ? "：" : ": ";
  return `${name}${colon}${mid} ${badge}`;
}

function refreshConclusion() {
  const place = state.place;
  if (!place) return;
  const el = document.getElementById("conclusion");
  if (place.loading) {
    el.textContent = t(state.lang, "loading_point");
  } else if (isLocalPoint(place) && place.liveError && !place.live) {
    el.textContent = t(state.lang, "no_point_data");
  } else {
    el.innerHTML = conclusionLine(place, state.lang);
  }
  let meta = "";
  if (isLocalPoint(place)) {
    if (place.live) meta = t(state.lang, "point_live_meta", place.lat.toFixed(2), place.lon.toFixed(2));
    else if (place.loading) meta = formatPointLabel(place.lat, place.lon);
    else meta = formatPointLabel(place.lat, place.lon);
    if (place.fromGeo) meta = t(state.lang, "your_location") + " · " + meta;
  } else if (place.city) {
    meta = `${countryName(place.city, state.lang)} · ${place.lat.toFixed(2)}°, ${place.lon.toFixed(2)}°`;
  }
  document.getElementById("place-meta").textContent = meta;
}

function refreshCharts() {
  const place = state.place;
  if (!place) return;
  const canvas = document.getElementById("chart");
  const title = document.getElementById("chart-title");
  const caption = document.getElementById("chart-caption");
  const mode = isMobile() && state.narrator.speaking ? state.chartMode : (isMobile() ? "trend" : state.chartMode);
  document.querySelectorAll("#chart-tabs button").forEach((b) => b.classList.toggle("active", b.dataset.chart === state.chartMode));
  const rankOpts = { mode: state.mapMode, year: state.year, order: state.rankOrder };
  const gSlope = state.variable === "temp" && state.mapMode !== "year" ? state.data.global.temp.sen_slope_per_decade : null;
  const rankTitle = document.getElementById("ranking-title");
  if (rankTitle) {
    rankTitle.textContent = state.mapMode === "year"
      ? t(state.lang, "ranking_title_year", state.year)
      : t(state.lang, "ranking_title");
  }
  const sortBtn = document.getElementById("rank-sort");
  if (sortBtn) sortBtn.textContent = t(state.lang, state.rankOrder === "asc" ? "rank_sort_asc" : "rank_sort_desc");
  if (mode === "ranking") {
    title.textContent = rankTitle ? rankTitle.textContent : t(state.lang, "ranking_title");
    drawRankingChart(canvas, state.data.cities, place.city && place.city.id, gSlope, state.lang, state.variable, rankOpts);
    const legend = document.getElementById("chart-legend");
    if (legend) { legend.innerHTML = ""; legend.hidden = true; }
    caption.hidden = false;
    const rankCite = (typeof rankingSourceCitation === "function") ? rankingSourceCitation(state.variable, state.lang) : "";
    const cap = state.mapMode === "year"
      ? t(state.lang, "rank_caption_year", rankingItems(state.data.cities, state.variable, rankOpts).length, state.year)
      : t(state.lang, "rank_caption", rankingItems(state.data.cities, state.variable, rankOpts).length);
    caption.textContent = [cap, rankCite].filter(Boolean).join(" ");
  } else {
    title.textContent = t(state.lang, "chart_trend");
    drawTrendChart(canvas, place, state.variable, state.lang);
    renderChartLegend(document.getElementById("chart-legend"), place, state.variable, state.lang);
    caption.hidden = false;
    caption.textContent = (typeof chartSourceCaption === "function")
      ? chartSourceCaption(place, state.variable, state.lang)
      : "";
  }
  renderRankingList(
    document.getElementById("ranking"),
    state.data.cities,
    place.city && place.city.id,
    gSlope,
    state.lang,
    state.variable,
    rankOpts
  );
}

function eventListFor(lat, lon) {
  const maxKm = 800;
  let pool = (state.eonetLive || state.eonet)?.events || [];
  if (!state.eonetLive && state.eonet?.near_cities && state.place?.city?.id && state.eonet.near_cities[state.place.city.id] && state.place.type === "city") {
    // precomputed is fine as a starting list; still filter by distance for consistency
    pool = state.eonet.events;
  }
  const scored = [];
  for (const e of pool) {
    if (e.lat == null || e.lon == null) continue;
    const d = haversineKm(lat, lon, e.lat, e.lon);
    if (d <= maxKm) scored.push({ ...e, distance_km: d });
  }
  // prefer non-wildfire, then recent
  scored.sort((a, b) => {
    const af = (a.categories || []).includes("wildfires") ? 1 : 0;
    const bf = (b.categories || []).includes("wildfires") ? 1 : 0;
    if (af !== bf) return af - bf;
    return String(b.date || "").localeCompare(String(a.date || ""));
  });
  return scored.slice(0, 8);
}

function updateEvents(lat, lon) {
  state.events = eventListFor(lat, lon);
  refreshEvents();
}

function refreshEvents() {
  const el = document.getElementById("events");
  const evs = state.events;
  if (!evs.length) {
    el.innerHTML = `<p class="empty">${t(state.lang, "no_events")}</p>`;
    return;
  }
  el.innerHTML = evs
    .slice(0, 5)
    .map((e) => {
      const cat = categoryLabel((e.categories && e.categories[0]) || "", state.lang);
      const when = (e.date || "").slice(0, 10);
      const dist = e.distance_km != null ? ` · ${Math.round(e.distance_km)} km` : "";
      return `<div class="event-item"><div>${e.title || cat}</div><div class="when">${cat} · ${when}${dist}</div></div>`;
    })
    .join("") + `<p class="empty">${t(state.lang, state.eonetLive ? "events_live" : "events_fallback")}</p>`;
}

async function tryLiveEonet() {
  try {
    const res = await fetch("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=500");
    if (!res.ok) return;
    const json = await res.json();
    const events = [];
    for (const ev of json.events || []) {
      const geos = ev.geometry || [];
      const last = geos[geos.length - 1];
      if (!last || !last.coordinates) continue;
      let lon, lat;
      if (last.type === "Point") {
        lon = last.coordinates[0];
        lat = last.coordinates[1];
      } else if (last.type === "Polygon") {
        lon = last.coordinates[0][0][0];
        lat = last.coordinates[0][0][1];
      } else continue;
      events.push({
        id: ev.id,
        title: ev.title,
        categories: (ev.categories || []).map((c) => c.id || c.title),
        lat, lon,
        date: last.date,
        status: ev.closed ? "closed" : "open",
      });
    }
    if (events.length) {
      state.eonetLive = { events };
      if (state.place) updateEvents(state.place.lat, state.place.lon);
    }
  } catch (e) {
    // fallback already loaded
  }
}

function hideTourUI() {
  const next = document.getElementById("tour-next");
  const bar = document.getElementById("tour-bar");
  if (next) next.classList.add("hidden");
  if (bar) bar.classList.add("hidden");
}

function setTourPrompt(text) {
  const el = document.getElementById("tour-prompt");
  if (!el) return;
  if (text) {
    el.hidden = false;
    el.textContent = text;
  } else {
    el.hidden = true;
    el.textContent = "";
  }
}

function renderTourChips() {
  const bar = document.getElementById("tour-bar");
  const host = document.getElementById("tour-chips");
  if (!bar || !host) return;
  const topics = state.tourTopics || [];
  if (!topics.length) {
    bar.classList.add("hidden");
    return;
  }
  bar.classList.remove("hidden");
  const current = state.narrator.currentTopic();
  const currentId = current && current.id;
  host.innerHTML = topics.map((topic) => {
    const cur = topic.id === currentId ? " current" : "";
    return `<button type="button" class="tour-chip${cur}" data-topic="${topic.id}">${topic.label}</button>`;
  }).join("");
}

function applyTourTopic(topic) {
  if (!topic) return;
  if (topic.variable && topic.variable !== state.variable) {
    state.variable = topic.variable;
    const sel = document.getElementById("variable");
    if (sel) sel.value = topic.variable;
    refreshView();
  }
  renderTourChips();
}

function startTour() {
  if (!isMobileUI()) return;
  if (!state.place) return;
  if (state.place.loading) return;
  const topics = buildTourTopics(state.place, state.lang, state.events);
  state.tourTopics = topics;
  const box = document.getElementById("subtitles");
  box.hidden = false;
  const btn = document.getElementById("voice-btn");
  const pauseBtn = document.getElementById("voice-pause");
  const nextBtn = document.getElementById("tour-next");
  pauseBtn.classList.remove("hidden");
  pauseBtn.textContent = "❚❚";
  pauseBtn.setAttribute("aria-label", t(state.lang, "pause"));
  nextBtn.classList.add("hidden");
  btn.classList.add("playing");
  btn.textContent = t(state.lang, "play_tour");
  if (!topics.length) {
    const msg = t(state.lang, "no_point_data");
    box.textContent = msg;
    pauseBtn.classList.add("hidden");
    btn.classList.remove("playing");
    hideTourUI();
    state.narrator.stop();
    return;
  }
  state.narrator.onTopicChange = (topic) => {
    applyTourTopic(topic);
  };
  state.narrator.onSegment = (seg) => {
    box.textContent = seg.speech || seg.text;
    if (seg.variable && seg.variable !== state.variable) {
      state.variable = seg.variable;
      const sel = document.getElementById("variable");
      if (sel) sel.value = seg.variable;
      refreshView();
    }
    state.chartMode = seg.chart === "ranking" ? "ranking" : "trend";
    highlightSoWhat(seg.id);
    if (seg.chart === "events") {
      document.getElementById("events-card").scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else if (["finding", "meaning", "tip", "outlook"].includes(seg.id)) {
      const card = document.querySelector(`.sowhat-part[data-part="${seg.id}"]`);
      if (card) card.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
    refreshCharts();
    renderTourChips();
  };
  state.narrator.onWaitForNext = (nextTopic) => {
    pauseBtn.classList.add("hidden");
    nextBtn.classList.remove("hidden");
    const prompt = nextTopic ? nextPrompt(nextTopic, state.lang) : t(state.lang, "tour_done");
    box.textContent = prompt;
    setTourPrompt(prompt);
    refreshSoWhat();
    renderTourChips();
  };
  state.narrator.onEnd = () => {
    btn.classList.remove("playing");
    pauseBtn.classList.add("hidden");
    nextBtn.classList.add("hidden");
    setTourPrompt("");
    box.textContent = t(state.lang, "tour_done");
  };
  state.lastNarratedLatLon = { lat: state.place.lat, lon: state.place.lon };
  state.narrator.onEnglishVoiceMissing = setVoiceLangNote;
  state.narrator.startTopics(topics, state.lang);
  renderTourChips();
}

function showTourStepsPreview() {
  if (!state.place) return;
  const topics = buildTourTopics(state.place, state.lang, state.events);
  state.tourTopics = topics;
  const box = document.getElementById("subtitles");
  box.hidden = false;
  const btn = document.getElementById("voice-btn");
  const pauseBtn = document.getElementById("voice-pause");
  pauseBtn.classList.add("hidden");
  btn.classList.add("playing");
  state.narrator.onTopicChange = (topic) => applyTourTopic(topic);
  state.narrator.onSegment = (seg) => {
    if (seg.variable && seg.variable !== state.variable) {
      state.variable = seg.variable;
      const sel = document.getElementById("variable");
      if (sel) sel.value = seg.variable;
      refreshView();
    }
    highlightSoWhat(seg.id);
    refreshCharts();
  };
  state.narrator.onWaitForNext = (nextTopic) => {
    document.getElementById("tour-next").classList.remove("hidden");
    const prompt = nextTopic ? nextPrompt(nextTopic, state.lang) : t(state.lang, "tour_done");
    box.textContent = prompt;
    setTourPrompt(prompt);
    refreshSoWhat();
    renderTourChips();
  };
  state.narrator.topics = topics;
  state.narrator.lang = state.lang;
  state.narrator.showWaitAfterTopic("temp");
}

window.showTourStepsPreview = showTourStepsPreview;


function togglePause() {
  const pauseBtn = document.getElementById("voice-pause");
  if (!state.narrator.speaking) {
    startTour();
    return;
  }
  if (state.narrator.paused) {
    state.narrator.resume();
    pauseBtn.textContent = "❚❚";
    pauseBtn.setAttribute("aria-label", t(state.lang, "pause"));
  } else {
    state.narrator.pause();
    pauseBtn.textContent = "▶";
    pauseBtn.setAttribute("aria-label", t(state.lang, "resume"));
  }
}

function beginMobileTour(requestGeo) {
  if (!isMobileUI()) return;
  hideMobileStart();
  const startAudio = () => startTour();
  if (!requestGeo || !navigator.geolocation) {
    startAudio();
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      watchMovement();
      loadPointPlace(pos.coords.latitude, pos.coords.longitude, { fromGeo: true, speak: true });
    },
    () => startAudio(),
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
  );
}

function watchMovement() {
  if (state.watchId != null || !navigator.geolocation) return;
  state.watchId = navigator.geolocation.watchPosition((pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const prev = state.lastNarratedLatLon;
    if (prev && haversineKm(prev.lat, prev.lon, lat, lon) < 20) return;
    loadPointPlace(lat, lon, { fromGeo: true, speak: true });
  });
}

boot().catch((err) => {
  console.error(err);
  document.getElementById("conclusion").textContent = String(err);
});
