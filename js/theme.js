(function applyThemeFromURL() {
  const param = new URLSearchParams(location.search).get("theme");
  if (param === "1" || param === "3") {
    document.documentElement.setAttribute("data-theme", param);
  } else {
    document.documentElement.setAttribute("data-theme", "2");
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    if (bg) meta.setAttribute("content", bg);
  }
})();

function cssVar(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}
