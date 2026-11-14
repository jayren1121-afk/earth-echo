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
    this.selected = null;
    this.hover = null;
    this.dpr = 1;
    this.width = 0;
    this.height = 0;
    this.baseLayer = document.createElement("canvas");
    this.baseDirty = true;
    this.onPick = null;
    this.plot = { x: 0, y: 0, w: 0, h: 0 };
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

  setSelected(sel) {
    this.selected = sel;
    this.draw();
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

  _hitCity(x, y, px = 8) {
    let best = null;
    let bestD = px * px;
    for (const c of this.cities) {
      const p = this.lonLatToXY(c.lon, c.lat);
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d <= bestD) {
        bestD = d;
        best = c;
      }
    }
    return best;
  }

  _showTip(ev, hover) {
    const lang = document.documentElement.lang.startsWith("zh") ? "zh" : "en";
    const r = this.canvas.getBoundingClientRect();
    let html = `${hover.lat.toFixed(1)}°, ${hover.lon.toFixed(1)}°`;
    if (hover.city) {
      html = `<strong>${cityName(hover.city, lang)}</strong><br>${html}`;
    }
    const gval = this._gridValue(hover.lon, hover.lat, this.year);
    if (this.variable === "temp" && gval != null) {
      html += `<br>${gval > 0 ? "+" : ""}${gval.toFixed(2)} °C`;
    }
    this.tooltip.innerHTML = html;
    this.tooltip.classList.remove("hidden");
    const tx = ev.clientX - r.left;
    const ty = ev.clientY - r.top;
    this.tooltip.style.left = `${Math.min(tx, r.width - 160)}px`;
    this.tooltip.style.top = `${Math.min(ty, r.height - 60)}px`;
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
    };
  }

  _tempColor(v, alpha = 0.78) {
    if (v == null || Number.isNaN(v)) return null;
    if (alpha === 0.78 && this._themeKey() === "2") alpha = 0.88;
    const t = Math.max(-1, Math.min(1, v / 2.2)); // -2.2..+2.2 °C
    // diverging: cool teal → pale → warm gold → red
    let r, g, b;
    if (t < 0) {
      const u = t + 1; // 0..1
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

  _precipColor(slopeDec) {
    if (slopeDec == null) return "rgba(180,180,180,0.7)";
    const t = Math.max(-1, Math.min(1, slopeDec / 150));
    if (t >= 0) return `rgba(${40 + 20 * t | 0},${90 + 80 * t | 0},${140 + 40 * t | 0},0.95)`;
    return `rgba(${180 - 20 * t | 0},${140 + 40 * t | 0},${70 | 0},0.95)`;
  }

  _soilColor(slopeDec) {
    return this._slopeColor(slopeDec, 0.4);
  }

  _slopeColor(slopeDec, scale, alpha = 0.95) {
    if (slopeDec == null) return "rgba(180,180,180,0.7)";
    const t = Math.max(-1, Math.min(1, slopeDec / scale));
    if (t >= 0) return `rgba(${40 + 20 * t | 0},${90 + 80 * t | 0},${140 + 40 * t | 0},${alpha})`;
    return `rgba(${180 - 20 * Math.abs(t) | 0},${140 + 40 * t | 0},${70 | 0},${alpha})`;
  }

  _dotColor(city) {
    if (this.variable === "temp") {
      const sl = city.temp?.sen_slope_per_decade;
      const theme = this._theme();
      return sl == null ? theme.cityNa : sl >= 0 ? theme.cityWarm : theme.cityCool;
    }
    if (this.variable === "precip") return this._precipColor(city.precip?.sen_slope_per_decade);
    const spec = varSpec(this.variable);
    const sl = trendOf(city, this.variable)?.sen_slope_per_decade;
    return this._slopeColor(sl, spec.legendScale);
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
    // land
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
            // antimeridian break
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
    // graticule
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
      const yi = this.grid.years.indexOf(this.year);
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

    // coastlines on top of the anomaly grid
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

    // cities
    const theme = this._theme();
    for (const c of this.cities) {
      const p = this.lonLatToXY(c.lon, c.lat);
      const selected = this.selected && this.selected.city && this.selected.city.id === c.id;
      let fill = this._dotColor(c);
      ctx.beginPath();
      ctx.fillStyle = fill;
      ctx.strokeStyle = selected ? theme.dotSelectedStroke : theme.dotStroke;
      ctx.lineWidth = selected ? 2.4 : 1;
      ctx.arc(p.x, p.y, selected ? 5.5 : c.featured ? 4.2 : 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
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

  drawLegend(container, lang) {
    const titleKey = "legend_" + (this.variable || "temp");
    const title = t(lang, titleKey);
    const host = container.parentElement;
    if (host && this.plot.w) {
      container.style.right = `${Math.max(8, this.width - (this.plot.x + this.plot.w) + 10)}px`;
      container.style.bottom = `${Math.max(8, this.height - (this.plot.y + this.plot.h) + 10)}px`;
      container.style.left = "auto";
    }
    const source = (typeof mapLayerCitation === "function") ? mapLayerCitation(this.variable, lang) : "";
    container.innerHTML = `<div>${title}</div><canvas width="140" height="10"></canvas><div class="leg-scale"></div>${source ? `<div class="leg-source">${source}</div>` : ""}`;
    const c = container.querySelector("canvas");
    const x = c.getContext("2d");
    const w = c.width;
    if (this.variable === "temp") {
      for (let i = 0; i < w; i++) {
        const v = -2.2 + (4.4 * i) / (w - 1);
        x.fillStyle = this._tempColor(v, 1);
        x.fillRect(i, 0, 1, c.height);
      }
      container.querySelector(".leg-scale").innerHTML = `<span>−2.2°C</span><span>0</span><span>+2.2°C</span>`;
    } else {
      const spec = varSpec(this.variable);
      const scale = spec.legendScale;
      for (let i = 0; i < w; i++) {
        const v = -scale + (2 * scale * i) / (w - 1);
        const color = this.variable === "precip" ? this._precipColor(v) : this._slopeColor(v, scale);
        x.fillStyle = String(color).replace("0.95", "1");
        x.fillRect(i, 0, 1, c.height);
      }
      container.querySelector(".leg-scale").innerHTML = `<span>${spec.legendLo}</span><span>${spec.legendMid}</span><span>${spec.legendHi}</span>`;
    }
  }
}
