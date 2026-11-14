function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dphi / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function nearestCity(cities, lat, lon) {
  let best = null;
  let bestD = Infinity;
  for (const c of cities) {
    const d = haversineKm(lat, lon, c.lat, c.lon);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return { city: best, km: bestD };
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function median(arr) {
  const a = [...arr].sort((x, y) => x - y);
  const n = a.length;
  if (!n) return NaN;
  return n % 2 ? a[(n - 1) / 2] : 0.5 * (a[n / 2 - 1] + a[n / 2]);
}

function theilSen(years, values) {
  const n = years.length;
  const slopes = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = years[j] - years[i];
      if (dx !== 0) slopes.push((values[j] - values[i]) / dx);
    }
  }
  const slope = median(slopes);
  const intercepts = values.map((y, i) => y - slope * years[i]);
  const intercept = median(intercepts);
  return { slope, intercept };
}

function kendallP(years, values) {
  const n = years.length;
  let S = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = Math.sign(values[j] - values[i]) * Math.sign(years[j] - years[i]);
      S += d;
    }
  }
  const uniq = new Map();
  values.forEach((v) => uniq.set(v, (uniq.get(v) || 0) + 1));
  let tie = 0;
  for (const t of uniq.values()) {
    if (t > 1) tie += t * (t - 1) * (2 * t + 5);
  }
  const varS = (n * (n - 1) * (2 * n + 5) - tie) / 18;
  let z = 0;
  if (S > 0) z = (S - 1) / Math.sqrt(varS);
  else if (S < 0) z = (S + 1) / Math.sqrt(varS);
  const p = 2 * (1 - normalCdf(Math.abs(z)));
  const tau = S / (0.5 * n * (n - 1));
  return { tau, p, S };
}

function normalCdf(x) {
  // Abramowitz and Stegun approximation
  const t = 1 / (1 + 0.2316419 * x);
  const d = 0.39894228 * Math.exp((-x * x) / 2);
  const p =
    d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return 1 - p;
}

function trendBlock(years, values, projYears = 20) {
  const pairs = years.map((y, i) => [y, values[i]]).filter(([, v]) => Number.isFinite(v) && Number.isFinite([].concat()[0] ?? 1));
  const ys = [];
  const vs = [];
  years.forEach((y, i) => {
    if (Number.isFinite(y) && Number.isFinite(values[i])) {
      ys.push(y);
      vs.push(values[i]);
    }
  });
  if (ys.length < 8) return null;
  const { slope, intercept } = theilSen(ys, vs);
  const { tau, p } = kendallP(ys, vs);
  const lastYear = ys[ys.length - 1];
  const lastValue = vs[vs.length - 1];
  const firstValue = vs[0];
  const fitted = vs.map((_, i) => intercept + slope * ys[i]);
  const resid = vs.map((v, i) => v - fitted[i]);
  const sse = resid.reduce((a, b) => a + b * b, 0);
  const sErr = Math.sqrt(sse / Math.max(ys.length - 2, 1));
  const z = 1.96;
  const band = z * sErr;
  const sig = p < 0.05;
  const direction = slope > 0 ? "up" : slope < 0 ? "down" : "flat";
  const toYear = lastYear + projYears;
  const series = [];
  for (let yr = lastYear; yr <= toYear; yr++) {
    const value = intercept + slope * yr;
    series.push({ year: yr, value, lo: value - band, hi: value + band });
  }
  const yh = intercept + slope * toYear;
  const fittedLast = intercept + slope * lastYear;
  const delta = yh - fittedLast; // slope * projYears; not last observed point
  return {
    n: ys.length,
    first_year: ys[0],
    last_year: lastYear,
    first_value: firstValue,
    last_value: lastValue,
    change_total: lastValue - firstValue,
    sen_slope_per_year: slope,
    sen_slope_per_decade: slope * 10,
    sen_intercept: intercept,
    mk_tau: tau,
    mk_p: p,
    significant_005: sig,
    confidence: sig && Math.abs(slope) >= 1e-8 ? "clear" : "unclear",
    direction,
    projection: {
      from_year: lastYear,
      to_year: toYear,
      years_ahead: projYears,
      value: yh,
      ci95: [yh - band, yh + band],
      baseline_fitted: fittedLast,
      delta_from_last: delta,
      delta_from_observed_last: yh - lastValue,
      series,
    },
  };
}

