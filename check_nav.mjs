import { chromium } from "playwright";

const SPAN = 44;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (err) => console.log("[pageerror]", err.message));
await page.goto("http://localhost:4173", { waitUntil: "load" });
await page.waitForTimeout(7500);

const max = await page.evaluate(
  () => document.querySelector(".hero").offsetHeight - innerHeight,
);
const jumpTo = (T) =>
  page.evaluate((y) => window.scrollTo(0, y), Math.round((max * T) / SPAN));
const readT = () =>
  page.evaluate(({ max, SPAN }) => (window.scrollY / max) * SPAN, {
    max,
    SPAN,
  });
const expect = (label, actual, wanted, tolerance = 0.12) => {
  const pass = Math.abs(actual - wanted) < tolerance;
  console.log(
    `${pass ? "PASS" : "FAIL"} ${label}: ${actual.toFixed(2)} (expected ${wanted})`,
  );
};

// Settle at the About dwell.
await jumpTo(11.4);
await page.waitForTimeout(2500);
expect("start at About dwell", await readT(), 11.4);

// Forward jump: About -> Testimonials, skipping Values and Speakers.
// Poll: neither skipped section may ever be user-visible mid-jump.
await page.click('[data-section="testimonials"]');
let valuesLeaked = false;
let speakersLeakedForward = false;
for (let elapsed = 0; elapsed < 3600; elapsed += 120) {
  await page.waitForTimeout(120);
  if (elapsed === 720) {
    await page.screenshot({ path: "/tmp/nav-jump-exit.png" });
  }
  if (elapsed === 1560) {
    await page.screenshot({ path: "/tmp/nav-jump-enter.png" });
  }
  const leak = await page.evaluate(() => {
    const visible = (sectionSel, contentSel) => {
      const section = document.querySelector(sectionSel);
      const sectionStyles = getComputedStyle(section);
      if (sectionStyles.display === "none") return false;
      if (Number(sectionStyles.opacity) < 0.03) return false;
      return (
        Number(getComputedStyle(document.querySelector(contentSel)).opacity) >
        0.03
      );
    };
    return {
      values: visible("#section-values", "#values-title"),
      speakers: visible("#section-speakers", ".speakers-title"),
    };
  });
  if (leak.values) valuesLeaked = true;
  if (leak.speakers) speakersLeakedForward = true;
}
console.log(
  `${valuesLeaked ? "FAIL" : "PASS"} skipped Values never visible during About -> Testimonials`,
);
console.log(
  `${speakersLeakedForward ? "FAIL" : "PASS"} skipped Speakers never visible during About -> Testimonials`,
);
await page.screenshot({ path: "/tmp/nav-jump-settled.png" });
expect("landed at Testimonials dwell", await readT(), 24.6);

// Ordering consistency: scrolling up a little must reach Speakers.
await jumpTo(23.5);
await page.waitForTimeout(2600);
expect("scroll up from Testimonials reaches Speakers", await readT(), 19.7);

// Backward jump: Speakers -> About plays Speakers' unwind, About's return.
await page.click('[data-section="about"]');
await page.waitForTimeout(1900);
await page.screenshot({ path: "/tmp/nav-jump-back-mid.png" });
await page.waitForTimeout(2400);
await page.screenshot({ path: "/tmp/nav-jump-back-settled.png" });
expect("landed back at About dwell", await readT(), 11.4);

// Values -> Testimonials: Speakers sits between them and must never be
// visible at any point during the jump (poll continuously).
await page.click('[data-section="values"]');
await page.waitForTimeout(4200);
expect("settled at Values dwell", await readT(), 14.8);
await page.click('[data-section="testimonials"]');
let speakersLeaked = false;
for (let elapsed = 0; elapsed < 4200; elapsed += 130) {
  await page.waitForTimeout(130);
  const visible = await page.evaluate(() => {
    const styles = getComputedStyle(
      document.querySelector("#section-speakers"),
    );
    return styles.display !== "none" && Number(styles.opacity) > 0.03;
  });
  if (visible) {
    speakersLeaked = true;
    console.log(`  speakers visible at ~${elapsed + 130}ms`);
  }
}
console.log(
  `${speakersLeaked ? "FAIL" : "PASS"} Speakers never visible during Values -> Testimonials`,
);
expect("landed at Testimonials dwell again", await readT(), 24.6);

// Liveness: after all the jumps, the scrub must still drive the visuals.
// Scroll to the Values dwell and verify the nav underline follows (a
// frozen playhead never updates the is-current classes).
await jumpTo(14.8);
await page.waitForTimeout(2600);
const liveState = await page.evaluate(() => ({
  valuesCurrent: document
    .querySelector('[data-section="values"]')
    .classList.contains("is-current"),
  valuesVisible:
    getComputedStyle(document.querySelector("#section-values")).display !==
    "none",
  titleOpacity: Number(
    getComputedStyle(document.querySelector("#values-title")).opacity,
  ),
}));
console.log(
  `${liveState.valuesCurrent && liveState.valuesVisible && liveState.titleOpacity > 0.9 ? "PASS" : "FAIL"} scrub still drives visuals after jumps (${JSON.stringify(liveState)})`,
);

await browser.close();
console.log("done");
