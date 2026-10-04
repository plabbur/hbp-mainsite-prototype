// Prototyping tools: a small floating panel (local dev only, or ?dev=1)
// with a switch for the scroll-driven animations and a section jumper.
//
// Scroll animations OFF forces the stacked page (the phone layout's plain,
// non-scroll-driven mode) at any screen size, so each section can be
// prototyped on its own. The choice is remembered in localStorage and read
// before first paint by the inline script in index.html; ?scroll=off and
// ?scroll=on set it from the URL too.
(() => {
  const KEY = "hbp:scroll-animations";
  const params = new URLSearchParams(location.search);
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\]|.+\.local|.+\.test)$/.test(
    location.hostname,
  );
  if (!isLocal && params.get("dev") !== "1") return;

  const animationsOff = document.documentElement.classList.contains(
    "scroll-anim-off",
  );

  const panel = document.createElement("div");
  panel.className = "hbp-dev";
  panel.innerHTML = `
    <style>
      .hbp-dev {
        position: fixed;
        left: 12px;
        bottom: 12px;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 10px;
        background: rgba(10, 11, 30, 0.86);
        color: #fff;
        font: 12px/1.2 system-ui, sans-serif;
        backdrop-filter: blur(6px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      }
      .hbp-dev label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
      .hbp-dev input { accent-color: #e9ac1d; cursor: pointer; }
      .hbp-dev select {
        padding: 3px 4px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 6px;
        background: #15173b;
        color: #fff;
        font: inherit;
      }
      .hbp-dev__tag { opacity: 0.55; letter-spacing: 0.04em; text-transform: uppercase; }
    </style>
    <span class="hbp-dev__tag">Dev</span>
    <label>
      <input type="checkbox" ${animationsOff ? "" : "checked"} />
      Scroll animations
    </label>
    <select aria-label="Jump to section">
      <option value="">Jump to…</option>
      <option value="top">Top</option>
    </select>`;

  // Toggle: remember the choice, drop any ?scroll= param, and reload into
  // the other page mode from the top.
  panel.querySelector("input").addEventListener("change", (event) => {
    try {
      if (event.target.checked) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, "off");
    } catch {}
    params.delete("scroll");
    const query = params.toString();
    window.scrollTo(0, 0);
    location.replace(location.pathname + (query ? `?${query}` : ""));
  });

  // Jumper: reuses the navbar's own section links, so it behaves exactly
  // like the nav in either mode.
  const select = panel.querySelector("select");
  document.querySelectorAll(".site-nav__links > a[data-section]").forEach((link) => {
    const option = document.createElement("option");
    option.value = link.dataset.section;
    option.textContent = link.textContent;
    select.appendChild(option);
  });
  select.addEventListener("change", () => {
    const key = select.value;
    select.value = "";
    if (key === "top") {
      document.querySelector(".site-nav__logo")?.click();
    } else if (key) {
      document
        .querySelector(`.site-nav__links > a[data-section="${key}"]`)
        ?.click();
    }
  });

  document.body.appendChild(panel);
})();
