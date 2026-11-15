function officialSourceMeta(source) {
  const map = {
    giovanni_merra2: {
      name_zh: "NASA Giovanni MERRA-2 月平均 2 米氣溫",
      name_en: "NASA Giovanni MERRA-2 monthly 2 m air temperature",
      short: "M2IMNXASM",
      version: "5.12.4",
      param: "T2M",
      doi: "10.5067/5ESKGQTZG7FO",
    },
    giovanni_imerg: {
      name_zh: "NASA Giovanni GPM IMERG 月降水（Final）",
      name_en: "NASA Giovanni GPM IMERG Final monthly precipitation",
      short: "GPM_3IMERGM",
      version: "07",
      param: "precipitation",
      doi: "10.5067/GPM/IMERG/3B-MONTH/07",
    },
    giovanni_gldas: {
      name_zh: "NASA Giovanni GLDAS Noah 0–10 公分土壤濕度",
      name_en: "NASA Giovanni GLDAS Noah 0–10 cm soil moisture",
      short: "GLDAS_NOAH025_M",
      version: "2.1",
      param: "SoilMoi0_10cm_inst",
      doi: "10.5067/SXAVCZFAQLNO",
    },
    power: {
      name_zh: "NASA POWER 月資料（以 MERRA-2 為基礎）",
      name_en: "NASA POWER monthly data (MERRA-2-based)",
      short: "POWER",
      version: "",
      param: "T2M / PRECTOTCORR",
      doi: "",
      url: "https://power.larc.nasa.gov",
    },
    giovanni_merra2_qv: {
      name_zh: "NASA Giovanni MERRA-2 月平均 2 米比濕",
      name_en: "NASA Giovanni MERRA-2 monthly 2 m specific humidity",
      short: "M2IMNXASM",
      version: "5.12.4",
      param: "QV2M",
      doi: "10.5067/5ESKGQTZG7FO",
    },
    power_qv: {
      name_zh: "NASA POWER 月資料 2 米比濕（以 MERRA-2 為基礎）",
      name_en: "NASA POWER monthly 2 m specific humidity (MERRA-2-based)",
      short: "POWER",
      version: "",
      param: "QV2M",
      doi: "",
      url: "https://power.larc.nasa.gov",
    },
    power_rh: {
      name_zh: "NASA POWER 月資料 2 米相對濕度（以 MERRA-2 為基礎）",
      name_en: "NASA POWER monthly 2 m relative humidity (MERRA-2-based)",
      short: "POWER",
      version: "",
      param: "RH2M",
      doi: "",
      url: "https://power.larc.nasa.gov",
    },
    power_sw: {
      name_zh: "NASA POWER 月資料全天空地面短波向下輻射",
      name_en: "NASA POWER monthly all-sky surface shortwave downward irradiance",
      short: "POWER",
      version: "",
      param: "ALLSKY_SFC_SW_DWN",
      doi: "",
      url: "https://power.larc.nasa.gov",
    },
    giovanni_gldas_gws: {
      name_zh: "NASA Giovanni GLDAS CLSM 結合 GRACE 資料同化的地下水儲量",
      name_en: "NASA Giovanni GLDAS CLSM groundwater storage with GRACE data assimilation",
      short: "GLDAS_CLSM025_DA1_D",
      version: "2.2",
      param: "GWS_tavg",
      doi: "10.5067/TXBMLX370XX8",
    },
    giovanni_oco2: {
      name_zh: "NASA Giovanni OCO-2 GEOS 第三級每日同化二氧化碳柱平均濃度",
      name_en: "NASA Giovanni OCO-2 GEOS Level 3 daily assimilated column-average CO2",
      short: "OCO2_GEOS_L3CO2_DAY",
      version: "10r",
      param: "XCO2",
      doi: "10.5067/Y9M4NM9MPCGH",
    },
  };
  return map[source] || null;
}

function officialSourceLabel(source, lang) {
  const meta = officialSourceMeta(source);
  if (!meta) return lang === "zh" ? "現有觀測序列" : "the available observed series";
  return lang === "zh" ? meta.name_zh : meta.name_en;
}

function bundleFor(place, variable) {
  const spec = varSpec(variable);
  return {
    tr: place[spec.field],
    everyday: place[spec.everyday],
    key: spec.key,
    kind: spec.kind,
    unit: spec.unit,
    digits: spec.digits,
    slopeDigits: spec.slopeDigits,
    source: place[spec.sourceField] || spec.defaultSource,
  };
}

function placeLabel(place, lang) {
  if (place?.city) return cityName(place.city, lang);
  if (place?.label) return place.label;
  return lang === "zh" ? "這裡" : "This place";
}

function annualPeriodMeans(place, key, firstYear, lastYear) {
  const pts = (place.annual || [])
    .filter((r) => r[key] != null && Number.isFinite(r[key]))
    .filter((r) => (firstYear == null || r.year >= firstYear) && (lastYear == null || r.year <= lastYear))
    .sort((a, b) => a.year - b.year);
  if (pts.length < 16) return null;
  const first = pts.slice(0, 10);
  const last = pts.slice(-10);
  if (first[first.length - 1].year >= last[0].year) return null;
  const mean = (xs) => xs.reduce((s, p) => s + p[key], 0) / xs.length;
  return {
    baseline_years: [first[0].year, first[first.length - 1].year],
    recent_years: [last[0].year, last[last.length - 1].year],
    period_mean_baseline: mean(first),
    period_mean_recent: mean(last),
  };
}

function yearsSpan(tr) {
  if (!tr?.first_year || !tr?.last_year) return "";
  return `${tr.first_year}–${tr.last_year}`;
}

function approxCount(v) {
  if (v == null || Number.isNaN(v)) return null;
  const r = Math.round(v * 10) / 10;
  if (Math.abs(r - Math.round(r)) < 0.05) return String(Math.round(r));
  return r.toFixed(1);
}

function sourceDetails(source, lang, tr) {
  const meta = officialSourceMeta(source);
  const span = yearsSpan(tr);
  const p = tr ? fmtP(tr.mk_p) : null;
  const dec = tr?.sen_slope_per_decade;
  const parts = [];
  if (lang === "zh") {
    if (meta) {
      let s = `資料：${meta.name_zh}`;
      if (meta.short) s += `，短名 ${meta.short}${meta.version ? " " + meta.version : ""}`;
      if (meta.param) s += `，變數 ${meta.param}`;
      if (meta.doi) s += `，DOI ${meta.doi}`;
      if (meta.url) s += `，網址 ${meta.url}`;
      s += "。";
      parts.push(s);
    }
    if (span) parts.push(`期間 ${span}。`);
    if (dec != null) parts.push(`Sen 斜率為每十年 ${dec >= 0 ? "+" : "−"}${fmtDec(Math.abs(dec), Math.abs(dec) >= 10 ? 0 : 2)}。`);
    if (p) parts.push(`Mann–Kendall ${p}（α = 0.05）。`);
  } else {
    if (meta) {
      let s = `Source: ${meta.name_en}`;
      if (meta.short) s += `; short name ${meta.short}${meta.version ? " " + meta.version : ""}`;
      if (meta.param) s += `; variable ${meta.param}`;
      if (meta.doi) s += `; DOI ${meta.doi}`;
      if (meta.url) s += `; URL ${meta.url}`;
      s += ".";
      parts.push(s);
    }
    if (span) parts.push(`Period ${span}.`);
    if (dec != null) parts.push(`Sen's slope is ${dec >= 0 ? "+" : "−"}${fmtDec(Math.abs(dec), Math.abs(dec) >= 10 ? 0 : 2)} per decade.`);
    if (p) parts.push(`Mann–Kendall ${p} (α = 0.05).`);
  }
  return parts.join(lang === "zh" ? "" : " ");
}

function recordYears(tr) {
  if (!tr || tr.first_year == null || tr.last_year == null) return 0;
  return tr.last_year - tr.first_year + 1;
}

function companionTrend(place, variable) {
  if (!place) return null;
  if (variable === "precip" && place.precip_power && place.precip_source && place.precip_source !== "power") {
    return { tr: place.precip_power, source: "power", annual: place.annual_power || null, key: "precip_mm" };
  }
  if (variable === "temp" && place.temp_power && place.temp_source && place.temp_source !== "power") {
    return { tr: place.temp_power, source: "power", annual: place.annual_power || null, key: "t2m" };
  }
  if (variable === "humidity" && place.humidity_power && place.humidity_source && place.humidity_source !== "power_qv") {
    return { tr: place.humidity_power, source: "power_qv", annual: place.annual || null, key: "qv2m_power" };
  }
  return null;
}

