class EchoMap {
  constructor(canvas, tooltip) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.tooltip = tooltip;
    this.land = null;
    this.grid = null;
    this.cities = [];
    this.year = 2025;
    this.variable = "temp";
    this.mode = "trend";
    this.selected = null;
    this.hover = null;
    this.dpr = 1;
    this.width = 0;
    this.height = 0;
    this.baseLayer = document.createElement("canvas");
    this.baseDirty = true;
    this.onPick = null;
    this.plot = { x: 0, y: 0, w: 0, h: 0 };
    this._domains = {};
    this._bind();
  }

  _layoutPlot() {
    const ratio = 2; // equirectangular
    if (!this.width || !this.height) {
      this.plot = { x: 0, y: 0, w: 0, h: 0 };
      return;
    }
    if (this.width / this.height > ratio) {
      const w = this.height * ratio;
      this.plot = { x: (this.width - w) / 2, y: 0, w, h: this.height };
    } else {
      const h = this.width / ratio;
      this.plot = { x: 0, y: (this.height - h) / 2, w: this.width, h };
    }
  }

  setData({ land, grid, cities }) {
    this.land = land;
    this.grid = grid;
    this.cities = cities || [];
    this._domains = {};
    this.baseDirty = true;
    this.draw();
  }

  setYear(year) {
    if (year === this.year) return;
    this.year = year;
    this.draw();
  }

  setVariable(variable) {
    this.variable = variable;
    this.draw();
  }

  setMode(mode) {
    this.mode = mode === "year" ? "year" : "trend";
    this.draw();
  }

  setSelected(sel) {
    this.selected = sel;
    this.draw();
  }

  _isMobileUI() {
    return document.documentElement.getAttribute("data-ui") === "mobile";
  }

  _bind() {
    const onMove = (ev) => {
      const { x, y } = this._eventXY(ev);
      const geo = this.xyToLonLat(x, y);
      if (!geo) {
        this.hover = null;
        this.tooltip.classList.add("hidden");
        this.canvas.style.cursor = "default";
        return;
      }
      const city = this._hitCity(x, y);
      this.hover = city ? { type: "city", city, ...geo } : { type: "point", ...geo };
      this.canvas.style.cursor = "pointer";
      this._showTip(ev, this.hover);
    };
    this.canvas.addEventListener("mousemove", onMove);
    this.canvas.addEventListener("mouseleave", () => {
      this.hover = null;
      this.tooltip.classList.add("hidden");
    });
    this.canvas.addEventListener("click", (ev) => {
      const { x, y } = this._eventXY(ev);
      const geo = this.xyToLonLat(x, y);
      if (!geo) return;
      const city = this._hitCity(x, y);
      if (this.onPick) this.onPick(city ? { type: "city", city, lat: city.lat, lon: city.lon } : { type: "point", ...geo });
    });
    window.addEventListener("resize", () => this.resize());
  }

  _eventXY(ev) {
    const r = this.canvas.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  }

  _cityVisible(c) {
    if (this.mode === "year") return anomalyOf(c, this.variable, this.year) != null;
    return hasTrendData(trendOf(c, this.variable));
  }

  _cityRadius(c, selected) {
    if (selected) return 6.6;
    return c.featured ? 5.2 : 4.4;
  }

  _hitCity(x, y) {
    let best = null;
    let bestD = Infinity;
    for (const c of this.cities) {
      if (!this._cityVisible(c)) continue;
      const p = this.lonLatToXY(c.lon, c.lat);
      const selected = this.selected && this.selected.city && this.selected.city.id === c.id;
      const hitR = this._cityRadius(c, selected) + 5;
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d <= hitR * hitR && d < bestD) {
        bestD = d;
        best = c;
      }
    }
    return best;
  }

  _sourceLabel(city, lang) {
    const id = typeof citySourceId === "function" ? citySourceId(city, this.variable) : null;
    if (typeof officialSourceLabel === "function") return officialSourceLabel(id, lang);
    return lang === "zh" ? "NASA 資料" : "NASA data";
  }

  _showTip(ev, hover) {
    const lang = document.documentElement.lang.startsWith("zh") ? "zh" : "en";
    const r = this.canvas.getBoundingClientRect();
    let html = `${hover.lat.toFixed(1)}°, ${hover.lon.toFixed(1)}°`;
    const spec = varSpec(this.variable);
    if (hover.city) {
      const name = cityName(hover.city, lang);
      const src = this._sourceLabel(hover.city, lang);
      const srcLine = (lang === "zh" ? "資料來源：" : "Source: ") + src;
      if (this.mode === "year") {
        const a = anomalyOf(hover.city, this.variable, this.year);
        if (!a) {
          html = `<strong>${name}</strong><br>${t(lang, "no_data")}`;
        } else {
          const raw = `${fmtDec(a.raw, spec.digits)} ${spec.unit}`;
          const anom = formatAnomaly(a.value, this.variable);
          const vs = lang === "zh"
            ? `距平常：${anom}（相對 ${a.baselineLo}–${a.baselineHi}）`
            : `vs. normal: ${anom} (vs ${a.baselineLo}–${a.baselineHi})`;
          html = `<strong>${name}</strong><br>${this.year}：${raw}<br>${vs}<br>${srcLine}`;
        }
      } else {
        const tr = trendOf(hover.city, this.variable);
        if (hasTrendData(tr)) {
          const sl = tr.sen_slope_per_decade;
          const val = `${sl >= 0 ? "+" : "−"}${Math.abs(sl).toFixed(spec.slopeDigits)} ${spec.unit}${t(lang, "per_decade_unit")}`;
          const sig = isTrendSignificant(tr)
            ? (lang === "zh" ? "趨勢顯著（α=0.05）" : "significant trend (α=0.05)")
            : (lang === "zh" ? "趨勢未達顯著（α=0.05）" : "trend not significant (α=0.05)");
          html = `<strong>${name}</strong><br>${val}<br>${sig}<br>${srcLine}`;
        } else {
          html = `<strong>${name}</strong><br>${t(lang, "no_data")}`;
        }
      }
    } else if (this.variable === "temp") {
      const gy = this.mode === "trend" ? this._gistempBackdropYear() : this.year;
      const gval = this._gridValue(hover.lon, hover.lat, gy);
      if (gval != null) {
        const lab = lang === "zh" ? "GISTEMP 距平" : "GISTEMP anomaly";
        html += `<br>${lab} ${gval > 0 ? "+" : ""}${gval.toFixed(2)} °C`;
        html += lang === "zh"
          ? "<br>資料來源：NASA GISS GISTEMP v4"
          : "<br>Source: NASA GISS GISTEMP v4";
      }
    }
    this.tooltip.innerHTML = html;
    this.tooltip.classList.remove("hidden");
    const tx = ev.clientX - r.left;
    const ty = ev.clientY - r.top;
    this.tooltip.style.left = `${Math.min(tx, r.width - 200)}px`;
    this.tooltip.style.top = `${Math.min(ty, r.height - 90)}px`;
  }

  resize() {
    const rec = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    this.dpr = dpr;
    this.width = rec.width;
    this.height = rec.height;
    this.canvas.width = Math.round(rec.width * dpr);
    this.canvas.height = Math.round(rec.height * dpr);
    this.canvas.style.width = `${rec.width}px`;
    this.canvas.style.height = `${rec.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._layoutPlot();
    this.baseLayer.width = this.canvas.width;
    this.baseLayer.height = this.canvas.height;
    this.baseDirty = true;
    this.draw();
  }

  lonLatToXY(lon, lat) {
    const p = this.plot;
    return {
      x: p.x + ((lon + 180) / 360) * p.w,
      y: p.y + ((90 - lat) / 180) * p.h,
    };
  }

  xyToLonLat(x, y) {
    const p = this.plot;
    if (!p.w || x < p.x || y < p.y || x > p.x + p.w || y > p.y + p.h) return null;
    const lon = ((x - p.x) / p.w) * 360 - 180;
    const lat = 90 - ((y - p.y) / p.h) * 180;
    return { lon, lat };
  }

  _gridValue(lon, lat, year) {
    const g = this.grid;
    if (!g) return null;
    const yi = g.years.indexOf(year);
    if (yi < 0) return null;
    const iy = Math.round((lat - g.lat0) / g.dlat);
    const ix = Math.round((lon - g.lon0) / g.dlon);
    if (iy < 0 || iy >= g.nlat || ix < 0 || ix >= g.nlon) return null;
    return g.values[yi][iy * g.nlon + ix];
  }

  _themeKey() {
    return document.documentElement.getAttribute("data-theme") || "default";
  }

  _theme() {
    const v = (name, fallback) => (typeof cssVar === "function" ? cssVar(name, fallback) : fallback);
    return {
      mapFill: v("--map-fill", "#071017"),
      ocean: v("--ocean", "#0a1524"),
      land: v("--land", "#24384c"),
      landStroke: v("--map-land-stroke", "rgba(80,110,130,0.35)"),
      graticule: v("--map-graticule", "rgba(180,200,220,0.16)"),
      graticuleText: v("--map-graticule-text", "rgba(180,200,220,0.45)"),
      coast: v("--map-coast", "rgba(230,240,250,0.28)"),
      dot: v("--dot", "#f3d27a"),
      dotStroke: v("--map-dot-stroke", "rgba(8,16,24,0.85)"),
      dotSelectedStroke: v("--map-dot-selected-stroke", "#ffffff"),
      gold: v("--gold", "#e4b84a"),
      cityWarm: v("--city-warm", "#f0b35a"),
      cityCool: v("--city-cool", "#6ec3d4"),
      cityNa: v("--city-na", "#cccccc"),
      hollowFill: v("--panel", "#ffffff"),
      dotOutline: "#12151A",
    };
  }

  _lerp(a, b, t) {
    return a + (b - a) * t;
  }

  _rgba(r, g, b, a) {
    return `rgba(${r | 0},${g | 0},${b | 0},${a})`;
  }

  _tempColor(v, alpha = 0.78) {
    if (v == null || Number.isNaN(v)) return null;
    if (alpha === 0.78 && this._themeKey() === "2") alpha = 0.88;
    const t = Math.max(-1, Math.min(1, v / 2.2)); // -2.2..+2.2 °C
    let r, g, b;
    if (t < 0) {
      const u = t + 1;
      r = 40 + 180 * u;
      g = 90 + 130 * u;
      b = 140 + 70 * u;
    } else {
      r = 230 + 20 * t;
      g = 200 - 150 * t;
      b = 110 - 80 * t;
    }
    return `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
  }

  // Diverging: blue = decrease, slate mid, crimson = increase.
  // A saturation floor keeps small trends readable on the grey-blue map.
  _divergingColor(t, alpha = 1) {
    if (t == null || Number.isNaN(t)) return null;
    const u = Math.max(-1, Math.min(1, t));
    const mid = [210, 214, 220];
    const blue = [11, 110, 153];
    const red = [196, 30, 58];
    if (Math.abs(u) < 1e-9) return this._rgba(mid[0], mid[1], mid[2], alpha);
    const end = u < 0 ? blue : red;
    const w = 0.34 + 0.66 * Math.abs(u);
    return this._rgba(
      this._lerp(mid[0], end[0], w),
      this._lerp(mid[1], end[1], w),
      this._lerp(mid[2], end[2], w),
      alpha
    );
  }

  // Sequential: visible sand → deep crimson (higher = darker).
  _sequentialColor(t, alpha = 1) {
    if (t == null || Number.isNaN(t)) return null;
    const u = Math.max(0, Math.min(1, t));
    const stops = [
      [0, 214, 176, 92],
      [0.35, 214, 140, 70],
      [0.7, 196, 70, 48],
      [1, 139, 26, 42],
    ];
    let i = 0;
    while (i < stops.length - 2 && u > stops[i + 1][0]) i++;
    const a = stops[i];
    const b = stops[i + 1];
    const f = (u - a[0]) / Math.max(1e-6, b[0] - a[0]);
    return this._rgba(this._lerp(a[1], b[1], f), this._lerp(a[2], b[2], f), this._lerp(a[3], b[3], f), alpha);
  }

  _trendDomain() {
    const key = "t:" + this.variable;
    if (!this._domains[key]) this._domains[key] = trendValueDomain(this.cities, this.variable);
    return this._domains[key];
  }

  _yearDomain() {
    const key = "a:" + this.variable;
    if (!this._domains[key]) this._domains[key] = anomalyDomain(this.cities, this.variable);
    return this._domains[key];
  }

  _circleStyle(city) {
    if (this.mode === "year") {
      const a = anomalyOf(city, this.variable, this.year);
      if (!a) return null;
      const d = this._yearDomain();
      const scale = d ? d.scale : 1;
      const t = Math.max(-1, Math.min(1, a.value / scale));
      return { fill: this._divergingColor(t, 0.96), hollow: false };
    }
    const tr = trendOf(city, this.variable);
    if (!hasTrendData(tr)) return null;
    const d = this._trendDomain();
    const scale = d ? d.scale : (varSpec(this.variable).legendScale || 1);
    const t = Math.max(-1, Math.min(1, tr.sen_slope_per_decade / scale));
    const fill = this._divergingColor(t, 0.96);
    const sig = isTrendSignificant(tr);
    return { fill, hollow: !sig };
  }

  _gistempBackdropYear() {
    const years = this.grid && this.grid.years;
    if (!years || !years.length) return this.year;
    if (years.includes(2025)) return 2025;
    const last = years[years.length - 1];
    if (last === 2026 && years.length > 1) return years[years.length - 2];
    return last;
  }

  _drawBase() {
    const ctx = this.baseLayer.getContext("2d");
    const dpr = this.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    const theme = this._theme();
    ctx.fillStyle = theme.mapFill;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = theme.ocean;
    ctx.fillRect(this.plot.x, this.plot.y, this.plot.w, this.plot.h);
    if (this.land?.polygons) {
      ctx.fillStyle = theme.land;
      ctx.strokeStyle = theme.landStroke;
      ctx.lineWidth = 0.6;
      for (const ring of this.land.polygons) {
        ctx.beginPath();
        let started = false;
        let prev = null;
        for (const [lon, lat] of ring) {
          const p = this.lonLatToXY(lon, lat);
          if (prev && Math.abs(lon - prev[0]) > 180) {
            if (started) ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            started = true;
          } else if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else ctx.lineTo(p.x, p.y);
          prev = [lon, lat];
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.save();
    ctx.strokeStyle = theme.graticule;
    ctx.fillStyle = theme.graticuleText;
    ctx.lineWidth = 0.7;
    ctx.font = "10px Outfit, sans-serif";
    for (let lon = -180; lon <= 180; lon += 30) {
      const a = this.lonLatToXY(lon, 90);
      const b = this.lonLatToXY(lon, -90);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      if (lon !== -180 && lon !== 180) {
        const lab = lon === 0 ? "0°" : lon > 0 ? `${lon}°E` : `${-lon}°W`;
        ctx.fillText(lab, a.x + 3, this.height - 6);
      }
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const a = this.lonLatToXY(-180, lat);
      const b = this.lonLatToXY(180, lat);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      const lab = lat === 0 ? "0°" : lat > 0 ? `${lat}°N` : `${-lat}°S`;
      ctx.fillText(lab, 4, a.y - 3);
    }
    ctx.restore();
    this.baseDirty = false;
  }

  draw() {
    if (!this.width) return;
    this._layoutPlot();
    const themeKey = this._themeKey();
    if (this._appliedTheme !== themeKey) {
      this._appliedTheme = themeKey;
      this.baseDirty = true;
    }
    if (this.baseDirty) this._drawBase();
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.drawImage(this.baseLayer, 0, 0, this.width, this.height);

    if (this.variable === "temp" && this.grid) {
      const gridYear = this.mode === "trend" ? this._gistempBackdropYear() : this.year;
      const yi = this.grid.years.indexOf(gridYear);
      if (yi >= 0) {
        const vals = this.grid.values[yi];
        const cw = Math.abs((this.grid.dlon / 360) * this.width) + 0.6;
        const ch = Math.abs((this.grid.dlat / 180) * this.height) + 0.6;
        for (let iy = 0; iy < this.grid.nlat; iy++) {
          for (let ix = 0; ix < this.grid.nlon; ix++) {
            const v = vals[iy * this.grid.nlon + ix];
            if (v == null) continue;
            const lon = this.grid.lon0 + ix * this.grid.dlon;
            const lat = this.grid.lat0 + iy * this.grid.dlat;
            const p = this.lonLatToXY(lon, lat);
            ctx.fillStyle = this._tempColor(v);
            ctx.fillRect(p.x - cw / 2, p.y - ch / 2, cw, ch);
          }
        }
      }
    }

    if (this.land?.polygons) {
      ctx.save();
      const theme = this._theme();
      ctx.strokeStyle = theme.coast;
      ctx.lineWidth = 0.8;
      for (const ring of this.land.polygons) {
        ctx.beginPath();
        let started = false;
        let prev = null;
        for (const [lon, lat] of ring) {
          const p = this.lonLatToXY(lon, lat);
          if (prev && Math.abs(lon - prev[0]) > 180) {
            started = false;
            prev = [lon, lat];
            continue;
          }
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          else ctx.lineTo(p.x, p.y);
          prev = [lon, lat];
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    const theme = this._theme();
    const selId = this.selected && this.selected.city && this.selected.city.id;
    const drawable = this.cities.filter((c) => this._cityVisible(c));
    drawable.sort((a, b) => {
      const as = a.id === selId ? 1 : 0;
      const bs = b.id === selId ? 1 : 0;
      if (as !== bs) return as - bs;
      const ah = this._circleStyle(a)?.hollow ? 0 : 1;
      const bh = this._circleStyle(b)?.hollow ? 0 : 1;
      return ah - bh;
    });
    for (const c of drawable) {
      const p = this.lonLatToXY(c.lon, c.lat);
      const selected = c.id === selId;
      const style = this._circleStyle(c);
      if (!style) continue;
      const r = this._cityRadius(c, selected);
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      if (style.hollow) {
        ctx.fillStyle = theme.hollowFill;
        ctx.fill();
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = style.fill;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = theme.dotOutline;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillStyle = style.fill;
        ctx.fill();
        ctx.strokeStyle = theme.dotOutline;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      if (selected) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 2.2, 0, Math.PI * 2);
        ctx.strokeStyle = theme.dotSelectedStroke;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 3.2, 0, Math.PI * 2);
        ctx.strokeStyle = theme.dotOutline;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    if (this.selected && this.selected.type === "point") {
      const p = this.lonLatToXY(this.selected.lon, this.selected.lat);
      ctx.beginPath();
      ctx.strokeStyle = theme.gold;
      ctx.lineWidth = 2;
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = theme.gold;
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _paintScale(canvas, kind, domain) {
    const x = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    for (let i = 0; i < w; i++) {
      const u = i / Math.max(1, w - 1);
      if (kind === "diverging") {
        const t = -1 + 2 * u;
        x.fillStyle = this._divergingColor(t, 1);
      } else if (kind === "gistemp") {
        const v = -2.2 + 4.4 * u;
        x.fillStyle = this._tempColor(v, 1);
      } else {
        x.fillStyle = this._sequentialColor(u, 1);
      }
      x.fillRect(i, 0, 1, h);
    }
  }

  drawLegend(container, lang) {
    container.style.right = "";
    container.style.bottom = "";
    container.style.left = "";
    container.style.position = "";
    const source = (typeof mapLayerShortCitation === "function")
      ? mapLayerShortCitation(this.variable, lang)
      : ((typeof mapLayerCitation === "function") ? mapLayerCitation(this.variable, lang) : "");
    const title = this.mode === "year"
      ? legendYearTitle(this.variable, lang, this.cities)
      : t(lang, "legend_trend_" + (this.variable || "temp"));
    const spec = varSpec(this.variable);
    const ticks = (lo, mid, hi) =>
      `<div class="leg-scale"><span>${lo}</span><span>${mid}</span><span>${hi}</span></div>`;

    let scaleHtml = "";
    let extra = "";
    if (this.mode === "year") {
      const d = this._yearDomain();
      const scale = d ? d.scale : 1;
      const digits = anomalyDigits(this.variable);
      const unit = anomalyUnit(this.variable);
      const lo = `−${Number(scale).toFixed(digits)}`;
      const hi = `+${Number(scale).toFixed(digits)}`;
      const unitLabel = unit === "%" ? "%" : " " + unit;
      scaleHtml = `<canvas class="leg-bar" width="120" height="8" data-kind="diverging"></canvas>${ticks(lo, "0", hi + unitLabel)}`;
    } else {
      const d = this._trendDomain();
      const scale = d ? d.scale : spec.legendScale;
      const digits = spec.slopeDigits;
      const lo = `−${Number(scale).toFixed(digits)}`;
      const hi = `+${Number(scale).toFixed(digits)}`;
      scaleHtml = `<canvas class="leg-bar" width="120" height="8" data-kind="diverging"></canvas>${ticks(lo, "0", hi + " " + spec.unit)}`;
      extra += `<div class="leg-note">${t(lang, "legend_ns_short")}</div>`;
    }
    container.innerHTML = `<div class="leg-title">${title}</div>${scaleHtml}${extra}${source ? `<div class="leg-source">${source}</div>` : ""}`;
    container.querySelectorAll("canvas.leg-bar").forEach((c) => {
      this._paintScale(c, c.getAttribute("data-kind"), null);
    });
  }
}
