/** Shared variable metadata for charts, map, cards, and the tour. */
const VAR_SPEC = {
  temp: {
    id: "temp",
    field: "temp",
    everyday: "everyday_temp",
    key: "t2m",
    kind: "temp",
    unit: "°C",
    digits: 2,
    slopeDigits: 2,
    chartDigits: 1,
    legendScale: 2.2,
    legendLo: "−2.2°C",
    legendMid: "0",
    legendHi: "+2.2°C",
    sourceField: "temp_source",
    defaultSource: "power",
  },
  precip: {
    id: "precip",
    field: "precip",
    everyday: "everyday_precip",
    key: "precip_mm",
    kind: "precip",
    unit: "mm",
    digits: 0,
    slopeDigits: 0,
    chartDigits: 0,
    legendScale: 150,
    legendLo: "−150",
    legendMid: "0",
    legendHi: "+150",
    sourceField: "precip_source",
    defaultSource: "power",
  },
  humidity: {
    id: "humidity",
    field: "humidity",
    everyday: "everyday_humidity",
    key: "qv2m",
    kind: "humidity",
    unit: "g/kg",
    digits: 2,
    slopeDigits: 2,
    chartDigits: 2,
    legendScale: 0.5,
    legendLo: "−0.5",
    legendMid: "0",
    legendHi: "+0.5",
    sourceField: "humidity_source",
    defaultSource: "giovanni_merra2_qv",
  },
  soil: {
    id: "soil",
    field: "soil",
    everyday: "everyday_soil",
    key: "soil",
    kind: "soil",
    unit: "kg/m²",
    digits: 2,
    slopeDigits: 2,
    chartDigits: 1,
    legendScale: 0.4,
    legendLo: "−0.4",
    legendMid: "0",
    legendHi: "+0.4",
    sourceField: "soil_source",
    defaultSource: "giovanni_gldas",
  },
  groundwater: {
    id: "groundwater",
    field: "groundwater",
    everyday: "everyday_groundwater",
    key: "gws",
    kind: "groundwater",
    unit: "mm",
    digits: 1,
    slopeDigits: 1,
    chartDigits: 0,
    legendScale: 40,
    legendLo: "−40",
    legendMid: "0",
    legendHi: "+40",
    sourceField: "groundwater_source",
    defaultSource: "giovanni_gldas_gws",
  },
  radiation: {
    id: "radiation",
    field: "radiation",
    everyday: "everyday_radiation",
    key: "sw",
    kind: "radiation",
    unit: "MJ/m²/day",
    digits: 2,
    slopeDigits: 2,
    chartDigits: 1,
    legendScale: 0.4,
    legendLo: "−0.4",
    legendMid: "0",
    legendHi: "+0.4",
    sourceField: "radiation_source",
    defaultSource: "power_sw",
  },
  co2: {
    id: "co2",
    field: "co2",
    everyday: "everyday_co2",
    key: "xco2",
    kind: "co2",
    unit: "ppm",
    digits: 1,
    slopeDigits: 1,
    chartDigits: 1,
    legendScale: 30,
    legendLo: "−30",
    legendMid: "0",
    legendHi: "+30",
    sourceField: "co2_source",
    defaultSource: "giovanni_oco2",
  },
};

function varSpec(variable) {
  return VAR_SPEC[variable] || VAR_SPEC.temp;
}

function trendOf(placeOrCity, variable) {
  if (!placeOrCity) return null;
  return placeOrCity[varSpec(variable).field] || null;
}

function hasTrendData(tr) {
  return !!(tr && tr.sen_slope_per_decade != null);
}

const TOUR_TOPIC_ORDER = ["temp", "precip", "humidity", "soil", "groundwater", "radiation", "co2", "events"];

function citySourceId(placeOrCity, variable) {
  const spec = varSpec(variable);
  return (placeOrCity && placeOrCity[spec.sourceField]) || spec.defaultSource;
}

function annualValue(placeOrCity, variable, year) {
  if (!placeOrCity || year == null) return null;
  const key = varSpec(variable).key;
  const rows = placeOrCity.annual || [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r.year === year && r[key] != null && Number.isFinite(r[key])) return r[key];
  }
  return null;
}

