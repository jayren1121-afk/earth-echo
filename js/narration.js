function topicLabel(id, lang) {
  return t(lang, "topic_" + id);
}

function topicHasData(place, id, events) {
  if (id === "events") return !!(events && events.length);
  return hasTrendData(trendOf(place, id));
}

function topicIntro(id, lang) {
  const label = topicLabel(id, lang);
  if (lang === "zh") return `接下來，來說這裡的${label}。`;
  return `Next, ${label} at this place.`;
}

function nextPrompt(nextTopic, lang) {
  const label = nextTopic.label;
  if (lang === "zh") return `想聽這裡的${label}嗎？請按「下一則」。`;
  return `Want to hear about ${label} here? Tap Next.`;
}

function buildTourTopics(place, lang, events) {
  const name = place.city ? cityName(place.city, lang) : place.label;
  const country = place.city ? countryName(place.city, lang) : "";
  const topics = [];
  let saidDisclaimer = false;
  for (const id of TOUR_TOPIC_ORDER) {
    if (!topicHasData(place, id, events)) continue;
    const variable = id === "events" ? null : id;
    const segments = [];
    if (id === "temp") {
      const intro = whereText(place, name, country, lang);
      segments.push({ id: "where", chart: "trend", variable: "temp", text: intro, speech: intro });
    } else if (id === "events") {
      segments.push({
        id: "events",
        chart: "events",
        variable: null,
        text: eventsText(events, lang),
        speech: eventsSpeech(events, lang),
      });
    } else {
      const intro = topicIntro(id, lang);
      segments.push({ id: "topic_intro", chart: "trend", variable, text: intro, speech: intro });
    }
    if (id !== "events") {
      const cards = buildSoWhat(place, variable, lang, null, { localOnly: true });
      for (const part of ["finding", "meaning", "tip", "outlook"]) {
        const card = cards[part];
        const text = card && card.text;
        if (!text) continue;
        let speech = (card && card.speech) || text;
        if (part === "tip") {
          speech = tipSpeech(place, variable, lang, { disclaimer: !saidDisclaimer });
          if (speech && /一般參考|general reference/.test(speech)) saidDisclaimer = true;
        }
        segments.push({ id: part, chart: "trend", variable, text, speech });
      }
    }
    topics.push({ id, variable, label: topicLabel(id, lang), segments });
  }
  return topics;
}

function isTourModePlace(place) {
  return !!(place && place.type === "point");
}

function whereText(place, name, country, lang) {
  if (isTourModePlace(place)) {
    if (lang === "zh") {
      const lead = place.fromGeo ? "你現在在這個位置。" : "你選的位置在這裡。";
      return lead + "這是導覽版，用的是這裡的 NASA 區域資料，解析度大約 50 公里，所以同一座城市裡相近的地點，數字會很接近。我先說氣溫。";
    }
    const lead = place.fromGeo ? "You are at this location. " : "You picked this location. ";
    return lead + "This is Tour mode, using NASA regional data at about 50 kilometre resolution, so nearby places in the same city get similar numbers. I will start with temperature.";
  }
  if (lang === "zh") {
    return `這裡是${country}${name}。這是首都版，用這座城市預先算好的完整資料。我先說氣溫。`;
  }
  return `This is ${name}${country ? ", " + country : ""}. This is Capital mode, using the city's full precomputed record. I will start with temperature.`;
}

function eventBits(events, lang) {
  const top = events.slice(0, 3);
  return top.map((e) => {
    const cat = categoryLabel((e.categories && e.categories[0]) || "", lang);
    const when = (e.date || "").slice(0, 10);
    const dist = e.distance_km != null ? (lang === "zh" ? `，約 ${Math.round(e.distance_km)} 公里外` : `, about ${Math.round(e.distance_km)} kilometres away`) : "";
    return lang === "zh" ? `${when} 的${cat}${dist}` : `${cat.toLowerCase()} on ${when}${dist}`;
  });
}

