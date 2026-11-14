const I18N = {
  zh: {
    subtitle: "地球回聲",
    tagline: "聽聽這塊土地一直在告訴你什麼",
    variable: "變數",
    var_temp: "氣溫",
    var_precip: "降雨",
    var_soil: "土壤濕度",
    var_humidity: "空氣濕度",
    var_groundwater: "地下水",
    var_radiation: "太陽輻射",
    var_co2: "二氧化碳",
    topic_temp: "氣溫",
    topic_precip: "降雨",
    topic_humidity: "空氣濕度",
    topic_soil: "土壤濕度",
    topic_groundwater: "地下水",
    topic_radiation: "太陽輻射",
    topic_co2: "二氧化碳",
    topic_events: "附近事件",
    next_topic: "下一則",
    tour_done: "這次導覽到這裡告一段落。",
    part_finding: "發現 Finding",
    part_meaning: "代表 What it means",
    part_tip: "建議 Tip",
    part_outlook: "未來趨勢 Outlook",
    data_details: "資料依據 / Data details",
    play_tour: "播放導覽",
    pause: "暫停",
    resume: "繼續",
    replay: "重聽",
    chart_trend: "趨勢",
    tab_trend: "趨勢",
    tab_ranking: "首都排名",
    ranking_title: "首都升溫排名",
    events_title: "附近事件",
    start_title: "開始導覽",
    start_body: "按一下開始「導覽版」：用你所在位置的 NASA 區域資料講述變化。解析度大約 50 公里，同一座城市裡相近地點的數字會很接近。想看某個首都的完整資料，請點地圖上的圓點，進入「首都版」。",
    start_btn: "開始導覽",
    or_try: "或不開定位，改聽首都版示範地點：",
    map_hint_temp: "顏色是 GISTEMP 全球氣溫距平。圓點是有完整時間序列的城市。點地圖任一處即可查看。",
    map_hint_precip: "圓點顏色代表各城市 GPM IMERG（或 POWER）降雨趨勢。點地圖任一處即可查看。",
    map_hint_soil: "圓點顏色代表各城市 GLDAS 0–10 公分土壤濕度趨勢。沒有格點的位置表示該點沒有完整序列。",
    map_hint_humidity: "圓點顏色代表各城市 MERRA-2（或 POWER）2 米比濕趨勢。相對濕度另見說明卡片。",
    map_hint_groundwater: "圓點顏色代表各城市 GLDAS／GRACE 資料同化地下水儲量趨勢。部分地點沒有完整序列。",
    map_hint_radiation: "圓點顏色代表各城市 NASA POWER 地面太陽短波輻射趨勢。",
    map_hint_co2: "圓點顏色代表各城市附近 OCO-2 同化網格的二氧化碳柱平均濃度趨勢。紀錄較短（約 2015–2021）。",
    legend_temp: "氣溫距平（相對 1951–1980）",
    legend_precip: "降雨 Sen 斜率（毫米／十年）",
    legend_soil: "土壤濕度 Sen 斜率（kg/m²／十年）",
    legend_humidity: "比濕 Sen 斜率（g/kg／十年）",
    legend_groundwater: "地下水儲量 Sen 斜率（mm／十年）",
    legend_radiation: "太陽輻射 Sen 斜率（MJ/m²/day／十年）",
    legend_co2: "XCO2 Sen 斜率（ppm／十年）",
    year_partial: "1–10 月暫定",
    near_city: (name, km) => `最接近的序列：${name}（約 ${km} 公里）`,
    this_point: "你點選的位置",
    your_location: "你現在的位置",
    loading: "載入資料中…",
    loading_point: "正在載入此地點的 NASA 資料…",
    no_point_data: "這個位置目前沒有抓到資料，我們不知道。",
    mode_capital: "首都版",
    mode_capital_hint: "離線預先計算的城市完整資料",
    mode_tour: "導覽版",
    mode_tour_hint: "此地點的 NASA 區域資料，約 50 公里解析度",
    point_live_meta: (lat, lon) => `NASA 區域資料（約 50 公里）· ${lat}°, ${lon}°`,
    no_events: "近年附近沒有記錄到重大事件。",
    events_live: "資料來源：NASA EONET 地球自然事件觀測網（即時）。",
    events_fallback: "資料來源：NASA EONET 地球自然事件觀測網（離線備援）。",
    clear: "趨勢清楚",
    unclear: "趨勢尚不明",
    per_decade_warm: (v) => `每 10 年升溫 ${v}°C`,
    per_decade_cool: (v) => `每 10 年降溫 ${v}°C`,
    per_decade_rain_up: (v) => `每 10 年增加 ${v} 毫米`,
    per_decade_rain_down: (v) => `每 10 年減少 ${v} 毫米`,
    vs_global_faster: "比全球平均快",
    vs_global_slower: "比全球平均慢",
    vs_global_similar: "和全球平均差不多",
    global_avg: "全球平均",
    projection_label: "統計外推（不是氣候模式預報）",
    nex_ssp245: "NEX-GDDP-CMIP6 SSP2-4.5",
    nex_ssp585: "NEX-GDDP-CMIP6 SSP5-8.5",
    legend_stat: "統計推估",
    legend_nex_mid: "NASA 模式：中等排放",
    legend_nex_high: "NASA 模式：高排放",
    chart_obs: "觀測（年平均值）",
    chart_fit: "Sen 趨勢線",
    rank_caption: (n) => `以觀測序列的 Sen 斜率排序，共 ${n} 個首都。`,
    sources_html: `
      <strong>資料來源</strong>（皆為 NASA 開放資料；未使用 NASA 標誌）<br>
      城市氣溫：NASA Giovanni／GES DISC MERRA-2 月平均 2 米氣溫，短名 M2IMNXASM 5.12.4，變數 T2M，DOI 10.5067/5ESKGQTZG7FO。<br>
      城市降雨：NASA Giovanni／GES DISC GPM IMERG Final 月降水，短名 GPM_3IMERGM 07，DOI 10.5067/GPM/IMERG/3B-MONTH/07（完整年約 2001–2024）。<br>
      土壤濕度：NASA Giovanni／GES DISC GLDAS Noah 0–10 公分，短名 GLDAS_NOAH025_M 2.1，變數 SoilMoi0_10cm_inst，DOI 10.5067/SXAVCZFAQLNO。部分地點沒有完整序列。<br>
      額外來源：NASA POWER 月資料 T2M、PRECTOTCORR（MERRA-2），用於地圖點選位置的即時序列與備援。<br>
      地圖顏色：NASA GISS GISTEMP v4（1200 km 平滑距平，下採樣至約 4°；2026 年為 1–10 月）。基準期 1951–1980。<br>
      未來趨勢陰影：NASA NEX-GDDP-CMIP6（Thrasher et al. 2022，DOI 10.7917/OFSG3345），SSP2-4.5 與 SSP5-8.5 多模式平均與範圍，已對齊觀測基準期；虛線則是獨立的統計外推，不是氣候模式預報。<br>
      附近事件：NASA EONET v3。<br>
      空氣比濕：NASA Giovanni／GES DISC MERRA-2 月平均 2 米比濕，短名 M2IMNXASM 5.12.4，變數 QV2M，DOI 10.5067/5ESKGQTZG7FO（單位已換算為 g/kg）。相對濕度 RH2M 來自 NASA POWER 月資料（以 MERRA-2 為基礎），僅作對照說明。<br>
      太陽輻射：NASA POWER 月資料 ALLSKY_SFC_SW_DWN（全天空地面短波向下輻射，MJ/m²/day），多數序列自 1984 年起。<br>
      地下水：NASA Giovanni／GES DISC GLDAS Catchment 模式每日 0.25°、結合 GRACE 資料同化的地下水儲量，短名 GLDAS_CLSM025_DA1_D 2.2，變數 GWS_tavg，DOI 10.5067/TXBMLX370XX8。紀錄大約自 2003 年 2 月開始。這是模式與衛星同化的儲量（毫米水當量），不是水井實測。部分地點沒有完整序列。<br>
      二氧化碳：NASA Giovanni／GES DISC OCO-2 GEOS 第三級每日同化大氣二氧化碳柱平均濃度（XCO2），短名 OCO2_GEOS_L3CO2_DAY 10r，DOI 10.5067/Y9M4NM9MPCGH。完整年大約僅有 2015–2021，紀錄偏短；數值是 0.5°×0.625° 網格的同化結果，不是城市測站。<br>
      方法：Mann–Kendall 檢定與 Sen's slope（Theil–Sen），α = 0.05。「代表」段落的月份計數只比較前後各 10 個完整年的觀測，閾值為基準期第 90 百分位。
    `,
  },
  en: {
    subtitle: "地球回聲",
    tagline: "Hear what this place has been telling you",
    variable: "Variable",
    var_temp: "Temperature",
    var_precip: "Precipitation",
    var_soil: "Soil moisture",
    var_humidity: "Air humidity",
    var_groundwater: "Groundwater",
    var_radiation: "Solar radiation",
    var_co2: "Carbon dioxide",
    topic_temp: "temperature",
    topic_precip: "rainfall",
    topic_humidity: "air humidity",
    topic_soil: "soil moisture",
    topic_groundwater: "groundwater",
    topic_radiation: "solar radiation",
    topic_co2: "carbon dioxide",
    topic_events: "nearby events",
    next_topic: "Next",
    tour_done: "That is the end of this tour.",
    part_finding: "發現 Finding",
    part_meaning: "代表 What it means",
    part_tip: "建議 Tip",
    part_outlook: "未來趨勢 Outlook",
    data_details: "資料依據 / Data details",
    play_tour: "Start tour",
    pause: "Pause",
    resume: "Resume",
    replay: "Replay",
    chart_trend: "Trend",
    tab_trend: "Trend",
    tab_ranking: "Capitals",
    ranking_title: "Capital warming rank",
    events_title: "Nearby events",
    start_title: "Start the tour",
    start_body: "Tap to start Tour mode: we will narrate NASA regional data at your location. Resolution is about 50 kilometres, so nearby places in the same city get similar numbers. To see a capital's full record, tap a city dot for Capital mode.",
    start_btn: "Start tour",
    or_try: "Or skip location and hear a Capital-mode demo city:",
    map_hint_temp: "Colours show GISTEMP global temperature anomalies. Dots are cities with a full time series. Click anywhere on the map.",
    map_hint_precip: "Dot colours show each city's GPM IMERG (or POWER) precipitation trend. Click anywhere on the map.",
    map_hint_soil: "Dot colours show each city's GLDAS 0–10 cm soil-moisture trend. A missing series means no complete record at that point.",
    map_hint_humidity: "Dot colours show each city's MERRA-2 (or POWER) 2 m specific-humidity trend. Relative humidity is explained on the cards.",
    map_hint_groundwater: "Dot colours show each city's GLDAS/GRACE-DA groundwater-storage trend. Some points have no complete series.",
    map_hint_radiation: "Dot colours show each city's NASA POWER surface solar shortwave radiation trend.",
    map_hint_co2: "Dot colours show OCO-2 assimilated column-average CO2 trends at the nearby grid cell. The record is short (about 2015–2021).",
    legend_temp: "Temperature anomaly (vs 1951–1980)",
    legend_precip: "Precipitation Sen's slope (mm / decade)",
    legend_soil: "Soil-moisture Sen's slope (kg/m² / decade)",
    legend_humidity: "Specific-humidity Sen's slope (g/kg / decade)",
    legend_groundwater: "Groundwater-storage Sen's slope (mm / decade)",
    legend_radiation: "Solar-radiation Sen's slope (MJ/m²/day / decade)",
    legend_co2: "XCO2 Sen's slope (ppm / decade)",
    year_partial: "Jan–Oct provisional",
    near_city: (name, km) => `Nearest series: ${name} (~${km} km)`,
    this_point: "Selected point",
    your_location: "Your location",
    loading: "Loading data…",
    loading_point: "Loading NASA data for this point…",
    no_point_data: "There is no data for this point yet, so we don't know.",
    mode_capital: "Capital mode",
    mode_capital_hint: "Full offline precomputed city record",
    mode_tour: "Tour mode",
    mode_tour_hint: "Local NASA regional data at this point, about 50 km resolution",
    point_live_meta: (lat, lon) => `NASA regional data (about 50 km) · ${lat}°, ${lon}°`,
    no_events: "No major recorded events nearby in recent years.",
    events_live: "Source: NASA EONET Earth Observatory Natural Event Tracker (live).",
    events_fallback: "Source: NASA EONET Earth Observatory Natural Event Tracker (offline snapshot).",
    clear: "clear trend",
    unclear: "not yet clear",
    per_decade_warm: (v) => `+${v}°C per decade`,
    per_decade_cool: (v) => `−${v}°C per decade`,
    per_decade_rain_up: (v) => `+${v} mm per decade`,
    per_decade_rain_down: (v) => `−${v} mm per decade`,
    vs_global_faster: "faster than the global average",
    vs_global_slower: "slower than the global average",
    vs_global_similar: "about the same as the global average",
    global_avg: "Global average",
    projection_label: "Statistical extrapolation (not a climate-model forecast)",
    nex_ssp245: "NEX-GDDP-CMIP6 SSP2-4.5",
    nex_ssp585: "NEX-GDDP-CMIP6 SSP5-8.5",
    legend_stat: "Statistical trend",
    legend_nex_mid: "NASA model: moderate emissions",
    legend_nex_high: "NASA model: high emissions",
    chart_obs: "Observed annual mean",
    chart_fit: "Sen trend line",
    rank_caption: (n) => `Ranked by Sen's slope of the observed series, ${n} capitals.`,
    sources_html: `
      <strong>Sources</strong> (NASA open data; no NASA logos are used)<br>
      City temperature: NASA Giovanni / GES DISC MERRA-2 monthly 2 m air temperature, short name M2IMNXASM 5.12.4, T2M, DOI 10.5067/5ESKGQTZG7FO.<br>
      City rainfall: NASA Giovanni / GES DISC GPM IMERG Final monthly precipitation, short name GPM_3IMERGM 07, DOI 10.5067/GPM/IMERG/3B-MONTH/07 (complete years typically 2001–2024).<br>
      Soil moisture: NASA Giovanni / GES DISC GLDAS Noah 0–10 cm, short name GLDAS_NOAH025_M 2.1, SoilMoi0_10cm_inst, DOI 10.5067/SXAVCZFAQLNO. Some points have no complete series.<br>
      Additional source: NASA POWER monthly T2M and PRECTOTCORR (MERRA-2), used for live series at a clicked point and as a fallback.<br>
      Map colours: NASA GISS GISTEMP v4 (1200 km smoothed anomalies, downsampled to ~4°; 2026 is January–October). Baseline 1951–1980.<br>
      Outlook bands: NASA NEX-GDDP-CMIP6 (Thrasher et al. 2022, DOI 10.7917/OFSG3345), multi-model mean and range for SSP2-4.5 and SSP5-8.5, bias-anchored to the observed baseline. The dashed line is a separate statistical extrapolation, not a climate-model forecast.<br>
      Nearby events: NASA EONET v3.<br>
      Air specific humidity: NASA Giovanni / GES DISC MERRA-2 monthly 2 m specific humidity, short name M2IMNXASM 5.12.4, QV2M, DOI 10.5067/5ESKGQTZG7FO (shown in g/kg). Relative humidity RH2M comes from NASA POWER monthly data (MERRA-2-based) and is used only as a companion explanation.<br>
      Solar radiation: NASA POWER monthly ALLSKY_SFC_SW_DWN (all-sky surface shortwave downward irradiance, MJ/m²/day); most series begin in 1984.<br>
      Groundwater: NASA Giovanni / GES DISC GLDAS Catchment daily 0.25° groundwater storage with GRACE data assimilation, short name GLDAS_CLSM025_DA1_D 2.2, GWS_tavg, DOI 10.5067/TXBMLX370XX8. The record typically starts in February 2003. This is modelled, assimilated storage in mm of water equivalent, not a well measurement. Some points have no complete series.<br>
      Carbon dioxide: NASA Giovanni / GES DISC OCO-2 GEOS Level 3 daily assimilated column-average dry-air CO2 (XCO2), short name OCO2_GEOS_L3CO2_DAY 10r, DOI 10.5067/Y9M4NM9MPCGH. Complete years are typically only 2015–2021, so the record is short. Values are a 0.5°×0.625° assimilated grid cell, not a city station.<br>
      Methods: Mann–Kendall test and Sen's slope (Theil–Sen), α = 0.05. Month counts in “What it means” compare only the first and last 10 complete years of observations, using the baseline 90th percentile as the threshold.
    `,
  },
};