function collectPowerMonthly(paramObj) {
  const years = {};
  for (const [k, v] of Object.entries(paramObj || {})) {
    if (!/^\d{6}$/.test(k)) continue;
    const year = +k.slice(0, 4);
    const month = +k.slice(4);
    if (month === 13 || v === -999 || v == null || !Number.isFinite(Number(v))) continue;
    years[year] ??= {};
    years[year][month] = Number(v);
  }
  return years;
}

function annualMeanFromMonthly(monthsByYear) {
  const out = {};
  for (const year of Object.keys(monthsByYear).map(Number)) {
    const months = monthsByYear[year];
    let complete = true;
    const vals = [];
    for (let m = 1; m <= 12; m++) {
      if (months[m] == null) { complete = false; break; }
      vals.push(months[m]);
    }
    out[year] = complete ? vals.reduce((a, b) => a + b, 0) / 12 : null;
  }
  return out;
}

function annualPrecipFromMonthly(monthsByYear) {
  const out = {};
  for (const year of Object.keys(monthsByYear).map(Number)) {
    const months = monthsByYear[year];
    let complete = true;
    let total = 0;
    for (let m = 1; m <= 12; m++) {
      if (months[m] == null) { complete = false; break; }
      total += months[m] * daysInMonth(year, m);
    }
    out[year] = complete ? total : null;
  }
  return out;
}

function annualFromPower(payload) {
  const p = payload?.properties?.parameter || {};
  const t = annualMeanFromMonthly(collectPowerMonthly(p.T2M));
  const pr = annualPrecipFromMonthly(collectPowerMonthly(p.PRECTOTCORR));
  const qv = annualMeanFromMonthly(collectPowerMonthly(p.QV2M));
  const rh = annualMeanFromMonthly(collectPowerMonthly(p.RH2M));
  const sw = annualMeanFromMonthly(collectPowerMonthly(p.ALLSKY_SFC_SW_DWN));
  const yearSet = new Set([...Object.keys(t), ...Object.keys(pr), ...Object.keys(qv), ...Object.keys(rh), ...Object.keys(sw)].map(Number));
  return [...yearSet].sort((a, b) => a - b).map((year) => ({
    year,
    t2m: t[year] ?? null,
    precip_mm: pr[year] ?? null,
    qv2m: qv[year] ?? null,
    rh2m: rh[year] ?? null,
    sw: sw[year] ?? null,
  }));
}

function trendFromAnnual(annual, key) {
  const rows = (annual || []).filter((r) => r[key] != null && Number.isFinite(r[key]));
  return trendBlock(rows.map((r) => r.year), rows.map((r) => r[key]));
}

async function fetchPowerPoint(lat, lon) {
  const url =
    "https://power.larc.nasa.gov/api/temporal/monthly/point" +
    `?start=1981&end=2025&latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}` +
    "&community=ag&parameters=T2M,PRECTOTCORR,QV2M,RH2M,ALLSKY_SFC_SW_DWN&format=JSON";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error("POWER HTTP " + res.status);
    const json = await res.json();
    const annual = annualFromPower(json);
    return {
      annual,
      temp: trendFromAnnual(annual, "t2m"),
      precip: trendFromAnnual(annual, "precip_mm"),
      humidity: trendFromAnnual(annual, "qv2m"),
      rh: trendFromAnnual(annual, "rh2m"),
      radiation: trendFromAnnual(annual, "sw"),
    };
  } finally {
    clearTimeout(timer);
  }
}