function eventsText(events, lang) {
  const bits = eventBits(events, lang);
  if (lang === "zh") {
    return `附近近年，NASA 的 EONET 有記錄到：${bits.join("；")}。這些是觀測到的事件，不一定由本地長期變化直接造成。資料來源：NASA EONET。`;
  }
  return `Nearby in recent years, NASA EONET has recorded: ${bits.join("; ")}. These are observed events, and they are not necessarily caused by the local long-term change. Source: NASA EONET.`;
}

function eventsSpeech(events, lang) {
  const bits = eventBits(events, lang);
  if (lang === "zh") {
    return `附近近年，NASA 有記錄到：${bits.join("；")}。這些是觀測到的事件，不一定由本地長期變化直接造成。資料來源：NASA 衛星觀測。`;
  }
  return `Nearby in recent years, NASA has recorded: ${bits.join("; ")}. These are observed events, and they are not necessarily caused by the local long-term change. Source: NASA satellite observations.`;
}

class Narrator {
  constructor() {
    this.topics = [];
    this.topicIndex = 0;
    this.segIndex = 0;
    this.speaking = false;
    this.paused = false;
    this.waitingForNext = false;
    this.onSegment = null;
    this.onWaitForNext = null;
    this.onEnd = null;
    this.onTopicChange = null;
    this.lang = "zh";
    this._utterance = null;
  }

  stop() {
    this.topics = [];
    this.topicIndex = 0;
    this.segIndex = 0;
    this.speaking = false;
    this.paused = false;
    this.waitingForNext = false;
    this._utterance = null;
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
  }

  startTopics(topics, lang) {
    this.stop();
    this.topics = topics || [];
    this.lang = lang;
    if (!this.topics.length) {
      if (this.onEnd) this.onEnd();
      return;
    }
    this.speaking = true;
    if (this.onTopicChange) this.onTopicChange(this.topics[0], 0, this.topics);
    this._speakCurrent();
  }

  // Back-compat if anything still calls start(segments)
  start(segments, lang) {
    const topic = { id: "temp", variable: "temp", label: topicLabel("temp", lang), segments };
    this.startTopics([topic], lang);
  }