function sourcesDisagree(place, variable) {
  const b = bundleFor(place, variable);
  const alt = companionTrend(place, variable);
  if (!b.tr || !alt || !alt.tr) return false;
  const a = b.tr.sen_slope_per_decade;
  const c = alt.tr.sen_slope_per_decade;
  if (a == null || c == null) return false;
  const sa = Math.sign(a);
  const sc = Math.sign(c);
  return sa !== 0 && sc !== 0 && sa !== sc;
}

function canShowStatProjection(place, variable) {
  const b = bundleFor(place, variable);
  if (!b.tr || b.kind === "co2" || b.kind === "precip" || b.tr.short_record) return false;
  if (b.tr.confidence !== "clear") return false;
  if (recordYears(b.tr) < 30) return false;
  if (sourcesDisagree(place, variable)) return false;
  return true;
}

function inferenceWrap(body, lang) {
  if (!body) return "";
  const trimmed = String(body).trim().replace(/[。.]+$/, "");
  return lang === "zh"
    ? `推論：${trimmed}。（僅供參考，請自行判斷）`
    : `Our reading: ${trimmed}. (an inference, judge for yourself)`;
}

function unknownNow(lang) {
  return lang === "zh" ? "目前資料看不出來，我們不知道。" : "The data do not show this, so we don't know.";
}

function unknownFuture(lang) {
  return lang === "zh" ? "目前資料看不出來，我們不知道未來會怎麼走。" : "The data do not show this, and we don't know how it will change.";
}

function qtyLabel(kind, lang) {
  if (lang === "zh") {
    if (kind === "temp") return "年平均氣溫";
    if (kind === "precip") return "年雨量";
    if (kind === "humidity") return "空氣比濕";
    if (kind === "soil") return "表土濕度";
    if (kind === "groundwater") return "地下水儲量";
    if (kind === "radiation") return "地面太陽短波輻射";
    if (kind === "co2") return "大氣二氧化碳柱平均濃度";
    return "這個量";
  }
  if (kind === "temp") return "annual mean temperature";
  if (kind === "precip") return "annual rainfall";
  if (kind === "humidity") return "specific humidity";
  if (kind === "soil") return "soil moisture";
  if (kind === "groundwater") return "groundwater storage";
  if (kind === "radiation") return "surface solar shortwave radiation";
  if (kind === "co2") return "column-average carbon dioxide";
  return "this quantity";
}

function unitFor(kind) {
  if (kind === "temp") return "°C";
  if (kind === "precip" || kind === "groundwater") return "mm";
  if (kind === "humidity") return "g/kg";
  if (kind === "soil") return "kg/m²";
  if (kind === "radiation") return "MJ/m²/day";
  if (kind === "co2") return "ppm";
  return "";
}

function slopeDigitsFor(kind) {
  if (kind === "precip") return 0;
  if (kind === "co2" || kind === "groundwater") return 1;
  return 2;
}

function meanDigitsFor(kind) {
  if (kind === "precip") return 0;
  if (kind === "co2") return 1;
  return 1;
}

function changeWords(kind, up, lang) {
  if (lang === "zh") {
    if (kind === "temp") return up ? "升溫" : "降溫";
    return up ? "增加" : "減少";
  }
  if (kind === "temp") return up ? "warmed" : "cooled";
  return up ? "risen" : "fallen";
}

function periodMeansFromAnnual(annual, key, firstYear, lastYear) {
  const pts = (annual || [])
    .filter((r) => r[key] != null && Number.isFinite(r[key]))
    .filter((r) => (firstYear == null || r.year >= firstYear) && (lastYear == null || r.year <= lastYear))
    .sort((a, b) => a.year - b.year);
  if (pts.length < 16) return null;
  const first = pts.slice(0, 10);
  const last = pts.slice(-10);
  if (first[first.length - 1].year >= last[0].year) return null;
  const mean = (xs) => xs.reduce((s, p) => s + p[key], 0) / xs.length;
  return {
    baseline_years: [first[0].year, first[first.length - 1].year],
    recent_years: [last[0].year, last[last.length - 1].year],
    period_mean_baseline: mean(first),
    period_mean_recent: mean(last),
  };
}

function shortMeansFromAnnual(annual, key, firstYear, lastYear) {
  const pts = (annual || [])
    .filter((r) => r[key] != null && Number.isFinite(r[key]))
    .filter((r) => (firstYear == null || r.year >= firstYear) && (lastYear == null || r.year <= lastYear))
    .sort((a, b) => a.year - b.year);
  if (pts.length < 2) return null;
  const first = pts[0];
  const last = pts[pts.length - 1];
  return {
    baseline_years: [first.year, first.year],
    recent_years: [last.year, last.year],
    period_mean_baseline: first[key],
    period_mean_recent: last[key],
    short: true,
  };
}

function meansForTrend(annual, key, tr) {
  if (!tr) return null;
  return periodMeansFromAnnual(annual, key, tr.first_year, tr.last_year)
    || shortMeansFromAnnual(annual, key, tr.first_year, tr.last_year);
}

function formatMeans(fb, unit, lang, dgt) {
  if (!fb) return "";
  const a0 = fmtDec(fb.period_mean_baseline, dgt);
  const a1 = fmtDec(fb.period_mean_recent, dgt);
  const same = (y) => y && y[0] === y[1];
  const s0 = fb.baseline_years
    ? (same(fb.baseline_years) ? String(fb.baseline_years[0]) : `${fb.baseline_years[0]}–${fb.baseline_years[1]}`)
    : "";
  const s1 = fb.recent_years
    ? (same(fb.recent_years) ? String(fb.recent_years[0]) : `${fb.recent_years[0]}–${fb.recent_years[1]}`)
    : "";
  if (lang === "zh") {
    const y0 = s0 ? `${s0} 年約 ${a0} ${unit}` : `以前約 ${a0} ${unit}`;
    const y1 = s1 ? `${s1} 年約 ${a1} ${unit}` : `現在約 ${a1} ${unit}`;
    return `${y0}，後來 ${y1}`;
  }
  const y0 = s0 ? `about ${a0} ${unit} in ${s0}` : `about ${a0} ${unit} then`;
  const y1 = s1 ? `about ${a1} ${unit} in ${s1}` : `about ${a1} ${unit} now`;
  return `${y0}, then ${y1}`;
}

function formatTrendFact(tr, source, kind, lang) {
  if (!tr || tr.sen_slope_per_decade == null) return "";
  const src = officialSourceLabel(source, lang);
  const span = yearsSpan(tr);
  const dec = tr.sen_slope_per_decade;
  const up = dec >= 0;
  const abs = fmtDec(Math.abs(dec), slopeDigitsFor(kind));
  const unit = unitFor(kind);
  const qty = qtyLabel(kind, lang);
  const clear = tr.confidence === "clear";
  if (lang === "zh") {
    const verb = changeWords(kind, up, lang);
    const conf = clear ? "統計上趨勢清楚" : "統計上趨勢不清楚";
    return `${src}${span ? "（" + span + " 年）" : ""}的${qty}每 10 年大約${verb} ${abs} ${unit}，${conf}。`;
  }
  const verb = changeWords(kind, up, lang);
  const conf = clear ? "The trend is statistically clear" : "The trend is not statistically clear";
  return `${src}${span ? " (" + span + ")" : ""}: ${qty} has ${verb} by about ${abs} ${unit} per decade. ${conf}.`;
}

function sourceNatureNote(kind, lang) {
  if (kind === "groundwater") {
    return lang === "zh"
      ? "這是模式同化的儲量（毫米水當量），不是水井實測。"
      : "This is modelled, assimilated storage in mm of water equivalent, not a well measurement.";
  }
  if (kind === "co2") {
    return lang === "zh"
      ? "這是同化網格值，不是市區測站。"
      : "This is an assimilated grid-cell value, not a city station.";
  }
  return "";
}

