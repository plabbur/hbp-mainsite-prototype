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
  page.evaluate(
    ({ max, SPAN }) => (window.scrollY / max) * SPAN,
    { max, SPAN },
  );

// [label, jump T, expected settle T (null = no snap)]
const cases = [
  ["free zoom holds", 5, 5],
  ["little into About commits", 10.4, 11.4],
  ["nudge past About stays", 11.7, 11.4],
  ["mid About-exit commits to Values", 12.6, 14.8],
  ["scroll up from Values returns to About", 13.4, 11.4],
  ["jump deep to Sponsors range", 33.2, 34.6],
  ["up into Projects range", 30.4, 29.6],
  ["tail commits to blank end", 42.9, 44],
];

for (const [label, T, expected] of cases) {
  await jumpTo(T);
  await page.waitForTimeout(2600);
  const settled = await readT();
  const pass = Math.abs(settled - expected) < 0.12;
  console.log(
    `${pass ? "PASS" : "FAIL"} ${label}: jumped ${T} -> settled ${settled.toFixed(2)} (expected ${expected})`,
  );
}

await browser.close();
console.log("done");