function t(lang, key, ...args) {
  const pack = I18N[lang] || I18N.zh;
  const val = pack[key];
  if (typeof val === "function") return val(...args);
  return val ?? key;
}

function applyStaticI18n(lang) {
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(lang, el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(lang, el.getAttribute("data-i18n-aria")));
  });
  const varKeys = {
    temp: "var_temp",
    precip: "var_precip",
    humidity: "var_humidity",
    soil: "var_soil",
    groundwater: "var_groundwater",
    radiation: "var_radiation",
    co2: "var_co2",
  };
  Object.entries(varKeys).forEach(([value, key]) => {
    const opt = document.querySelector('#variable option[value="' + value + '"]');
    if (opt) opt.textContent = t(lang, key);
  });
}

function fmtP(p) {
  if (p == null || Number.isNaN(p)) return "—";
  if (p < 0.0001) return "p < 0.0001";
  if (p < 0.001) return `p = ${p.toFixed(4)}`;
  if (p < 0.01) return `p = ${p.toFixed(3)}`;
  return `p = ${p.toFixed(2)}`;
}

function fmtDec(v, digits = 2) {
  if (v == null || Number.isNaN(v)) return "—";
  const n = Number(v);
  const s = Math.abs(n).toFixed(digits);
  return n < 0 ? `−${s}` : s;
}

function cityName(city, lang) {
  if (!city) return "";
  return lang === "zh" ? city.name_zh : city.name_en;
}

function countryName(city, lang) {
  if (!city) return "";
  return lang === "zh" ? city.country_zh : city.country_en;
}

function categoryLabel(cat, lang) {
  const map = {
    wildfires: ["野火", "Wildfire"],
    volcanoes: ["火山", "Volcano"],
    floods: ["洪水", "Flood"],
    severeStorms: ["強烈風暴", "Severe storm"],
    seaLakeIce: ["海冰／湖冰", "Sea or lake ice"],
    drought: ["乾旱", "Drought"],
    dustHaze: ["沙塵", "Dust"],
    earthquakes: ["地震", "Earthquake"],
    landslides: ["山崩", "Landslide"],
    snow: ["雪災", "Snow"],
    tempExtremes: ["極端氣溫", "Temperature extreme"],
    waterColor: ["水色異常", "Water colour"],
  };
  const pair = map[cat];
  if (!pair) return cat;
  return lang === "zh" ? pair[0] : pair[1];
}