function findingInference(place, variable, lang) {
  const b = bundleFor(place, variable);
  const alt = companionTrend(place, variable);
  if (sourcesDisagree(place, variable) && b.kind === "precip") {
    const imerg = b.tr;
    const power = alt.tr;
    const down = imerg.sen_slope_per_decade < 0;
    if (lang === "zh") {
      return `GPM IMERG 自 ${imerg.first_year} 年起顯示雨量${down ? "下降" : "上升"}，POWER 自 ${power.first_year} 年起沒有確認長期${down ? "下降" : "上升"}；我們傾向認為近 20 年看起來${down ? "較乾" : "較濕"}，但較長的紀錄沒有確認這是長期趨勢。`;
    }
    return `GPM since ${imerg.first_year} shows a rainfall ${down ? "decline" : "rise"}, and POWER since ${power.first_year} does not confirm a long-term ${down ? "decline" : "increase"}; we lean that the recent 20 years were ${down ? "drier" : "wetter"}, but the longer record does not confirm a long-term ${down ? "decline" : "increase"}.`;
  }
  if (sourcesDisagree(place, variable)) {
    return lang === "zh"
      ? "兩筆 NASA 資料方向不一樣，我們沒有足夠理由判定哪一筆代表長期趨勢。"
      : "the two NASA sources point in different directions, and we do not have a sufficient basis to say which one is the long-term trend";
  }
  if (!b.tr || b.tr.sen_slope_per_decade == null) return "";
  if (b.tr.confidence !== "clear") return "";
  const up = b.tr.sen_slope_per_decade >= 0;
  const qty = qtyLabel(b.kind, lang);
  if (alt && alt.tr && alt.tr.confidence === "clear" && Math.sign(alt.tr.sen_slope_per_decade) === Math.sign(b.tr.sen_slope_per_decade)) {
    if (lang === "zh") {
      const dir = b.kind === "temp" ? (up ? "氣溫在上升" : "氣溫在下降") : `這裡的${qty}在${up ? "增加" : "減少"}`;
      return `兩筆資料方向相同，我們傾向認為${dir}。`;
    }
    return `both sources point the same way, so we lean that ${qty} here is ${up ? "rising" : "falling"}`;
  }
  if (b.kind === "co2") {
    return lang === "zh"
      ? "這段較短的紀錄顯示濃度在上升，但年數很少，不能當成長期趨勢的完整證據。"
      : "this short record shows the concentration rising, but the series is too brief to treat as complete evidence of the long-term trend";
  }
  if (lang === "zh") {
    if (b.kind === "temp") return `我們傾向認為這裡的氣溫在${up ? "上升" : "下降"}。`;
    return `我們傾向認為這裡的${qty}在${up ? "增加" : "減少"}。`;
  }
  if (b.kind === "temp") return `we lean that temperatures here are ${up ? "rising" : "falling"}`;
  return `we lean that ${qty} here is ${up ? "rising" : "falling"}`;
}

function findingText(place, variable, lang, globalTrend, opts) {
  opts = opts || {};
  const b = bundleFor(place, variable);
  const name = placeLabel(place, lang);
  if (!b.tr || b.tr.sen_slope_per_decade == null) {
    return lang === "zh"
      ? `${name}目前沒有這項資料，我們不知道。`
      : `${name}: there is no data for this, so we don't know.`;
  }
  const alt = companionTrend(place, variable);
  const parts = [];
  if (lang === "zh") parts.push(`${name}。`);
  else parts.push(`${name}.`);
  parts.push(formatTrendFact(b.tr, b.source, b.kind, lang));
  if (alt && alt.tr && alt.tr.sen_slope_per_decade != null) {
    parts.push(formatTrendFact(alt.tr, alt.source, b.kind, lang));
  }
  const note = sourceNatureNote(b.kind, lang);
  if (note) parts.push(note);
  const disagree = sourcesDisagree(place, variable);
  const anyClear = b.tr.confidence === "clear" || (alt && alt.tr && alt.tr.confidence === "clear" && !disagree);
  if (disagree) {
    parts.push(lang === "zh" ? "兩筆 NASA 資料結果不一樣。" : "The two NASA sources disagree.");
  } else if (!anyClear) {
    parts.push(unknownNow(lang));
  }
  const infer = findingInference(place, variable, lang);
  if (infer) parts.push(inferenceWrap(infer, lang));
  return parts.filter(Boolean).join(lang === "zh" ? "" : " ");
}

function findingDetails(place, variable, lang, globalTrend, opts) {
  const b = bundleFor(place, variable);
  let s = sourceDetails(b.source, lang, b.tr);
  const alt = companionTrend(place, variable);
  if (alt && alt.tr) {
    s += (lang === "zh" ? "" : " ") + sourceDetails(alt.source, lang, alt.tr);
  }
  const note = sourceNatureNote(b.kind, lang);
  if (note) s += (lang === "zh" ? "" : " ") + note;
  return s;
}

function meaningText(place, variable, lang) {
  const b = bundleFor(place, variable);
  if (!b.tr || b.tr.sen_slope_per_decade == null) return unknownNow(lang);

  const chunks = [];
  const unit = unitFor(b.kind);
  const dgt = meanDigitsFor(b.kind);
  const fb = meansForTrend(place.annual, b.key, b.tr);
  if (fb) {
    const lead = lang === "zh"
      ? `${qtyLabel(b.kind, lang)}：`
      : `${qtyLabel(b.kind, lang).charAt(0).toUpperCase() + qtyLabel(b.kind, lang).slice(1)}: `;
    chunks.push(lead + formatMeans(fb, unit, lang, dgt) + (lang === "zh" ? "。" : "."));
  }

  const alt = companionTrend(place, variable);
  if (alt && alt.tr) {
    const altMeans = meansForTrend(alt.annual, alt.key, alt.tr);
    if (altMeans) {
      const src = officialSourceLabel(alt.source, lang);
      if (lang === "zh") chunks.push(`${src}：` + formatMeans(altMeans, unit, lang, dgt) + "。");
      else chunks.push(`${src}: ` + formatMeans(altMeans, unit, lang, dgt) + ".");
    }
  }

  if (b.kind === "humidity" && place.rh && place.rh.sen_slope_per_decade != null) {
    const rhMeans = meansForTrend(place.annual, "rh2m", place.rh);
    if (rhMeans) {
      if (lang === "zh") chunks.push("相對濕度：" + formatMeans(rhMeans, "%", lang, 1) + "。");
      else chunks.push("Relative humidity: " + formatMeans(rhMeans, "%", lang, 1) + ".");
    } else {
      const dec = place.rh.sen_slope_per_decade;
      const abs = fmtDec(Math.abs(dec), 2);
      if (lang === "zh") chunks.push(`相對濕度每 10 年大約${dec >= 0 ? "上升" : "下降"} ${abs}%。`);
      else chunks.push(`Relative humidity has ${dec >= 0 ? "risen" : "fallen"} by about ${abs}% per decade.`);
    }
    const qvUp = b.tr.sen_slope_per_decade > 0;
    const rhDown = place.rh.sen_slope_per_decade < 0;
    if (qvUp && rhDown) {
      const infer = lang === "zh"
        ? "比濕上升而相對濕度下降，有可能是因為氣溫上升後空氣可容納的水氣變多，相對濕度不一定跟著升。"
        : "specific humidity can rise while relative humidity falls if the air warms and can hold more moisture";
      chunks.push(inferenceWrap(infer, lang));
    }
  }

  if (!chunks.length) return unknownNow(lang);
  return chunks.join(lang === "zh" ? "" : " ");
}

function meaningDetails(place, variable, lang) {
  const b = bundleFor(place, variable);
  const fb = meansForTrend(place.annual, b.key, b.tr);
  const parts = [];
  if (fb && fb.baseline_years && fb.recent_years) {
    const dgt = meanDigitsFor(b.kind);
    if (lang === "zh") {
      parts.push(`這是 ${fb.baseline_years[0]}–${fb.baseline_years[1]} 與 ${fb.recent_years[0]}–${fb.recent_years[1]} 完整年年平均的比較，只使用觀測（${fmtDec(fb.period_mean_baseline, dgt)} ${unitFor(b.kind)} 對 ${fmtDec(fb.period_mean_recent, dgt)} ${unitFor(b.kind)}）。`);
    } else {
      parts.push(`This compares complete-year annual means for ${fb.baseline_years[0]}–${fb.baseline_years[1]} and ${fb.recent_years[0]}–${fb.recent_years[1]} (${fmtDec(fb.period_mean_baseline, dgt)} ${unitFor(b.kind)} vs ${fmtDec(fb.period_mean_recent, dgt)} ${unitFor(b.kind)}), using observations only.`);
    }
  }
  parts.push(sourceDetails(b.source, lang, b.tr));
  const alt = companionTrend(place, variable);
  if (alt && alt.tr) parts.push(sourceDetails(alt.source, lang, alt.tr));
  return parts.filter(Boolean).join(lang === "zh" ? "" : " ");
}

