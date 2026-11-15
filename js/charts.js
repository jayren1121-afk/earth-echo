function themeColor(name, fallback) {
  return typeof cssVar === "function" ? cssVar(name, fallback) : fallback;
}

function drawTrendChart(canvas, place, variable, lang, highlightSeg) {
  const ctx = canvas.getContext("2d");
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const w = canvas.clientWidth || 400;
  const mobile = document.documentElement.getAttribute("data-ui") === "mobile";
  const h = Math.max(mobile ? 300 : 200, Math.round(w * (mobile ? 0.75 : 0.52)));
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = themeColor("--panel", "#ffffff");
  ctx.fillRect(0, 0, w, h);

  const spec = varSpec(variable);
  const seriesKey = spec.key;
  const tr = trendOf(place, variable);
  const annual = place.annual || [];
  const pts = annual
    .filter((r) => r[seriesKey] != null)
    .map((r) => ({ year: r.year, value: r[seriesKey] }));
  if (!pts.length || !tr) {
    ctx.fillStyle = themeColor("--chart-label", "#3a4656");
    ctx.font = "13px Outfit, sans-serif";
    ctx.fillText("—", 20, h / 2);
    return;
  }

  const showStat = typeof canShowStatProjection === "function" && canShowStatProjection(place, variable);
  const proj = showStat ? tr.projection : null;
  const pad = { l: 52, r: 16, t: 18, b: 32 };
  const xmin = pts[0].year;
  const nex = (variable === "temp") && place.nex ? place.nex.temp : null;
  let xmax = pts[pts.length - 1].year;
  if (proj?.to_year) xmax = Math.max(xmax, proj.to_year);
  if (nex?.ssp245?.length) xmax = Math.max(xmax, nex.ssp245[nex.ssp245.length - 1].year);
  if (nex?.ssp585?.length) xmax = Math.max(xmax, nex.ssp585[nex.ssp585.length - 1].year);
  let ymin = Math.min(...pts.map((p) => p.value));
  let ymax = Math.max(...pts.map((p) => p.value));
  if (proj?.series) {
    ymin = Math.min(ymin, ...proj.series.map((s) => s.lo));
    ymax = Math.max(ymax, ...proj.series.map((s) => s.hi));
  }
  const nexSeries = [];
  if (nex?.ssp245) nexSeries.push(...nex.ssp245);
  if (nex?.ssp585) nexSeries.push(...nex.ssp585);
  if (nexSeries.length) {
    ymin = Math.min(ymin, ...nexSeries.map((s) => s.min != null ? s.min : s.mean));
    ymax = Math.max(ymax, ...nexSeries.map((s) => s.max != null ? s.max : s.mean));
  }
  const span = ymax - ymin || 1;
  ymin -= span * 0.12;
  ymax += span * 0.16;

  const X = (yr) => pad.l + ((yr - xmin) / (xmax - xmin)) * (w - pad.l - pad.r);
  const Y = (v) => pad.t + ((ymax - v) / (ymax - ymin)) * (h - pad.t - pad.b);

  // axes
  ctx.strokeStyle = themeColor("--chart-axis", "rgba(18, 40, 70, 0.28)");
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pad.l, pad.t);
  ctx.lineTo(pad.l, h - pad.b);
  ctx.lineTo(w - pad.r, h - pad.b);
  ctx.stroke();
  ctx.fillStyle = themeColor("--chart-label", "#3a4656");
  ctx.font = "12px Outfit, sans-serif";
  const yTicks = 4;
  for (let i = 0; i <= yTicks; i++) {
    const v = ymin + ((ymax - ymin) * i) / yTicks;
    const y = Y(v);
    ctx.fillText(fmtDec(v, spec.chartDigits), 6, y + 4);
    ctx.strokeStyle = themeColor("--chart-grid", "rgba(18, 40, 70, 0.10)");
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(w - pad.r, y);
    ctx.stroke();
  }
  for (const yr of [xmin, 2000, pts[pts.length - 1].year, xmax]) {
    if (yr == null) continue;
    ctx.fillStyle = themeColor("--chart-label", "#3a4656");
    ctx.fillText(String(yr), X(yr) - 14, h - 10);
  }

  // projection band + dashed line
  if (proj?.series) {
    ctx.beginPath();
    proj.series.forEach((s, i) => {
      const x = X(s.year);
      const y = Y(s.hi);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    for (let i = proj.series.length - 1; i >= 0; i--) {
      const s = proj.series[i];
      ctx.lineTo(X(s.year), Y(s.lo));
    }
    ctx.closePath();
    ctx.fillStyle = themeColor("--proj-fill", "rgba(228,184,74,0.13)");
    ctx.fill();

    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = themeColor("--gold", "#0a3d91");
    ctx.lineWidth = 2.3;
    proj.series.forEach((s, i) => {
      const x = X(s.year);
      const y = Y(s.value);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (nex) {
    const bands = [
      { key: "ssp245", fill: themeColor("--ssp245-fill", "rgba(58,167,193,0.18)"), stroke: themeColor("--ssp245-stroke", "#3aa7c1") },
      { key: "ssp585", fill: themeColor("--ssp585-fill", "rgba(240,106,61,0.16)"), stroke: themeColor("--ssp585-stroke", "#f06a3d") },
    ];
    bands.forEach((band, bi) => {
      const series = nex[band.key];
      if (!series || !series.length) return;
      if (series.some((pt) => pt.min != null && pt.max != null)) {
        ctx.beginPath();
        series.forEach((pt, i) => {
          const y = Y(pt.max);
          if (i === 0) ctx.moveTo(X(pt.year), y);
          else ctx.lineTo(X(pt.year), y);
        });
        for (let i = series.length - 1; i >= 0; i--) {
          ctx.lineTo(X(series[i].year), Y(series[i].min));
        }
        ctx.closePath();
        ctx.fillStyle = band.fill;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = band.stroke;
      ctx.lineWidth = 2.2;
      series.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(X(pt.year), Y(pt.mean));
        else ctx.lineTo(X(pt.year), Y(pt.mean));
      });
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  // Sen fitted over observation period
  if (tr.sen_slope_per_year != null) {
    const y1 = tr.sen_intercept + tr.sen_slope_per_year * pts[0].year;
    const y2 = tr.sen_intercept + tr.sen_slope_per_year * pts[pts.length - 1].year;
    ctx.beginPath();
    ctx.strokeStyle = themeColor("--sen-stroke", "rgba(58,167,193,0.85)");
    ctx.lineWidth = 2.3;
    ctx.moveTo(X(pts[0].year), Y(y1));
    ctx.lineTo(X(pts[pts.length - 1].year), Y(y2));
    ctx.stroke();
  }

  // observed
  ctx.beginPath();
  ctx.strokeStyle = themeColor("--chart-line", "#12151a");
  ctx.lineWidth = 2.4;
  pts.forEach((p, i) => {
    if (i === 0) ctx.moveTo(X(p.year), Y(p.value));
    else ctx.lineTo(X(p.year), Y(p.value));
  });
  ctx.stroke();
  pts.forEach((p) => {
    ctx.beginPath();
    ctx.fillStyle = themeColor("--chart-line", "#12151a");
    ctx.arc(X(p.year), Y(p.value), 2.2, 0, Math.PI * 2);
    ctx.fill();
  });

  const unit = spec.unit;
  ctx.fillStyle = themeColor("--chart-label", "#3a4656");
  ctx.font = "12px Outfit, sans-serif";
  ctx.fillText(unit, 8, 14);
}

function drawRankingChart(canvas, cities, selectedId, globalSlope, lang, variable, opts) {
  variable = variable || "temp";
  opts = opts || {};
  const mode = opts.mode || "trend";
  const items = rankingItems(cities, variable, { mode, year: opts.year, order: opts.order || "desc" });
  const ctx = canvas.getContext("2d");
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const w = canvas.clientWidth || 400;
  const rowH = 18;
  const h = Math.max(200, 28 + items.length * rowH);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const spec = varSpec(variable);

  if (!items.length) {
    ctx.fillStyle = themeColor("--chart-label", "#3a4656");
    ctx.font = "13px Outfit, sans-serif";
    ctx.fillText(t(lang, "no_data"), 20, h / 2);
    return;
  }

  const padL = 108;
  const values = items.map((it) => it.value);
  const maxAbs = Math.max(...values.map((v) => Math.abs(v)), (mode !== "year" ? Math.abs(globalSlope || 0) : 0), 0.2);
  const x0 = padL + (w - padL - 16) * 0.5;
  const scale = (w - padL - 16) / (2 * maxAbs);

  ctx.strokeStyle = themeColor("--chart-axis", "rgba(18, 40, 70, 0.28)");
  ctx.beginPath();
  ctx.moveTo(x0, 8);
  ctx.lineTo(x0, h - 8);
  ctx.stroke();

  if (mode !== "year" && variable === "temp" && globalSlope != null) {
    const gx = x0 + globalSlope * scale;
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = themeColor("--gold", "#0a3d91");
    ctx.beginPath();
    ctx.moveTo(gx, 8);
    ctx.lineTo(gx, h - 8);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  items.forEach((it, i) => {
    const c = it.city;
    const y = 10 + i * rowH;
    const selected = c.id === selectedId;
    if (selected) {
      ctx.fillStyle = themeColor("--selected-row", "rgba(228,184,74,0.12)");
      ctx.fillRect(0, y - 3, w, rowH);
    }
    ctx.fillStyle = selected ? themeColor("--gold", "#0a3d91") : themeColor("--chart-label", "#3a4656");
    ctx.font = "12px Outfit, sans-serif";
    ctx.fillText(String(i + 1).padStart(2, " "), 6, y + 9);
    ctx.fillStyle = selected ? themeColor("--text", "#12151a") : themeColor("--chart-rank-text", "#12151a");
    ctx.fillText(cityName(c, lang), 28, y + 9);
    const sl = it.value;
    const x1 = x0 + sl * scale;
    const barX = Math.min(x0, x1);
    const barW = Math.max(2, Math.abs(x1 - x0));
    ctx.fillStyle = sl >= 0 ? themeColor("--warm", "#c41e3a") : themeColor("--cool", "#3aa7c1");
    ctx.globalAlpha = (mode === "trend" && it.significant === false) ? 0.45 : 1;
    ctx.fillRect(barX, y + 3, barW, 8);
    ctx.globalAlpha = 1;
    ctx.fillStyle = themeColor("--chart-label", "#3a4656");
    const label = mode === "year"
      ? formatAnomaly(sl, variable)
      : ((sl >= 0 ? "+" : "−") + Math.abs(sl).toFixed(spec.slopeDigits));
    ctx.fillText(label, w - 52, y + 9);
  });
}

function renderRankingList(el, cities, selectedId, globalSlope, lang, variable, opts) {
  variable = variable || "temp";
  opts = opts || {};
  const mode = opts.mode || "trend";
  const spec = varSpec(variable);
  const items = rankingItems(cities, variable, { mode, year: opts.year, order: opts.order || "desc" });
  if (!items.length) {
    el.innerHTML = `<div class="rank-global">${t(lang, "no_data")}</div>`;
    return;
  }
  const max = Math.max(...items.map((it) => Math.abs(it.value)), 0.2);
  el.innerHTML = items
    .map((it, i) => {
      const sl = it.value;
      const w = Math.max(4, (Math.abs(sl) / max) * 100);
      const sel = it.city.id === selectedId ? " selected" : "";
      const cool = sl < 0 ? " cool" : "";
      const ns = (mode === "trend" && it.significant === false) ? " ns" : "";
      const label = mode === "year"
        ? formatAnomaly(sl, variable)
        : ((sl >= 0 ? "+" : "−") + Math.abs(sl).toFixed(spec.slopeDigits) + spec.unit);
      return `<div class="rank-row${sel}${cool}${ns}" data-id="${it.city.id}">
        <span class="n">${i + 1}</span>
        <span>${cityName(it.city, lang)}</span>
        <div><div class="bar" style="width:${w}%"></div></div>
        <span>${label}</span>
      </div>`;
    })
    .join("");
  const g = (mode !== "year" && variable === "temp" && globalSlope != null)
    ? ` · ${t(lang, "global_avg")} ${globalSlope >= 0 ? "+" : "−"}${Math.abs(globalSlope).toFixed(2)}°C / 10 yr`
    : "";
  const src = (typeof rankingSourceCitation === "function") ? rankingSourceCitation(variable, lang) : "";
  const cap = mode === "year"
    ? t(lang, "rank_caption_year", items.length, opts.year)
    : t(lang, "rank_caption", items.length);
  el.insertAdjacentHTML("beforeend", `<div class="rank-global">${cap}${g}${src ? " · " + src : ""}</div>`);
  const sel = el.querySelector(".rank-row.selected");
  if (sel) {
    const rowH = sel.getBoundingClientRect().height || 22;
    const er = el.getBoundingClientRect();
    const sr = sel.getBoundingClientRect();
    const raw = el.scrollTop + (sr.top - er.top) - rowH * 2;
    el.scrollTop = Math.max(0, Math.round(raw / rowH) * rowH);
  }
}

function renderChartLegend(el, place, variable, lang) {
  if (!el) return;
  const tr = trendOf(place, variable);
  const nex = (variable === "temp") && place.nex ? place.nex.temp : null;
  const items = [];
  if (typeof canShowStatProjection === "function" && canShowStatProjection(place, variable) && tr?.projection?.series) {
    items.push({
      kind: "dash",
      color: themeColor("--gold", "#0a3d91"),
      fill: themeColor("--proj-fill-legend", "rgba(228,184,74,0.25)"),
      label: t(lang, "legend_stat"),
    });
  }
  if (nex?.ssp245?.length) {
    items.push({
      kind: "band",
      color: themeColor("--ssp245-stroke", "#3aa7c1"),
      fill: themeColor("--ssp245-fill-legend", "rgba(58,167,193,0.35)"),
      label: t(lang, "legend_nex_mid"),
    });
  }
  if (nex?.ssp585?.length) {
    items.push({
      kind: "band",
      color: themeColor("--ssp585-stroke", "#f06a3d"),
      fill: themeColor("--ssp585-fill-legend", "rgba(240,106,61,0.35)"),
      label: t(lang, "legend_nex_high"),
    });
  }
  if (!items.length) {
    el.innerHTML = "";
    el.hidden = true;
    return;
  }
  el.hidden = false;
  el.innerHTML = items.map((it) => {
    const sw = it.kind === "dash"
      ? `<span class="leg-swatch dash" style="--c:${it.color};--f:${it.fill}"></span>`
      : `<span class="leg-swatch band" style="--c:${it.color};--f:${it.fill}"></span>`;
    return `<span class="leg-item">${sw}<span>${it.label}</span></span>`;
  }).join("");
}