  nextTopic() {
    if (!this.topics.length) return;
    if (this.topicIndex >= this.topics.length - 1) {
      this._speakDone();
      return;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    this.waitingForNext = false;
    this.paused = false;
    this.topicIndex += 1;
    this.segIndex = 0;
    this.speaking = true;
    if (this.onTopicChange) this.onTopicChange(this.topics[this.topicIndex], this.topicIndex, this.topics);
    this._speakCurrent();
  }

  jumpTo(topicId) {
    const i = this.topics.findIndex((t) => t.id === topicId);
    if (i < 0) return;
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    this.waitingForNext = false;
    this.paused = false;
    this.topicIndex = i;
    this.segIndex = 0;
    this.speaking = true;
    if (this.onTopicChange) this.onTopicChange(this.topics[i], i, this.topics);
    this._speakCurrent();
  }

  /** UI helper for screenshots: pretends the first topic has finished and we are waiting for Next. */
  showWaitAfterTopic(topicId) {
    const i = Math.max(0, this.topics.findIndex((t) => t.id === topicId));
    if (!this.topics.length) return;
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    this.topicIndex = i;
    const topic = this.topics[i];
    this.segIndex = topic.segments.length;
    this.speaking = false;
    this.paused = false;
    this.waitingForNext = true;
    const last = topic.segments[topic.segments.length - 1];
    if (this.onTopicChange) this.onTopicChange(topic, i, this.topics);
    if (last && this.onSegment) this.onSegment(last, i, this.topics);
    const next = this.topics[i + 1] || null;
    if (this.onWaitForNext) this.onWaitForNext(next, topic);
  }

  pause() {
    if (!this.speaking || this.waitingForNext) return;
    this.paused = true;
    if (window.speechSynthesis) window.speechSynthesis.pause();
  }

  resume() {
    if (this.waitingForNext) return;
    if (!this.topics.length) return;
    this.paused = false;
    this.speaking = true;
    if (window.speechSynthesis && window.speechSynthesis.paused) window.speechSynthesis.resume();
    else this._speakCurrent();
  }

  _pickVoice(lang) {
    const voices = (window.speechSynthesis && window.speechSynthesis.getVoices()) || [];
    const want = lang === "zh" ? ["zh-TW", "zh_TW", "zh-HK", "zh-CN", "zh"] : ["en-US", "en-GB", "en"];
    for (const code of want) {
      const v = voices.find((x) => (x.lang || "").toLowerCase().startsWith(code.toLowerCase()));
      if (v) return v;
    }
    return null;
  }

  _speakUtterance(text, onDone) {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      if (onDone) onDone();
      return;
    }
    const u = new SpeechSynthesisUtterance(toSpoken(text, this.lang));
    u.lang = this.lang === "zh" ? "zh-TW" : "en-US";
    u.rate = this.lang === "zh" ? 1.04 : 1.0;
    u.pitch = 1;
    const voice = this._pickVoice(this.lang);
    if (voice) u.voice = voice;
    this._utterance = u;
    u.onend = () => { if (this._utterance === u && onDone) onDone(); };
    u.onerror = () => { if (this._utterance === u && onDone) onDone(); };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  _speakCurrent() {
    if (!this.speaking || this.paused || this.waitingForNext) return;
    const topic = this.topics[this.topicIndex];
    if (!topic) {
      this._speakDone();
      return;
    }
    if (this.segIndex >= topic.segments.length) {
      const next = this.topics[this.topicIndex + 1];
      if (next) {
        this._speakUtterance(nextPrompt(next, this.lang), () => {
          this.waitingForNext = true;
          this.speaking = false;
          if (this.onWaitForNext) this.onWaitForNext(next, topic);
        });
      } else {
        this._speakDone();
      }
      return;
    }
    const seg = topic.segments[this.segIndex];
    if (this.onSegment) this.onSegment(seg, this.topicIndex, this.topics);
    this._speakUtterance(seg.speech || seg.text, () => {
      this.segIndex += 1;
      this._speakCurrent();
    });
  }

  _speakDone() {
    this._speakUtterance(t(this.lang, "tour_done"), () => {
      this.speaking = false;
      this.waitingForNext = false;
      if (this.onEnd) this.onEnd();
    });
  }

  currentTopic() {
    return this.topics[this.topicIndex] || null;
  }
}

if (typeof speechSynthesis !== "undefined") {
  speechSynthesis.addEventListener("voiceschanged", () => {});
}

// Spoken form: round decimals to 1 place and read units naturally (cards keep exact text)
function toSpoken(text, lang) {
  let t = String(text).replace(/(\d+\.\d{2,})/g, (m) => {
    const r = Math.round(parseFloat(m) * 10) / 10;
    return r.toFixed(1);
  });
  if (lang === "zh") {
    t = t
      .replace(/\s*°C/g, " 度")
      .replace(/\s*kg\/m²/g, " 公斤每平方公尺")
      .replace(/\s*MJ\/m²\/day/g, " 兆焦耳每平方公尺每日")
      .replace(/\s*g\/kg/g, " 克每公斤")
      .replace(/\s*ppm\b/g, " P P M")
      .replace(/\s*mm\b/g, " 毫米");
  } else {
    t = t
      .replace(/\s*°C/g, " degrees")
      .replace(/\s*kg\/m²/g, " kilograms per square metre")
      .replace(/\s*MJ\/m²\/day/g, " megajoules per square metre per day")
      .replace(/\s*g\/kg/g, " grams per kilogram")
      .replace(/\s*ppm\b/g, " parts per million")
      .replace(/\s*mm\b/g, " millimetres");
  }
  return t;
}