function tipText(place, variable, lang) {
  const b = bundleFor(place, variable);
  if (!b.tr || b.tr.sen_slope_per_decade == null) return "";
  if (b.tr.confidence !== "clear") return "";
  if (sourcesDisagree(place, variable)) return "";
  const tag = lang === "zh"
    ? "這只是一般參考，不是醫療或防災指示。"
    : "This is general reference advice, not medical or emergency advice.";
  if (b.kind === "temp") {
    return lang === "zh"
      ? `外出時可留意遮陰與補水。${tag}`
      : `When outdoors, it is sensible to use shade and drink water. ${tag}`;
  }
  if (b.kind === "radiation") {
    return lang === "zh"
      ? `外出時可留意防晒與遮陰。${tag}`
      : `When outdoors, it is sensible to use shade and sun protection. ${tag}`;
  }
  return "";
}

function tipDetails(place, variable, lang) {
  if (!tipText(place, variable, lang)) return "";
  return lang === "zh"
    ? "此建議只是一般生活參考，不是醫療、法律或防災指令，請以當地氣象與主管機關資訊為準。"
    : "This is general reference only, not medical, legal, or emergency advice. Please follow local weather and official updates.";
}

function nexBundle(place, variable) {
  if (!place.nex) return null;
  if (variable === "temp") return place.nex.temp || null;
  return null;
}

function lastNexPoint(series) {
  if (!series || !series.length) return null;
  return series[series.length - 1];
}

function outlookDelta(b) {
  const proj = b.tr && b.tr.projection;
  if (!b.tr) return null;
  if (b.tr.sen_slope_per_year != null && proj && proj.years_ahead != null) {
    return b.tr.sen_slope_per_year * proj.years_ahead;
  }
  if (proj && proj.delta_from_last != null) return proj.delta_from_last;
  return null;
}

function nexRangeText(place, variable, lang) {
  const nex = nexBundle(place, variable);
  if (!nex || !(nex.ssp245?.length || nex.ssp585?.length)) return "";
  const b = bundleFor(place, variable);
  const unit = unitFor(b.kind);
  const dgt = slopeDigitsFor(b.kind);
  const base = nex.obs_baseline;
  const years = nex.baseline_years ? `${nex.baseline_years[0]}–${nex.baseline_years[1]}` : (lang === "zh" ? "基準期" : "the baseline");
  const desc = (label, pt) => {
    if (!pt) return "";
    const d = base != null ? pt.mean - base : null;
    let t0 = "";
    if (lang === "zh") {
      t0 = `${label} 到約 ${pt.year} 年`;
      if (d != null) t0 += `相對 ${years} 約${d >= 0 ? "增加" : "減少"} ${fmtDec(Math.abs(d), dgt)} ${unit}`;
      else t0 += `約 ${fmtDec(pt.mean, dgt)} ${unit}`;
      if (pt.min != null && pt.max != null) t0 += `（模式範圍 ${fmtDec(pt.min, dgt)}–${fmtDec(pt.max, dgt)} ${unit}，${pt.n_models || "?"} 個模式）`;
    } else {
      t0 = `${label} around ${pt.year}`;
      if (d != null) t0 += ` is about ${fmtDec(Math.abs(d), dgt)} ${unit} ${d >= 0 ? "above" : "below"} ${years}`;
      else t0 += ` is about ${fmtDec(pt.mean, dgt)} ${unit}`;
      if (pt.min != null && pt.max != null) t0 += ` (model range ${fmtDec(pt.min, dgt)}–${fmtDec(pt.max, dgt)} ${unit}, ${pt.n_models || "?"} models)`;
    }
    return t0;
  };
  const a = desc("SSP2-4.5", lastNexPoint(nex.ssp245));
  const c = desc("SSP5-8.5", lastNexPoint(nex.ssp585));
  if (lang === "zh") {
    return `NASA NEX-GDDP-CMIP6 模式：${[a, c].filter(Boolean).join("；")}。`;
  }
  return `NASA NEX-GDDP-CMIP6 models: ${[a, c].filter(Boolean).join("; ")}.`;
}

function outlookText(place, variable, lang) {
  const b = bundleFor(place, variable);

  if (b.kind === "precip") {
    const bits = [];
    if (sourcesDisagree(place, variable)) {
      bits.push(lang === "zh"
        ? "兩筆 NASA 降雨資料結果不一樣，我們不做 20 年統計外推。"
        : "The two NASA rainfall sources disagree, so we do not offer a 20-year statistical extrapolation.");
    } else {
      bits.push(lang === "zh"
        ? "降雨不做 20 年統計外推。"
        : "We do not offer a 20-year statistical extrapolation for rainfall.");
    }
    bits.push(unknownFuture(lang));
    return bits.join(lang === "zh" ? "" : " ");
  }

  if (b.kind === "co2" || b.tr?.short_record) {
    return (lang === "zh"
      ? "這段衛星紀錄偏短，我們不做外推。"
      : "This satellite record is short, so we do not offer an extrapolation. ") + unknownFuture(lang);
  }

  const parts = [];
  const nexText = nexRangeText(place, variable, lang);
  if (nexText) parts.push(nexText);

  if (canShowStatProjection(place, variable)) {
    const delta = outlookDelta(b);
    const unit = unitFor(b.kind);
    const dgt = slopeDigitsFor(b.kind);
    if (delta != null) {
      const abs = fmtDec(Math.abs(delta), dgt);
      if (lang === "zh") {
        const verb = b.kind === "temp" ? (delta >= 0 ? "升溫" : "降溫") : (delta >= 0 ? "增加" : "減少");
        parts.push(`在趨勢清楚、紀錄滿 30 年的前提下，依最後一個完整年的趨勢線做統計外推，往後 20 年大約再${verb} ${abs} ${unit}。這不是天氣預報。`);
      } else {
        const verb = b.kind === "temp"
          ? (delta >= 0 ? "more warming" : "cooling")
          : (delta >= 0 ? "more" : "less");
        parts.push(`Because the trend is statistically clear and the record is at least 30 years, a statistical extension from the trend line at the last complete year suggests about ${abs} ${unit} ${verb} over 20 years. This is not a weather forecast.`);
      }
    }
  }

  if (!parts.length) return unknownFuture(lang);

  if (nexText && canShowStatProjection(place, variable)) {
    const nex = nexBundle(place, variable);
    const p245 = lastNexPoint(nex && nex.ssp245);
    const base = nex && nex.obs_baseline;
    const d245 = p245 && base != null ? p245.mean - base : null;
    const delta = outlookDelta(b);
    if (d245 != null && delta != null && Math.sign(d245) === Math.sign(delta) && Math.sign(delta) !== 0) {
      const up = delta > 0;
      const infer = lang === "zh"
        ? `模式與長期觀測外推方向相同，我們傾向認為未來可能繼續${b.kind === "temp" ? (up ? "變暖" : "變涼") : (up ? "增加" : "減少")}。`
        : `the models and the long observational extension point the same way, so we lean that this may continue to ${b.kind === "temp" ? (up ? "warm" : "cool") : (up ? "rise" : "fall")}`;
      parts.push(inferenceWrap(infer, lang));
    }
  }
  return parts.join(lang === "zh" ? "" : " ");
}