function isTrendSignificant(tr) {
  if (!tr) return false;
  if (tr.significant_005 != null) return !!tr.significant_005;
  return tr.confidence === "clear";
}

function variableYears(cities, variable) {
  const key = varSpec(variable).key;
  const set = new Set();
  for (const c of cities || []) {
    for (const r of c.annual || []) {
      if (r[key] != null && Number.isFinite(r[key])) set.add(r.year);
    }
  }
  return [...set].sort((a, b) => a - b);
}

function _percentile(sorted, p) {
  if (!sorted.length) return NaN;
  const i = (sorted.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.min(sorted.length - 1, lo + 1);
  const f = i - lo;
  return sorted[lo] * (1 - f) + sorted[hi] * f;
}

function niceNum(x) {
  if (!Number.isFinite(x) || x <= 0) return 1;
  const exp = Math.floor(Math.log10(x));
  const f = x / Math.pow(10, exp);
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nf * Math.pow(10, exp);
}

function collectAnnualValues(cities, variable) {
  const key = varSpec(variable).key;
  const vals = [];
  for (const c of cities || []) {
    for (const r of c.annual || []) {
      if (r[key] != null && Number.isFinite(r[key])) vals.push(r[key]);
    }
  }
  return vals;
}

function yearValueDomain(cities, variable) {
  const vals = collectAnnualValues(cities, variable).slice().sort((a, b) => a - b);
  if (!vals.length) return null;
  let lo = _percentile(vals, 0.02);
  let hi = _percentile(vals, 0.98);
  if (!(hi > lo)) {
    lo = vals[0];
    hi = vals[vals.length - 1];
  }
  if (!(hi > lo)) hi = lo + 1;
  return { lo, hi };
}

function trendValueDomain(cities, variable) {
  const slopes = [];
  for (const c of cities || []) {
    const sl = trendOf(c, variable)?.sen_slope_per_decade;
    if (sl != null && Number.isFinite(sl)) slopes.push(Math.abs(sl));
  }
  slopes.sort((a, b) => a - b);
  if (!slopes.length) return null;
  const raw = _percentile(slopes, 0.95) || slopes[slopes.length - 1] || 1;
  const scale = niceNum(raw);
  return { lo: -scale, hi: scale, scale };
}

const CLIM_BASELINE_LO = 1991;
const CLIM_BASELINE_HI = 2020;
const ANOMALY_PERCENT_VARS = { precip: true, humidity: true, soil: true, groundwater: true };

function usesPercentAnomaly(variable) {
  return !!ANOMALY_PERCENT_VARS[variable];
}

function anomalyUnit(variable) {
  return usesPercentAnomaly(variable) ? "%" : varSpec(variable).unit;
}

function anomalyDigits(variable) {
  if (usesPercentAnomaly(variable)) return variable === "precip" ? 0 : 1;
  if (variable === "co2") return 1;
  return 2;
}

function _annualPairs(placeOrCity, variable) {
  const key = varSpec(variable).key;
  const pairs = [];
  for (const r of placeOrCity.annual || []) {
    if (r[key] != null && Number.isFinite(r[key])) pairs.push({ year: r.year, value: r[key] });
  }
  return pairs;
}

const _baselineCache = new Map();

function cityBaseline(placeOrCity, variable) {
  if (!placeOrCity) return null;
  const id = placeOrCity.id || (placeOrCity.lat != null ? placeOrCity.lat + "," + placeOrCity.lon : "x");
  const n = (placeOrCity.annual || []).length;
  const cacheKey = id + ":" + variable + ":" + n;
  if (_baselineCache.has(cacheKey)) return _baselineCache.get(cacheKey);
  const pairs = _annualPairs(placeOrCity, variable);
  let rec = null;
  if (pairs.length) {
    const byYear = new Map(pairs.map((p) => [p.year, p.value]));
    let sum = 0;
    let ok = true;
    for (let y = CLIM_BASELINE_LO; y <= CLIM_BASELINE_HI; y++) {
      if (!byYear.has(y)) { ok = false; break; }
      sum += byYear.get(y);
    }
    if (ok) {
      rec = { mean: sum / 30, lo: CLIM_BASELINE_LO, hi: CLIM_BASELINE_HI, kind: "clim" };
    } else {
      const mean = pairs.reduce((s, p) => s + p.value, 0) / pairs.length;
      rec = { mean, lo: pairs[0].year, hi: pairs[pairs.length - 1].year, kind: "full" };
    }
  }
  _baselineCache.set(cacheKey, rec);
  return rec;
}

function anomalyOf(placeOrCity, variable, year) {
  const v = annualValue(placeOrCity, variable, year);
  const base = cityBaseline(placeOrCity, variable);
  if (v == null || !base || !Number.isFinite(base.mean)) return null;
  const abs = v - base.mean;
  const percent = base.mean !== 0 ? (abs / base.mean) * 100 : null;
  const usePercent = usesPercentAnomaly(variable);
  const value = usePercent ? percent : abs;
  if (value == null || !Number.isFinite(value)) return null;
  return {
    year,
    raw: v,
    baseline: base.mean,
    baselineLo: base.lo,
    baselineHi: base.hi,
    baselineKind: base.kind,
    abs,
    percent,
    value,
    usePercent,
  };
}

function formatAnomaly(v, variable) {
  if (v == null || !Number.isFinite(v)) return "—";
  const unit = anomalyUnit(variable);
  const digits = anomalyDigits(variable);
  const num = (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(digits);
  return unit === "%" ? num + "%" : num + " " + unit;
}

function baselineSpanForVariable(cities, variable) {
  let lo = null;
  let hi = null;
  for (const c of cities || []) {
    const b = cityBaseline(c, variable);
    if (!b) continue;
    if (lo == null) { lo = b.lo; hi = b.hi; }
    else if (b.lo !== lo || b.hi !== hi) {
      lo = Math.min(lo, b.lo);
      hi = Math.max(hi, b.hi);
    }
  }
  if (lo == null) return null;
  return { lo, hi };
}

function legendYearTitle(variable, lang, cities) {
  const names = {
    zh: { temp: "氣溫", precip: "降雨", humidity: "比濕", soil: "土壤濕度", groundwater: "地下水", radiation: "太陽輻射", co2: "XCO2" },
    en: { temp: "Temperature", precip: "Precipitation", humidity: "Specific humidity", soil: "Soil moisture", groundwater: "Groundwater", radiation: "Solar radiation", co2: "XCO2" },
  };
  const pack = names[lang] || names.zh;
  const name = pack[variable] || variable;
  const unit = anomalyUnit(variable);
  const span = baselineSpanForVariable(cities, variable);
  const years = span ? `${span.lo}–${span.hi}` : "";
  if (lang === "zh") return `${name}距平常（${unit}，相對 ${years}）`;
  return `${name} anomaly (${unit}, vs ${years})`;
}

function anomalyDomain(cities, variable) {
  const absVals = [];
  const key = varSpec(variable).key;
  for (const c of cities || []) {
    for (const r of c.annual || []) {
      if (r[key] == null || !Number.isFinite(r[key])) continue;
      const a = anomalyOf(c, variable, r.year);
      if (a && Number.isFinite(a.value)) absVals.push(Math.abs(a.value));
    }
  }
  absVals.sort((a, b) => a - b);
  if (!absVals.length) return null;
  const raw = _percentile(absVals, 0.95) || absVals[absVals.length - 1] || 1;
  const scale = niceNum(raw);
  return { lo: -scale, hi: scale, scale };
}

function rankingItems(cities, variable, opts) {
  opts = opts || {};
  const mode = opts.mode || "trend";
  const year = opts.year;
  const order = opts.order === "asc" ? "asc" : "desc";
  const items = [];
  for (const c of cities || []) {
    if (!c.capital) continue;
    if (mode === "year") {
      const a = anomalyOf(c, variable, year);
      if (!a) continue;
      items.push({ city: c, value: a.value, kind: "anomaly", anomaly: a });
    } else {
      const tr = trendOf(c, variable);
      if (!hasTrendData(tr)) continue;
      items.push({
        city: c,
        value: tr.sen_slope_per_decade,
        kind: "trend",
        significant: isTrendSignificant(tr),
      });
    }
  }
  items.sort((a, b) => (order === "asc" ? a.value - b.value : b.value - a.value));
  return items;
}
