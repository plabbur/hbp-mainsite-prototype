// Prototyping tools (local dev only, or ?dev=1).
//
// A round button in the bottom-right corner switches the prototype into
// dev mode. Dev mode swaps the page for a preview shell: a segmented
// control at the top picks the small (402), medium (1000) or large (1512)
// view, and the site runs inside an iframe of exactly that width, so every
// breakpoint's media queries apply, scaled down to fit the window. Under
// the preview, a switch turns the scroll-driven animations on or off.
//
// Scroll animations OFF forces the stacked page (the phone layout's plain,
// non-scroll-driven mode) at any screen size, so each section can be
// prototyped on its own. The choice is remembered in localStorage and read
// before first paint by the inline script in index.html; ?scroll=off and
// ?scroll=on set it from the URL too.
(() => {
  const KEY = "hbp:scroll-animations";
  const MODE_KEY = "hbp:dev-mode";
  const VIEW_KEY = "hbp:dev-view";
  const params = new URLSearchParams(location.search);
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\]|.+\.local|.+\.test)$/.test(
    location.hostname,
  );
  if (!isLocal && params.get("dev") !== "1") return;
  // The page previewed inside the shell gets no dev UI of its own.
  if (window.self !== window.top || params.get("embed") === "1") return;

  // Figma frame sizes for each breakpoint.
  const VIEWS = {
    small: { width: 402, height: 874, label: "Small" },
    medium: { width: 1000, height: 982, label: "Medium" },
    large: { width: 1512, height: 982, label: "Large" },
  };

  const storage = {
    get: (key) => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set: (key, value) => {
      try {
        if (value == null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch {}
    },
  };

  const icons = {
    menu: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
    close: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
    small: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/></svg>`,
    medium: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="3" width="15" height="18" rx="2"/><path d="M11 18h2"/></svg>`,
    large: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4.5" width="18" height="12" rx="1.5"/><path d="M9 20h6M12 16.5V20"/></svg>`,
  };

  const style = document.createElement("style");
  style.textContent = `
    html.hbp-dev-on,
    html.hbp-dev-on body {
      overflow: hidden !important;
    }
    html.hbp-dev-on body > :not(.hbp-dev-ui) {
      visibility: hidden !important;
    }
    .hbp-dev-ui {
      font: 12px/1.2 system-ui, -apple-system, sans-serif;
      color: #1e1e1e;
    }

    /* Round toggle, bottom-right. */
    .hbp-dev-fab {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 10002;
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      padding: 0;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 50%;
      background: #fff;
      color: #1e1e1e;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .hbp-dev-fab:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
    }
    .hbp-dev-fab svg,
    .hbp-dev-seg svg {
      width: 20px;
      height: 20px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.6;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    /* Preview shell. */
    .hbp-dev-shell {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: none;
      background: #f2f2f2;
    }
    html.hbp-dev-on .hbp-dev-shell {
      display: block;
    }
    .hbp-dev-bar {
      position: absolute;
      top: 12px;
      left: 50%;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      transform: translateX(-50%);
    }
    .hbp-dev-segs {
      display: flex;
      gap: 2px;
      padding: 3px;
      border: 1px solid #e6e6e6;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    }
    .hbp-dev-seg {
      display: grid;
      place-items: center;
      width: 34px;
      height: 28px;
      padding: 0;
      border: 1px solid transparent;
      border-radius: 6px;
      background: none;
      color: #8c8c8c;
      cursor: pointer;
    }
    .hbp-dev-seg:hover {
      color: #1e1e1e;
    }
    .hbp-dev-seg[aria-checked="true"] {
      border-color: #e6e6e6;
      background: #f5f5f5;
      color: #1e1e1e;
    }
    /* Device and the scroll switch, centred as one column. */
    .hbp-dev-stage {
      position: absolute;
      inset: 56px 0 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      overflow: hidden;
    }
    .hbp-dev-device {
      position: relative;
      flex: none;
      overflow: hidden;
      border: 6px solid #000;
      border-radius: 18px;
      background: #000;
      transform-origin: 50% 50%;
    }
    .hbp-dev-device[data-view="small"] {
      border-width: 12px;
      border-radius: 56px;
    }
    .hbp-dev-device[data-view="medium"] {
      border-width: 14px;
      border-radius: 32px;
    }
    .hbp-dev-device iframe {
      display: block;
      border: 0;
      background: #0b0d21;
    }

    /* Scroll animations switch, beneath the device; same container as
       the size control. */
    .hbp-dev-panel {
      display: flex;
      flex: none;
      align-items: center;
      gap: 10px;
      height: 36px;
      padding: 0 6px 0 12px;
      border: 1px solid #e6e6e6;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
      cursor: pointer;
      user-select: none;
    }
    .hbp-dev-switch {
      position: relative;
      flex: none;
      width: 32px;
      height: 18px;
      margin: 0;
      border-radius: 9px;
      background: #d9d9d9;
      appearance: none;
      cursor: pointer;
      transition: background-color 0.15s ease;
    }
    .hbp-dev-switch::after {
      content: "";
      position: absolute;
      top: 2px;
      left: 2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      transition: transform 0.15s ease;
    }
    .hbp-dev-switch:checked {
      background: #1e1e1e;
    }
    .hbp-dev-switch:checked::after {
      transform: translateX(14px);
    }
    .hbp-dev-switch:focus-visible {
      outline: 2px solid #0d99ff;
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);

  const root = document.createElement("div");
  root.className = "hbp-dev-ui";
  root.innerHTML = `
    <div class="hbp-dev-shell">
      <div class="hbp-dev-bar">
        <div class="hbp-dev-segs" role="radiogroup" aria-label="Preview size">
          ${Object.entries(VIEWS)
            .map(
              ([key, view]) =>
                `<button type="button" class="hbp-dev-seg" role="radio" data-view="${key}"
                  aria-checked="false" aria-label="${view.label} (${view.width}px)"
                  title="${view.label} · ${view.width}px">${icons[key]}</button>`,
            )
            .join("")}
        </div>
      </div>
      <div class="hbp-dev-stage">
        <div class="hbp-dev-device"><iframe title="Prototype preview"></iframe></div>
        <label class="hbp-dev-panel">
          Scroll animations
          <input type="checkbox" class="hbp-dev-switch" role="switch" />
        </label>
      </div>
    </div>
    <button type="button" class="hbp-dev-fab"></button>`;

  const html = document.documentElement;
  const fab = root.querySelector(".hbp-dev-fab");
  const stage = root.querySelector(".hbp-dev-stage");
  const device = root.querySelector(".hbp-dev-device");
  const frame = device.querySelector("iframe");
  const segs = root.querySelectorAll(".hbp-dev-seg");
  const panel = root.querySelector(".hbp-dev-panel");
  const toggle = panel.querySelector("input");

  // The previewed page: same URL, flagged so it skips the dev UI.
  const frameUrl = () => {
    const query = new URLSearchParams(location.search);
    query.delete("scroll");
    query.set("embed", "1");
    return `${location.pathname}?${query}`;
  };

  let view = VIEWS[storage.get(VIEW_KEY)] ? storage.get(VIEW_KEY) : "large";

  const fitDevice = () => {
    const { width, height } = VIEWS[view];
    const bezel = parseFloat(getComputedStyle(device).borderTopWidth) || 0;
    const outerW = width + bezel * 2;
    const outerH = height + bezel * 2;
    // Leave room below for the scroll switch and the gap above it.
    const below = panel.offsetHeight + 16;
    const scale = Math.min(
      1,
      (stage.clientWidth - 32) / outerW,
      (stage.clientHeight - 24 - below) / outerH,
    );
    device.style.transform = `scale(${scale.toFixed(4)})`;
    // Transforms don't shrink the layout box; negative margins do, so the
    // scaled device stays centred in the stage.
    device.style.margin = `${((outerH * (scale - 1)) / 2).toFixed(1)}px ${((outerW * (scale - 1)) / 2).toFixed(1)}px`;
  };

  const setView = (next) => {
    view = next;
    storage.set(VIEW_KEY, next);
    segs.forEach((seg) =>
      seg.setAttribute("aria-checked", String(seg.dataset.view === next)),
    );
    const { width, height } = VIEWS[next];
    device.dataset.view = next;
    frame.style.width = `${width}px`;
    frame.style.height = `${height}px`;
    fitDevice();
  };

  const setFab = (on) => {
    fab.innerHTML = on ? icons.close : icons.menu;
    fab.setAttribute("aria-label", on ? "Exit dev mode" : "Enter dev mode");
    fab.title = on ? "Exit dev mode" : "Dev mode";
  };

  const enterDevMode = () => {
    storage.set(MODE_KEY, "on");
    html.classList.add("hbp-dev-on");
    setFab(true);
    setView(view);
    if (!frame.getAttribute("src")) frame.src = frameUrl();
    toggle.checked = storage.get(KEY) !== "off";
  };

  // The page underneath was hidden (and never resized) while the preview
  // ran, so reload it rather than trust its layout.
  const exitDevMode = () => {
    storage.set(MODE_KEY, null);
    location.reload();
  };

  fab.addEventListener("click", () =>
    html.classList.contains("hbp-dev-on") ? exitDevMode() : enterDevMode(),
  );
  segs.forEach((seg) =>
    seg.addEventListener("click", () => setView(seg.dataset.view)),
  );
  window.addEventListener("resize", () => {
    if (html.classList.contains("hbp-dev-on")) fitDevice();
  });

  // Scroll animations: remember the choice and reload the preview into the
  // other page mode from the top.
  toggle.addEventListener("change", () => {
    storage.set(KEY, toggle.checked ? null : "off");
    frame.src = frameUrl();
  });

  document.body.appendChild(root);
  setFab(false);
  if (storage.get(MODE_KEY) === "on") enterDevMode();
})();