function outlookDetails(place, variable, lang) {
  const b = bundleFor(place, variable);
  const parts = [];
  if (b.kind === "precip") {
    parts.push(lang === "zh"
      ? "降雨不做 20 年統計外推。GPM IMERG 紀錄較短，且可能與 NASA POWER（MERRA-2）結果不一致。"
      : "No 20-year statistical extrapolation is offered for rainfall. The GPM IMERG record is shorter and may disagree with NASA POWER (MERRA-2).");
  } else if (b.kind === "co2" || b.tr?.short_record) {
    parts.push(lang === "zh" ? "二氧化碳紀錄偏短，不提供外推。" : "The carbon dioxide record is short, so no extrapolation is offered.");
  } else if (canShowStatProjection(place, variable) && b.tr?.projection) {
    const proj = b.tr.projection;
    const dgt = slopeDigitsFor(b.kind);
    if (lang === "zh") {
      let s = `統計外推是依最後一個完整年的 Sen 趨勢線至約 ${proj.to_year} 年`;
      if (proj.delta_from_last != null) s += `，約${proj.delta_from_last >= 0 ? "增加" : "減少"} ${fmtDec(Math.abs(proj.delta_from_last), dgt)} ${unitFor(b.kind)}`;
      s += "。這不是氣候模式預報。";
      parts.push(s);
    } else {
      let s = `The statistical extension follows the Sen line from the last complete year to about ${proj.to_year}`;
      if (proj.delta_from_last != null) s += `, about ${fmtDec(Math.abs(proj.delta_from_last), dgt)} ${unitFor(b.kind)} ${proj.delta_from_last >= 0 ? "higher" : "lower"}`;
      s += ". It is not a climate-model forecast.";
      parts.push(s);
    }
  }
  const nex = nexBundle(place, variable);
  if (nex && (nex.ssp245?.length || nex.ssp585?.length)) {
    parts.push(lang === "zh"
      ? "模式展望為 NASA NEX-GDDP-CMIP6（Thrasher et al. 2022，DOI 10.7917/OFSG3345），已對齊觀測基準期，顯示多模式平均與範圍。"
      : "The model outlook is NASA NEX-GDDP-CMIP6 (Thrasher et al. 2022, DOI 10.7917/OFSG3345), bias-anchored to the observed baseline, showing the multi-model mean and range.");
  } else if (b.kind === "temp") {
    parts.push(lang === "zh"
      ? "NASA NEX-GDDP-CMIP6 的模式展望尚未載入此點。"
      : "NASA NEX-GDDP-CMIP6 projections have not been loaded for this point yet.");
  } else if (b.kind !== "precip" && b.kind !== "co2") {
    parts.push(lang === "zh"
      ? "此變數沒有對應的 NEX-GDDP-CMIP6 模式展望。"
      : "There is no matching NEX-GDDP-CMIP6 model outlook for this variable.");
  }
  return parts.join(lang === "zh" ? "" : " ");
}

function spokenYears(tr, lang) {
  if (!tr?.first_year || !tr?.last_year) return lang === "zh" ? "這些年來" : "over this period";
  const n = tr.last_year - tr.first_year;
  return lang === "zh" ? `這 ${n} 年來` : `over these ${n} years`;
}

function spokenAbs(v, digits) {
  if (v == null || Number.isNaN(v)) return "";
  return fmtDec(Math.abs(v), digits);
}

