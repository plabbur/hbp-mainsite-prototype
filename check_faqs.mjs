import { chromium } from "playwright";

const SPAN = 44;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (err) => console.log("[pageerror]", err.message));
await page.goto("http://localhost:4173", { waitUntil: "load" });
await page.waitForTimeout(7500);

const { max, faqsTop, faqsHeight, docHeight } = await page.evaluate(() => ({
  max: document.querySelector(".hero").offsetHeight - innerHeight,
  faqsTop: document.querySelector("#faqs").offsetTop,
  faqsHeight: document.querySelector("#faqs").offsetHeight,
  docHeight: document.documentElement.scrollHeight,
}));
const readY = () => page.evaluate(() => window.scrollY);

// Handoff: end of the hero shows the solid FAQs top color.
await page.evaluate((y) => window.scrollTo(0, y), max - 10);
await page.waitForTimeout(2600);
await page.screenshot({ path: "/tmp/faqs-handoff.png" });

// FAQs content in view.
await page.evaluate(({ faqsTop }) => window.scrollTo(0, faqsTop + innerHeight * 0.15), { faqsTop });
await page.waitForTimeout(1800);
const settledInFaqs = await readY();
await page.waitForTimeout(1500);
const stillInFaqs = await readY();
console.log(
  `${Math.abs(stillInFaqs - settledInFaqs) < 2 ? "PASS" : "FAIL"} no snap yank inside FAQs (y ${settledInFaqs} -> ${stillInFaqs})`,
);
await page.screenshot({ path: "/tmp/faqs-top.png" });

// Accordion: open the second question, verify the answer expands.
const before = await page.evaluate(() => {
  const item = document.querySelectorAll(".faq-item")[1];
  return item.querySelector(".faq-answer").getBoundingClientRect().height;
});
await page.evaluate(() => document.querySelectorAll(".faq-q")[1].click());
await page.waitForTimeout(700);
const after = await page.evaluate(() => {
  const item = document.querySelectorAll(".faq-item")[1];
  return item.querySelector(".faq-answer").getBoundingClientRect().height;
});
console.log(
  `${before === 0 && after > 10 ? "PASS" : "FAIL"} accordion expands (answer height ${before} -> ${after})`,
);
await page.screenshot({ path: "/tmp/faqs-accordion.png" });

// Sock illustration.
await page.evaluate(
  ({ faqsTop, faqsHeight }) =>
    window.scrollTo(0, faqsTop + faqsHeight * 0.78 - innerHeight / 2),
  { faqsTop, faqsHeight },
);
await page.waitForTimeout(1200);
await page.screenshot({ path: "/tmp/faqs-sock.png" });

// Footer + mailing form.
await page.evaluate((y) => window.scrollTo(0, y), docHeight);
await page.waitForTimeout(800);
await page.fill(".footer-form input", "test@example.com");
await page.click(".footer-submit");
await page.waitForTimeout(300);
const submitState = await page.evaluate(() => ({
  label: document.querySelector(".footer-submit").textContent,
  value: document.querySelector(".footer-form input").value,
}));
console.log(
  `${submitState.label === "THANKS!" && submitState.value === "" ? "PASS" : "FAIL"} mail form submits (button "${submitState.label}", input "${submitState.value}")`,
);
await page.screenshot({ path: "/tmp/faqs-footer.png" });

// Nav jump into FAQs from a section.
await page.evaluate(({ max, SPAN }) => window.scrollTo(0, (max * 29.6) / SPAN), { max, SPAN });
await page.waitForTimeout(2600);
await page.click('[data-section="faqs"]');
await page.waitForTimeout(4200);
const landedY = await readY();
const expected = max + 900;
console.log(
  `${Math.abs(landedY - expected) < 30 ? "PASS" : "FAIL"} nav jump lands in FAQs (y ${landedY}, expected ~${expected})`,
);
await page.screenshot({ path: "/tmp/faqs-nav-landed.png" });

await browser.close();
console.log("done");
