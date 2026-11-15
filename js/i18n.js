const I18N = {
  zh: {
    legend_baseline_note: "年度距平說明：地圖比較各城市該年年平均值與該城市自身的「平常值」。氣溫、比濕（QV）與太陽輻射（MERRA-2／NASA POWER）採 1991–2020 年，即世界氣象組織（WMO）30 年氣候標準值；降雨（GPM IMERG）採 2001–2024 年、土壤濕度（GLDAS）採 2000–2025 年、地下水（GRACE-DA）採 2004–2025 年、二氧化碳（OCO-2）採 2015–2021 年，因紀錄不足 30 年，皆以完整紀錄期間為基準。紅色＝高於平常，藍色＝低於平常。",
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
    tour_chip_label: "點選切換項目：",
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
    ranking_title: "首都趨勢排名",
    map_mode_trend: "趨勢",
    map_mode_year: "該年與平常相比",
    map_mode_group: "地圖顯示",
    legend_ns: "空心圓：趨勢未達顯著（Mann–Kendall，α=0.05）",
    legend_ns_short: "空心＝未顯著",
    legend_size: "圓點大小：小＝較低，大＝較高（與顏色同一尺度）。",
    sources_baseline_heading: "年度距平基準",
    source_more: "資料來源",
    source_close: "關閉",
    legend_label: "圖例",
    legend_toggle_hide: "收合圖例",
    legend_toggle_show: "展開圖例",
    legend_note_show: "說明 ▸",
    legend_note_hide: "說明 ▾",
    no_data: "無資料",
    qr_caption: "手機掃描\n開啟語音導覽",
    qr_alt: "手機版語音導覽 QR 碼",
    rank_sort_desc: "由高到低",
    rank_sort_asc: "由低到高",
    ranking_title_year: (year) => `首都 ${year} 年距平常排名`,
    rank_caption_year: (n, year) => `以 ${year} 年相對自身基準期的距平排序，共 ${n} 個首都。`,
    per_decade_unit: "／十年",
    map_hint_mode_trend: "圓點：紅＝增加、藍＝減少（每 10 年）；空心＝未達顯著；沒有圓點＝無資料。",
    map_hint_mode_year: "圓點顏色是該年相對該城市自身基準期的距平；沒有圓點表示該年無資料。",

    events_title: "附近事件",
    start_title: "開始導覽",
    start_body: "按一下開始「導覽版」：用你所在位置的 NASA 區域資料講述變化。解析度大約 50 公里，同一座城市裡相近地點的數字會很接近。想看某個首都的完整資料，請點地圖上的圓點，進入「首都版」。",
    start_btn: "開始導覽",
    or_try: "或不開定位，改聽首都版示範地點：",
    map_hint_temp: "點圓點進入首都版，點其他位置進入導覽版。",
    map_hint_precip: "點圓點進入首都版，點其他位置進入導覽版。",
    map_hint_soil: "點圓點進入首都版，點其他位置進入導覽版。部分城市沒有完整序列。",
    map_hint_humidity: "點圓點進入首都版，點其他位置進入導覽版。",
    map_hint_groundwater: "點圓點進入首都版，點其他位置進入導覽版。部分城市沒有完整序列。",
    map_hint_radiation: "點圓點進入首都版，點其他位置進入導覽版。",
    map_hint_co2: "點圓點進入首都版，點其他位置進入導覽版。紀錄較短（約 2015–2021）。",
    legend_precip: "降雨 Sen 斜率（毫米／十年）",
    legend_soil: "土壤濕度 Sen 斜率（kg/m²／十年）",
    legend_humidity: "比濕 Sen 斜率（g/kg／十年）",
    legend_groundwater: "地下水儲量 Sen 斜率（mm／十年）",
    legend_radiation: "太陽輻射 Sen 斜率（MJ/m²/day／十年）",
    legend_co2: "XCO2 Sen 斜率（ppm／十年）",
    legend_year_temp: "年平均氣溫（°C）",
    legend_year_precip: "年降雨量（毫米）",
    legend_year_humidity: "年平均比濕（g/kg）",
    legend_year_soil: "年平均土壤濕度（kg/m²）",
    legend_year_groundwater: "年平均地下水儲量（mm）",
    legend_year_radiation: "年平均太陽輻射（MJ/m²/day）",
    legend_year_co2: "年平均 XCO2（ppm）",
    legend_trend_temp: "氣溫趨勢（°C／十年）",
    legend_trend_precip: "降雨趨勢（毫米／十年）",
    legend_trend_humidity: "比濕趨勢（g/kg／十年）",
    legend_trend_soil: "土壤濕度趨勢（kg/m²／十年）",
    legend_trend_groundwater: "地下水儲量趨勢（mm／十年）",
    legend_trend_radiation: "太陽輻射趨勢（MJ/m²/day／十年）",
    legend_trend_co2: "XCO2 趨勢（ppm／十年）",
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
    legend_baseline_note: "About the year view: the map compares each city's annual mean for the selected year with that city's own normal. Temperature, specific humidity (QV) and solar radiation (MERRA-2 / NASA POWER) use 1991–2020, the WMO 30-year climate normal. Precipitation (GPM IMERG) uses 2001–2024, soil moisture (GLDAS) 2000–2025, groundwater (GRACE-DA) 2004–2025 and CO2 (OCO-2) 2015–2021; each uses its full record because it is shorter than 30 years. Red = above normal; blue = below normal.",
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
    tour_chip_label: "Tap to switch:",
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
    ranking_title: "Capital trend rank",
    map_mode_trend: "Trend",
    map_mode_year: "vs. normal",
    map_mode_group: "Map display",
    legend_ns: "Hollow circle: trend not significant (Mann–Kendall, α=0.05)",
    legend_ns_short: "Hollow = not significant",
    legend_size: "Circle size: small = lower, large = higher (same scale as the colours).",
    sources_baseline_heading: "Year-mode baseline",
    source_more: "Sources",
    source_close: "Close",
    legend_label: "Legend",
    legend_toggle_hide: "Hide legend",
    legend_toggle_show: "Show legend",
    legend_note_show: "Note ▸",
    legend_note_hide: "Note ▾",
    no_data: "No data",
    qr_caption: "Scan for\nmobile voice tour",
    qr_alt: "QR code for the mobile voice tour",
    rank_sort_desc: "High to low",
    rank_sort_asc: "Low to high",
    ranking_title_year: (year) => `Capital anomalies in ${year}`,
    rank_caption_year: (n, year) => `Ranked by ${year} anomaly vs each capital's own baseline, ${n} capitals.`,
    per_decade_unit: " / decade",
    map_hint_mode_trend: "Circles: red = increase, blue = decrease (per decade); hollow = not significant; no circle = no data.",
    map_hint_mode_year: "Circle colour is the anomaly vs that city's own baseline; no circle means no data for that year.",

    events_title: "Nearby events",
    start_title: "Start the tour",
    start_body: "Tap to start Tour mode: we will narrate NASA regional data at your location. Resolution is about 50 kilometres, so nearby places in the same city get similar numbers. To see a capital's full record, tap a city dot for Capital mode.",
    start_btn: "Start tour",
    or_try: "Or skip location and hear a Capital-mode demo city:",
    map_hint_temp: "Tap a circle for Capital mode, or elsewhere for Tour mode.",
    map_hint_precip: "Tap a circle for Capital mode, or elsewhere for Tour mode.",
    map_hint_soil: "Tap a circle for Capital mode, or elsewhere for Tour mode. Some cities have no complete series.",
    map_hint_humidity: "Tap a circle for Capital mode, or elsewhere for Tour mode.",
    map_hint_groundwater: "Tap a circle for Capital mode, or elsewhere for Tour mode. Some cities have no complete series.",
    map_hint_radiation: "Tap a circle for Capital mode, or elsewhere for Tour mode.",
    map_hint_co2: "Tap a circle for Capital mode, or elsewhere for Tour mode. The record is short (about 2015–2021).",
    legend_precip: "Precipitation Sen's slope (mm / decade)",
    legend_soil: "Soil-moisture Sen's slope (kg/m² / decade)",
    legend_humidity: "Specific-humidity Sen's slope (g/kg / decade)",
    legend_groundwater: "Groundwater-storage Sen's slope (mm / decade)",
    legend_radiation: "Solar-radiation Sen's slope (MJ/m²/day / decade)",
    legend_co2: "XCO2 Sen's slope (ppm / decade)",
    legend_year_temp: "Annual mean temperature (°C)",
    legend_year_precip: "Annual precipitation (mm)",
    legend_year_humidity: "Annual mean specific humidity (g/kg)",
    legend_year_soil: "Annual mean soil moisture (kg/m²)",
    legend_year_groundwater: "Annual mean groundwater storage (mm)",
    legend_year_radiation: "Annual mean solar radiation (MJ/m²/day)",
    legend_year_co2: "Annual mean XCO2 (ppm)",
    legend_trend_temp: "Temperature trend (°C / decade)",
    legend_trend_precip: "Precipitation trend (mm / decade)",
    legend_trend_humidity: "Specific-humidity trend (g/kg / decade)",
    legend_trend_soil: "Soil-moisture trend (kg/m² / decade)",
    legend_trend_groundwater: "Groundwater-storage trend (mm / decade)",
    legend_trend_radiation: "Solar-radiation trend (MJ/m²/day / decade)",
    legend_trend_co2: "XCO2 trend (ppm / decade)",
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
  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    el.setAttribute("alt", t(lang, el.getAttribute("data-i18n-alt")));
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