function inferenceSpeech(body, lang) {
  if (!body) return "";
  let trimmed = String(body).trim()
    .replace(/[。.]+$/g, "")
    .replace(/[（(]?僅供參考.*$/, "")
    .replace(/\(an inference.*$/i, "")
    .replace(/for reference only\.?$/i, "")
    .trim()
    .replace(/[。.]+$/g, "");
  return lang === "zh"
    ? `推論：${trimmed}，僅供參考。`
    : `Our reading: ${trimmed}. For reference only.`;
}

function unknownNowSpeech(lang) {
  return lang === "zh" ? "目前資料看不出來，我們不知道。" : "The data do not show this, so we don't know.";
}

function unknownFutureSpeech(lang) {
  return lang === "zh" ? "目前資料看不出來，我們不知道未來會怎麼走。" : "The data do not show this, and we don't know how it will change.";
}

function shortQty(kind, lang) {
  if (lang === "zh") {
    if (kind === "temp") return "氣溫";
    if (kind === "precip") return "雨量";
    if (kind === "humidity") return "空氣水氣";
    if (kind === "soil") return "土壤濕度";
    if (kind === "groundwater") return "地下水";
    if (kind === "radiation") return "日照";
    if (kind === "co2") return "二氧化碳";
    return "這個量";
  }
  if (kind === "temp") return "temperature";
  if (kind === "precip") return "rainfall";
  if (kind === "humidity") return "moisture in the air";
  if (kind === "soil") return "soil moisture";
  if (kind === "groundwater") return "groundwater";
  if (kind === "radiation") return "sunshine";
  if (kind === "co2") return "carbon dioxide";
  return "this quantity";
}

function periodPct(fb) {
  if (!fb || fb.period_mean_baseline == null || !Number.isFinite(fb.period_mean_baseline) || fb.period_mean_baseline === 0) return null;
  return ((fb.period_mean_recent - fb.period_mean_baseline) / Math.abs(fb.period_mean_baseline)) * 100;
}

function joinSpeech(parts, lang) {
  return parts.filter(Boolean).join(lang === "zh" ? "" : " ");
}

function bothSourcesAgree(place, variable) {
  const b = bundleFor(place, variable);
  const alt = companionTrend(place, variable);
  if (!b.tr || !alt || !alt.tr) return false;
  if (b.tr.sen_slope_per_decade == null || alt.tr.sen_slope_per_decade == null) return false;
  if (sourcesDisagree(place, variable)) return false;
  return b.tr.confidence === "clear" && alt.tr.confidence === "clear"
    && Math.sign(b.tr.sen_slope_per_decade) === Math.sign(alt.tr.sen_slope_per_decade);
}

function speechFindingInference(place, variable, lang) {
  const b = bundleFor(place, variable);
  const alt = companionTrend(place, variable);
  if (sourcesDisagree(place, variable) && b.kind === "precip") {
    const down = b.tr.sen_slope_per_decade < 0;
    if (lang === "zh") return down
      ? "近 20 年偏乾，但還不能說是長期趨勢"
      : "近 20 年偏濕，但還不能說是長期趨勢";
    return down
      ? "the recent 20 years were drier, but this is not yet a long-term trend"
      : "the recent 20 years were wetter, but this is not yet a long-term trend";
  }
  if (sourcesDisagree(place, variable)) return "";
  if (!b.tr || b.tr.sen_slope_per_decade == null || b.tr.confidence !== "clear") return "";
  const up = b.tr.sen_slope_per_decade >= 0;
  if (b.kind === "co2") {
    return lang === "zh"
      ? "濃度在上升，但紀錄太短，還不能當成長期趨勢"
      : "the concentration is rising, but the record is too short to treat as a long-term trend";
  }
  if (b.kind === "temp") {
    return lang === "zh"
      ? (up ? "氣溫在上升" : "氣溫在下降")
      : (up ? "temperatures are rising" : "temperatures are falling");
  }
  const qty = shortQty(b.kind, lang);
  if (lang === "zh") return `這裡的${qty}在${up ? "增加" : "減少"}`;
  return `${qty} here is ${up ? "rising" : "falling"}`;
}

function speechFinding(place, variable, lang) {
  const b = bundleFor(place, variable);
  const name = placeLabel(place, lang);
  if (!b.tr || b.tr.sen_slope_per_decade == null) {
    return lang === "zh"
      ? `${name}目前沒有這項資料，我們不知道。`
      : `${name}: there is no data for this, so we don't know.`;
  }
  const span = spokenYears(b.tr, lang);
  const slopeDigits = b.kind === "precip" ? 0 : 2;
  const abs = spokenAbs(b.tr.sen_slope_per_decade, slopeDigits);
  const unit = unitFor(b.kind);
  const verb = changeWords(b.kind, b.tr.sen_slope_per_decade >= 0, lang);
  const qty = shortQty(b.kind, lang);

  if (sourcesDisagree(place, variable) && b.kind === "precip") {
    const fb = meansForTrend(place.annual, b.key, b.tr);
    const pct = periodPct(fb);
    const years = b.tr.last_year - b.tr.first_year;
    const down = b.tr.sen_slope_per_decade < 0;
    const pctTxt = pct != null ? String(Math.round(Math.abs(pct))) : "";
    const spanRain = (years >= 20 && years < 30)
      ? (lang === "zh" ? "這 20 多年" : "over the past 20 years or so")
      : (lang === "zh" ? `這 ${years} 年` : `over these ${years} years`);
    let fact;
    if (lang === "zh") {
      const change = pctTxt
        ? `雨量${down ? "少" : "多"}了約 ${pctTxt}%`
        : `雨量${down ? "變少" : "變多"}`;
      fact = `衛星顯示${spanRain}${change}，但更長的 NASA 資料看不出變${down ? "少" : "多"}。`;
    } else {
      const change = pctTxt
        ? `rainfall has ${down ? "fallen" : "risen"} by about ${pctTxt}%`
        : `rainfall has ${down ? "fallen" : "risen"}`;
      fact = `Satellites show ${change} ${spanRain}, but the longer NASA record does not show a lasting ${down ? "decline" : "increase"}.`;
    }
    return joinSpeech([fact, inferenceSpeech(speechFindingInference(place, variable, lang), lang)], lang);
  }

  if (sourcesDisagree(place, variable)) {
    return lang === "zh"
      ? `${name}${span}，兩筆 NASA 資料方向不一樣，目前判斷不了，我們不知道。`
      : `${name}, ${span}, the two NASA records disagree, so we cannot tell, and we don't know.`;
  }

  if (b.kind === "co2") {
    const fb = meansForTrend(place.annual, b.key, b.tr) || shortMeansFromAnnual(place.annual, b.key, b.tr.first_year, b.tr.last_year);
    const dgt = meanDigitsFor(b.kind);
    let fact;
    if (fb) {
      const a0 = fmtDec(fb.period_mean_baseline, dgt);
      const a1 = fmtDec(fb.period_mean_recent, dgt);
      const y0 = fb.baseline_years ? fb.baseline_years[0] : b.tr.first_year;
      const y1 = fb.recent_years ? fb.recent_years[1] || fb.recent_years[0] : b.tr.last_year;
      fact = lang === "zh"
        ? `${name}從 ${y0} 年的約 ${a0} ppm，增加到 ${y1} 年的約 ${a1} ppm。這是 NASA 衛星的短紀錄。`
        : `In ${name}, NASA satellites show about ${a0} ppm in ${y0}, rising to about ${a1} ppm in ${y1}. This is a short record.`;
    } else {
      fact = lang === "zh"
        ? `${name}的二氧化碳，NASA 衛星顯示這段短紀錄在上升。`
        : `In ${name}, NASA satellites show carbon dioxide rising in this short record.`;
    }
    return joinSpeech([fact, inferenceSpeech(speechFindingInference(place, variable, lang), lang)], lang);
  }

  if (b.tr.confidence !== "clear") {
    return lang === "zh"
      ? `${name}${span}，目前資料看不出明確變化，我們不知道。`
      : `${name}, ${span}, the data do not show a clear change, so we don't know.`;
  }

  let fact;
  if (lang === "zh") {
    const src = bothSourcesAgree(place, variable) ? "兩筆 NASA 資料都這樣顯示" : "NASA 資料顯示";
    if (bothSourcesAgree(place, variable)) {
      fact = `${name}${span}，每 10 年大約${verb} ${abs} ${unit}，${src}。`;
    } else {
      fact = `${name}${span}，${src}每 10 年大約${verb} ${abs} ${unit}。`;
    }
  } else {
    const src = bothSourcesAgree(place, variable)
      ? "and both NASA records show this"
      : "according to the NASA data";
    if (bothSourcesAgree(place, variable)) {
      fact = `In ${name}, ${span}, ${qty} has ${verb} by about ${abs} ${unit} per decade, ${src}.`;
    } else {
      fact = `In ${name}, ${span}, ${qty} has ${verb} by about ${abs} ${unit} per decade, ${src}.`;
    }
  }
  return joinSpeech([fact, inferenceSpeech(speechFindingInference(place, variable, lang), lang)], lang);
}

function speechMeaning(place, variable, lang) {
  const b = bundleFor(place, variable);
  if (!b.tr || b.tr.sen_slope_per_decade == null) return unknownNowSpeech(lang);

  const unit = unitFor(b.kind);
  const dgt = meanDigitsFor(b.kind);
  const fb = meansForTrend(place.annual, b.key, b.tr);

  if (sourcesDisagree(place, variable) && b.kind === "precip") {
    if (!fb) return unknownNowSpeech(lang);
    const a0 = fmtDec(fb.period_mean_baseline, dgt);
    const a1 = fmtDec(fb.period_mean_recent, dgt);
    const down = fb.period_mean_recent < fb.period_mean_baseline;
    return lang === "zh"
      ? `衛星看到的年雨量，從約 ${a0} 毫米${down ? "降" : "升"}到約 ${a1} 毫米。較長的資料則看不出變${down ? "少" : "多"}。`
      : `Satellites show annual rainfall going from about ${a0} millimetres to about ${a1} millimetres. The longer record does not show a lasting ${down ? "decline" : "increase"}.`;
  }

  if (b.kind === "humidity") {
    const parts = [];
    if (fb) {
      const a0 = fmtDec(fb.period_mean_baseline, dgt);
      const a1 = fmtDec(fb.period_mean_recent, dgt);
      const pct = periodPct(fb);
      const up = fb.period_mean_recent >= fb.period_mean_baseline;
      if (lang === "zh") {
        let s = up
          ? `空氣水氣從約 ${a0} 增加到約 ${a1} 克每公斤`
          : `空氣水氣從約 ${a0} 減少到約 ${a1} 克每公斤`;
        if (pct != null) s += `，約${up ? "多" : "少"}了 ${Math.round(Math.abs(pct))}%`;
        s += "。";
        parts.push(s);
      } else {
        let s = `Moisture in the air went from about ${a0} to about ${a1} grams per kilogram`;
        if (pct != null) s += `, about ${Math.round(Math.abs(pct))}% ${up ? "higher" : "lower"}`;
        s += ".";
        parts.push(s);
      }
    }
    if (place.rh && place.rh.sen_slope_per_decade != null) {
      const rhMeans = meansForTrend(place.annual, "rh2m", place.rh);
      const qvUp = b.tr.sen_slope_per_decade > 0;
      const rhDown = place.rh.sen_slope_per_decade < 0;
      if (qvUp && rhDown) {
        parts.push(inferenceSpeech(
          lang === "zh"
            ? "相對濕度略降，可能是天氣變熱後空氣能裝的水氣變多"
            : "relative humidity fell a little, perhaps because warmer air can hold more moisture",
          lang
        ));
      } else if (rhMeans) {
        const r0 = fmtDec(rhMeans.period_mean_baseline, 1);
        const r1 = fmtDec(rhMeans.period_mean_recent, 1);
        parts.push(lang === "zh"
          ? `相對濕度從約 ${r0}% 到約 ${r1}%。`
          : `Relative humidity went from about ${r0}% to about ${r1}%.`);
      }
    }
    if (!parts.length) return unknownNowSpeech(lang);
    return joinSpeech(parts, lang);
  }

  if (b.kind === "co2") {
    const shortFb = fb || shortMeansFromAnnual(place.annual, b.key, b.tr.first_year, b.tr.last_year);
    if (!shortFb) return unknownNowSpeech(lang);
    const a0 = fmtDec(shortFb.period_mean_baseline, dgt);
    const a1 = fmtDec(shortFb.period_mean_recent, dgt);
    return lang === "zh"
      ? `從約 ${a0} ppm 增加到約 ${a1} ppm。這是一大片區域的平均，不是市區測站。`
      : `It rose from about ${a0} ppm to about ${a1} ppm. This is a large-area average, not a city station.`;
  }

  if (b.tr.confidence !== "clear") {
    return lang === "zh"
      ? `${shortQty(b.kind, lang)}目前看不出明確變化，我們不知道。`
      : `${shortQty(b.kind, lang)} does not show a clear change, so we don't know.`;
  }

  if (!fb) return unknownNowSpeech(lang);
  const a0 = fmtDec(fb.period_mean_baseline, dgt);
  const a1 = fmtDec(fb.period_mean_recent, dgt);
  const up = fb.period_mean_recent >= fb.period_mean_baseline;
  if (lang === "zh") {
    if (b.kind === "temp") return `年平均氣溫從約 ${a0} 度，${up ? "增加" : "減少"}到約 ${a1} 度。`;
    return `${shortQty(b.kind, lang)}從約 ${a0} ${unit}，${up ? "增加" : "減少"}到約 ${a1} ${unit}。`;
  }
  if (b.kind === "temp") return `Annual mean temperature went from about ${a0} degrees to about ${a1} degrees.`;
  return `${shortQty(b.kind, lang)} went from about ${a0} ${unit} to about ${a1} ${unit}.`;
}

function tipSpeech(place, variable, lang, opts) {
  opts = opts || {};
  const b = bundleFor(place, variable);
  if (!b.tr || b.tr.sen_slope_per_decade == null) return "";
  if (b.tr.confidence !== "clear") return "";
  if (sourcesDisagree(place, variable)) return "";
  const tag = lang === "zh"
    ? "這只是一般參考，不是醫療或防災指示。"
    : "This is general reference advice, not medical or emergency advice.";
  let body = "";
  if (b.kind === "temp") {
    body = lang === "zh" ? "外出時可留意遮陰與補水。" : "When outdoors, it is sensible to use shade and drink water.";
  } else if (b.kind === "radiation") {
    body = lang === "zh" ? "外出時可留意防晒與遮陰。" : "When outdoors, it is sensible to use shade and sun protection.";
  } else {
    return "";
  }
  if (opts.disclaimer === false) return body;
  return `${body}${lang === "zh" ? "" : " "}${tag}`;
}

function nexSpeechRange(place, variable, lang) {
  const nex = nexBundle(place, variable);
  if (!nex || !(nex.ssp245?.length || nex.ssp585?.length)) return "";
  const b = bundleFor(place, variable);
  const unit = unitFor(b.kind);
  const base = nex.obs_baseline;
  const deltas = [];
  let year = null;
  for (const key of ["ssp245", "ssp585"]) {
    const pt = lastNexPoint(nex[key]);
    if (!pt || base == null) continue;
    year = pt.year;
    deltas.push(pt.mean - base);
  }
  if (!deltas.length || year == null) return "";
  const lo = Math.min(...deltas.map(Math.abs));
  const hi = Math.max(...deltas.map(Math.abs));
  const up = deltas.every((d) => d >= 0) || Math.abs(deltas.reduce((a, c) => a + c, 0)) >= 0;
  const signedUp = deltas.filter((d) => d >= 0).length >= deltas.filter((d) => d < 0).length;
  const loTxt = fmtDec(Math.min(...deltas.map((d) => Math.abs(d))), 2);
  const hiTxt = fmtDec(Math.max(...deltas.map((d) => Math.abs(d))), 2);
  const verb = b.kind === "temp"
    ? (signedUp ? (lang === "zh" ? "升溫" : "further warming") : (lang === "zh" ? "降溫" : "cooling"))
    : (signedUp ? (lang === "zh" ? "增加" : "increase") : (lang === "zh" ? "減少" : "decrease"));
  const same = loTxt === hiTxt;
  if (lang === "zh") {
    if (b.kind === "temp") {
      return same
        ? `NASA 氣候模式估計到 ${year} 年可能再${verb}約 ${loTxt} ${unit}。`
        : `NASA 氣候模式估計到 ${year} 年可能再${verb}約 ${loTxt} 到 ${hiTxt} ${unit}。`;
    }
    return same
      ? `NASA 氣候模式估計到 ${year} 年可能再${verb}約 ${loTxt} ${unit}。`
      : `NASA 氣候模式估計到 ${year} 年可能再${verb}約 ${loTxt} 到 ${hiTxt} ${unit}。`;
  }
  if (b.kind === "temp") {
    return same
      ? `NASA climate models estimate about ${loTxt} ${unit} of ${verb} by ${year}.`
      : `NASA climate models estimate about ${loTxt} to ${hiTxt} ${unit} of ${verb} by ${year}.`;
  }
  return same
    ? `NASA climate models estimate about ${loTxt} ${unit} of ${verb} by ${year}.`
    : `NASA climate models estimate about ${loTxt} to ${hiTxt} ${unit} of ${verb} by ${year}.`;
}

function speechOutlook(place, variable, lang) {
  const b = bundleFor(place, variable);
  if (b.kind === "precip") {
    return lang === "zh"
      ? "降雨我們不做往後推估，目前不知道未來會怎麼走。"
      : "We do not extrapolate rainfall, and we don't know how it will change.";
  }
  if (b.kind === "co2" || b.tr?.short_record) {
    return lang === "zh"
      ? "這段衛星紀錄太短，我們不做往後推估，不知道未來會怎麼走。"
      : "This satellite record is too short to extrapolate, so we don't know how it will change.";
  }

  const nexText = nexSpeechRange(place, variable, lang);
  const parts = [];
  if (nexText) parts.push(nexText);
  else if (canShowStatProjection(place, variable)) {
    const delta = outlookDelta(b);
    if (delta != null) {
      const abs = spokenAbs(delta, slopeDigitsFor(b.kind) === 0 ? 0 : 2);
      const unit = unitFor(b.kind);
      if (lang === "zh") {
        const verb = b.kind === "temp" ? (delta >= 0 ? "升溫" : "降溫") : (delta >= 0 ? "增加" : "減少");
        parts.push(`依現在的趨勢往後推 20 年，大約再${verb} ${abs} ${unit}。這不是天氣預報。`);
      } else {
        const verb = b.kind === "temp"
          ? (delta >= 0 ? "more warming" : "cooling")
          : (delta >= 0 ? "more" : "less");
        parts.push(`Following the current trend for 20 years suggests about ${abs} ${unit} ${verb}. This is not a weather forecast.`);
      }
    }
  }

  if (!parts.length) return unknownFutureSpeech(lang);

  if (nexText && canShowStatProjection(place, variable)) {
    const nex = nexBundle(place, variable);
    const p245 = lastNexPoint(nex && nex.ssp245);
    const base = nex && nex.obs_baseline;
    const d245 = p245 && base != null ? p245.mean - base : null;
    const delta = outlookDelta(b);
    if (d245 != null && delta != null && Math.sign(d245) === Math.sign(delta) && Math.sign(delta) !== 0) {
      const up = delta > 0;
      const infer = lang === "zh"
        ? `未來可能繼續${b.kind === "temp" ? (up ? "變暖" : "變涼") : (up ? "增加" : "減少")}`
        : `this may continue to ${b.kind === "temp" ? (up ? "warm" : "cool") : (up ? "rise" : "fall")}`;
      parts.push(inferenceSpeech(infer, lang));
    }
  } else if (!nexText && canShowStatProjection(place, variable)) {
    const delta = outlookDelta(b);
    if (delta != null && Math.sign(delta) !== 0) {
      const up = delta > 0;
      const infer = lang === "zh"
        ? `這裡的${shortQty(b.kind, lang)}可能繼續${b.kind === "temp" ? (up ? "變暖" : "變涼") : (up ? "增加" : "減少")}`
        : `${shortQty(b.kind, lang)} here may continue to ${b.kind === "temp" ? (up ? "warm" : "cool") : (up ? "rise" : "fall")}`;
      parts.push(inferenceSpeech(infer, lang));
    }
  }
  return joinSpeech(parts, lang);
}


function spokenShortSource(source, lang) {
  const zh = {
    giovanni_merra2: "NASA 再分析資料",
    giovanni_imerg: "NASA 衛星觀測",
    giovanni_gldas: "NASA 陸面模式",
    power: "NASA POWER",
    giovanni_merra2_qv: "NASA 再分析資料",
    power_qv: "NASA POWER",
    power_rh: "NASA POWER",
    power_sw: "NASA POWER",
    giovanni_gldas_gws: "NASA 衛星觀測",
    giovanni_oco2: "NASA 衛星觀測",
  };
  const en = {
    giovanni_merra2: "NASA reanalysis data",
    giovanni_imerg: "NASA satellite observations",
    giovanni_gldas: "NASA land-surface model data",
    power: "NASA POWER",
    giovanni_merra2_qv: "NASA reanalysis data",
    power_qv: "NASA POWER",
    power_rh: "NASA POWER",
    power_sw: "NASA POWER",
    giovanni_gldas_gws: "NASA satellite observations",
    giovanni_oco2: "NASA satellite observations",
  };
  const pack = lang === "zh" ? zh : en;
  return pack[source] || (lang === "zh" ? "NASA 資料" : "NASA data");
}

function spokenSourceCite(place, variable, lang) {
  const b = bundleFor(place, variable);
  if (!b || (!b.source && !b.tr)) {
    return lang === "zh" ? "資料來源：NASA 資料。" : "Source: NASA data.";
  }
  const alt = companionTrend(place, variable);
  const primary = spokenShortSource(b.source, lang);
  if (alt && alt.tr && alt.source && alt.source !== b.source) {
    const second = spokenShortSource(alt.source, lang);
    if (primary === second) {
      return lang === "zh" ? `資料來源：${primary}。` : `Source: ${primary}.`;
    }
    return lang === "zh" ? `資料來源：${primary}和 ${second}。` : `Source: ${primary} and ${second}.`;
  }
  return lang === "zh" ? `資料來源：${primary}。` : `Source: ${primary}.`;
}

function spokenOutlookCite(place, variable, lang) {
  const nex = nexBundle(place, variable);
  if (nex && (nex.ssp245?.length || nex.ssp585?.length)) {
    return lang === "zh" ? "資料來源：NASA 氣候模式。" : "Source: NASA climate models.";
  }
  if (canShowStatProjection(place, variable)) {
    return lang === "zh" ? "資料來源：依前述 NASA 資料做統計外推。" : "Source: a statistical extension of the NASA record above.";
  }
  return spokenSourceCite(place, variable, lang);
}

function withSpokenCite(text, cite) {
  if (!cite) return text || "";
  if (text && (String(text).includes("資料來源：") || /\bSource:/.test(text))) return text;
  return joinSpeech([text, cite], /\bSource:/.test(cite) ? "en" : "zh");
}

function formalSeriesCitation(place, variable, lang) {
  const b = bundleFor(place, variable);
  const parts = [];
  const push = (source, tr) => {
    const label = officialSourceLabel(source, lang);
    const span = yearsSpan(tr);
    if (lang === "zh") parts.push(`${label}${span ? "（" + span + " 年）" : ""}`);
    else parts.push(`${label}${span ? " (" + span + ")" : ""}`);
  };
  if (b && (b.source || b.tr)) push(b.source, b.tr);
  const alt = companionTrend(place, variable);
  if (alt && alt.tr) push(alt.source, alt.tr);
  if (!parts.length) return lang === "zh" ? "資料：NASA 資料。" : "Source: NASA data.";
  return lang === "zh" ? `資料：${parts.join("；")}。` : `Source: ${parts.join("; ")}.`;
}

function formalOutlookCitation(place, variable, lang) {
  const base = formalSeriesCitation(place, variable, lang);
  const nex = nexBundle(place, variable);
  let extra = "";
  if (nex && (nex.ssp245?.length || nex.ssp585?.length)) {
    extra = lang === "zh"
      ? "模式展望：NASA NEX-GDDP-CMIP6（Thrasher et al. 2022，DOI 10.7917/OFSG3345）。"
      : "Model outlook: NASA NEX-GDDP-CMIP6 (Thrasher et al. 2022, DOI 10.7917/OFSG3345).";
  }
  return [base, extra].filter(Boolean).join(lang === "zh" ? "" : " ");
}

function chartSourceCaption(place, variable, lang) {
  return formalOutlookCitation(place, variable, lang);
}

function mapLayerShortCitation(variable, lang) {
  const lines = {
    temp: {
      zh: "MERRA-2 氣溫（1980–2025）",
      en: "MERRA-2 temperature (1980–2025)",
    },
    precip: { zh: "GPM IMERG（2001–2024）", en: "GPM IMERG (2001–2024)" },
    humidity: { zh: "MERRA-2 比濕（1980–2025）", en: "MERRA-2 specific humidity (1980–2025)" },
    soil: { zh: "GLDAS 土壤濕度（2000–2025）", en: "GLDAS soil moisture (2000–2025)" },
    groundwater: { zh: "GLDAS／GRACE 地下水（2003–2025）", en: "GLDAS/GRACE groundwater (2003–2025)" },
    radiation: { zh: "NASA POWER 輻射（1984–2025）", en: "NASA POWER radiation (1984–2025)" },
    co2: { zh: "OCO-2 XCO2（2015–2021）", en: "OCO-2 XCO2 (2015–2021)" },
  };
  const rec = lines[variable];
  if (!rec) return lang === "zh" ? "NASA 資料" : "NASA data";
  return rec[lang] || rec.zh;
}

function mapLayerCitation(variable, lang) {
  if (variable === "temp") {
    return lang === "zh"
      ? "圖層資料：各城市 NASA Giovanni MERRA-2 月平均 2 米氣溫（1980–2025 年）。"
      : "Layer source: city NASA Giovanni MERRA-2 monthly 2 m air temperature (1980–2025).";
  }
  const lines = {
    precip: {
      zh: "圖層資料：各城市 NASA Giovanni GPM IMERG Final 月降水（約 2001–2024 年；部分城市為 NASA POWER 1981–2025 年）。",
      en: "Layer source: city NASA Giovanni GPM IMERG Final monthly precipitation (about 2001–2024; some cities use NASA POWER 1981–2025).",
    },
    humidity: {
      zh: "圖層資料：各城市 NASA Giovanni MERRA-2 月平均 2 米比濕（1980–2025 年；部分城市為 NASA POWER）。",
      en: "Layer source: city NASA Giovanni MERRA-2 monthly 2 m specific humidity (1980–2025; some cities use NASA POWER).",
    },
    soil: {
      zh: "圖層資料：各城市 NASA Giovanni GLDAS Noah 0–10 公分土壤濕度（約 2000–2025 年）。",
      en: "Layer source: city NASA Giovanni GLDAS Noah 0–10 cm soil moisture (about 2000–2025).",
    },
    groundwater: {
      zh: "圖層資料：各城市 NASA Giovanni GLDAS／GRACE 地下水儲量（約 2003–2025 年）。",
      en: "Layer source: city NASA Giovanni GLDAS/GRACE groundwater storage (about 2003–2025).",
    },
    radiation: {
      zh: "圖層資料：各城市 NASA POWER 全天空地面短波向下輻射（約 1984–2025 年）。",
      en: "Layer source: city NASA POWER all-sky surface shortwave downward irradiance (about 1984–2025).",
    },
    co2: {
      zh: "圖層資料：各城市附近 NASA OCO-2 衛星二氧化碳柱平均濃度（約 2015–2021 年）。",
      en: "Layer source: nearby NASA OCO-2 satellite column-average carbon dioxide (about 2015–2021).",
    },
  };
  const rec = lines[variable];
  if (!rec) return lang === "zh" ? "圖層資料：NASA 資料。" : "Layer source: NASA data.";
  return rec[lang] || rec.zh;
}

function rankingSourceCitation(variable, lang) {
  const layer = mapLayerCitation(variable, lang).replace(/^圖層資料：/, "資料：").replace(/^Layer source: /, "Source: ");
  return layer;
}

function buildSoWhat(place, variable, lang, globalTrend, opts) {
  opts = opts || {};
  const tip = tipText(place, variable, lang);
  const seriesCite = formalSeriesCitation(place, variable, lang);
  const outlookCite = formalOutlookCitation(place, variable, lang);
  return {
    finding: {
      text: findingText(place, variable, lang, globalTrend, opts),
      details: findingDetails(place, variable, lang, globalTrend, opts),
      source: seriesCite,
      speech: withSpokenCite(speechFinding(place, variable, lang), spokenSourceCite(place, variable, lang)),
    },
    meaning: {
      text: meaningText(place, variable, lang),
      details: meaningDetails(place, variable, lang),
      source: seriesCite,
      speech: speechMeaning(place, variable, lang),
    },
    tip: {
      text: tip,
      details: tipDetails(place, variable, lang),
      source: tip ? seriesCite : "",
      speech: tip ? tipSpeech(place, variable, lang, { disclaimer: opts.spokenDisclaimer !== false }) : "",
    },
    outlook: {
      text: outlookText(place, variable, lang),
      details: outlookDetails(place, variable, lang),
      source: outlookCite,
      speech: withSpokenCite(speechOutlook(place, variable, lang), spokenOutlookCite(place, variable, lang)),
    },
  };
}
