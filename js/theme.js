(function applyThemeFromURL() {
  const param = new URLSearchParams(location.search).get("theme");
  const theme = (param === "1" || param === "3") ? param : "2";
  document.documentElement.setAttribute("data-theme", theme);
  const light = theme === "2";
  document.documentElement.style.colorScheme = light ? "only light" : "dark";
  const setMeta = (name, content) => {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", name);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  };
  setMeta("color-scheme", light ? "light only" : "dark");
  setMeta("supported-color-schemes", light ? "light only" : "dark");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    if (bg) themeColor.setAttribute("content", bg);
  }
})();

function cssVar(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}
