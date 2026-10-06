(() => {
  const DESIGN_WIDTH = 1512;
  const DESIGN_HEIGHT = 982;
  const fit = document.querySelector("#scene-fit");
  const sceneBg = document.querySelector("#scene-bg");
  const sceneFg = document.querySelector("#scene-fg");
  const hero = document.querySelector("#hero");
  const viewport = document.querySelector(".hero__viewport");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Phones and narrow windows: a plain stacked page instead of the
  // scroll-driven scene (flag set by the inline script in index.html).
  const staticScroll =
    document.documentElement.classList.contains("static-scroll");

  const sectionFits = document.querySelectorAll(".section-fit");
  const flowCanvases = document.querySelectorAll(".flow-canvas");
  const heroSmallArt = document.querySelector(".hero-small__art");
  const mediumQuery = window.matchMedia(
    "(min-width: 600px) and (max-width: 1179.98px)",
  );

  function fitSceneToViewport() {
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const coverScale = Math.max(
      viewportWidth / DESIGN_WIDTH,
      viewportHeight / DESIGN_HEIGHT,
    );

    if (mediumQuery.matches) {
      // Medium (Figma 1000x982): cover-fit a 1000x982 frame, then scale and
      // nudge the scene so the resting museum lands at Figma's medium spot
      // (1291 wide at x -144, y 215 when the frame is exactly 1000x982).
      const frame = Math.max(viewportWidth / 1000, viewportHeight / 982);
      fit.style.transform =
        `translate(-50%, -50%) translate(${(23.1 * frame).toFixed(2)}px, ` +
        `${(-42.8 * frame).toFixed(2)}px) scale(${(1.1582 * frame).toFixed(5)})`;
    } else {
      fit.style.transform =
        `translate(-50%, -50%) scale(${coverScale.toFixed(5)})`;
    }

    // Small: the static night composition (402x874) cover-fits the hero.
    const smallScale = Math.max(viewportWidth / 402, viewportHeight / 874);
    heroSmallArt.style.transform =
      `translate(-50%, -50%) scale(${smallScale.toFixed(5)})`;

    // Contain-fit: the panel gradient fills the viewport, so letterboxing
    // is invisible and section content never gets cropped. Each artboard's
    // size comes from CSS, so responsive sections (About) can swap to a
    // smaller artboard per breakpoint.
    sectionFits.forEach((element) => {
      // Computed (not offset) size: hidden sections have no layout box.
      const styles = getComputedStyle(element);
      const artWidth = parseFloat(styles.width);
      let artHeight = parseFloat(styles.height);
      let scale;
      let boxHeight = viewportHeight;
      if (staticScroll) {
        // Stacked page: fit the width and let the section grow to the
        // artboard's height (tall phone artboards scroll; CSS keeps each
        // section at least one screen tall).
        const pageWidth = document.documentElement.clientWidth;
        scale = pageWidth / artWidth;
        // Artboards whose copy can run past the design (a long bio)
        // lengthen to fit it: data-grow names the last element, which
        // keeps 32 artboard px of room below it.
        if (element.dataset.grow && element.getClientRects().length) {
          element.style.height = "";
          const designHeight = parseFloat(getComputedStyle(element).height);
          const last = element.querySelector(element.dataset.grow);
          const canvasTop = element.getBoundingClientRect().top;
          const shown = element.getBoundingClientRect().width / artWidth;
          const end =
            (last.getBoundingClientRect().bottom - canvasTop) / shown + 32;
          artHeight = Math.max(designHeight, Math.ceil(end));
          element.style.height = `${artHeight}px`;
        }
        const section = element.closest(".stage-section");
        boxHeight = artHeight * scale;
        if (section) {
          section.style.height = `${boxHeight.toFixed(2)}px`;
          boxHeight = section.offsetHeight || boxHeight;
        }
      } else {
        scale = Math.min(
          viewportWidth / artWidth,
          viewportHeight / artHeight,
        );
      }
      element.style.transform =
        `translate(-50%, -50%) scale(${scale.toFixed(5)})`;
      // Text never grows past its design size (see --tx in styles.css).
      element.style.setProperty("--tx", Math.min(1, 1 / scale).toFixed(5));
      // Letterbox depth in artboard px, so edge art (the About mists) can
      // stay pinned to the section's edges instead of the artboard's.
      const bleedX = Math.max(0, (viewportWidth / scale - artWidth) / 2);
      const bleedY = Math.max(0, (boxHeight / scale - artHeight) / 2);
      element.style.setProperty("--bleed-x", `${bleedX.toFixed(2)}px`);
      element.style.setProperty("--bleed-y", `${bleedY.toFixed(2)}px`);
    });

    // Post-hero flow artboards (the FAQs art + footer stage) fit the page
    // width; the artboard width comes from CSS per breakpoint, and the
    // stage's aspect-ratio keeps its height in step. Zoom, not a transform,
    // so the art's blend modes still composite with the section behind.
    const pageWidth = document.documentElement.clientWidth;
    flowCanvases.forEach((element) => {
      const artWidth = parseFloat(getComputedStyle(element).width);
      const zoom = pageWidth / artWidth;
      element.style.zoom = zoom.toFixed(5);
      element.style.setProperty("--tx", Math.min(1, 1 / zoom).toFixed(5));
    });
  }

  fitSceneToViewport();
  // Copy that grows an artboard is measured again once the fonts are in.
  document.fonts?.ready.then(fitSceneToViewport);
  window.addEventListener("resize", fitSceneToViewport, { passive: true });
  window.visualViewport?.addEventListener("resize", fitSceneToViewport, {
    passive: true,
  });

  if (!window.gsap || !window.ScrollTrigger) {
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const sun = document.querySelector(".sun");
  const moon = document.querySelector(".moon");
  const sky = document.querySelector("#sky");
  const skyShade = document.querySelector("#sky-shade");
  const grassHills = document.querySelector("#grass-hills");
  const grassFill = document.querySelector("#grass-fill");
  const grassLayers = [grassHills, grassFill];
  const starsFar = document.querySelector(".star-field--far");
  const starsNear = document.querySelector(".star-field--near");
  const skylineDay = document.querySelector(".skyline--day");
  const skylineTwilight = document.querySelector(".skyline--twilight");
  const skylineNight = document.querySelector(".skyline--night");
  const museumDay = document.querySelector(".museum--day");
  const museumNight = document.querySelector(".museum--night");
  const lightFixtures = gsap.utils.toArray(".light-off");
  const leftSpotlight = document.querySelector(".spotlight--left");
  const rightSpotlight = document.querySelector(".spotlight--right");
  const title = document.querySelector(".event-title");
  const sponsors = document.querySelector(".sponsor-lockup");
  const moonBanner = document.querySelector("#mlh-banner");
  const stageBackdrop = document.querySelector("#stage-backdrop");
  const sectionAbout = document.querySelector("#section-about");
  const sectionValues = document.querySelector("#section-values");
  const candles = gsap.utils.toArray(".candle");
  const valuesTitle = document.querySelector("#values-title");
  const pillarGroups = gsap.utils.toArray(".pillar-group");
  const pillarTops = gsap.utils.toArray(".pillar-top");
  const pillarImgs = gsap.utils.toArray(".pillar-img");
  const vases = gsap.utils.toArray(".vase");
  const sectionSpeakers = document.querySelector("#section-speakers");
  const speakersTitle = document.querySelector("#speakers-title");
  const speakerStage = document.querySelector("#speaker-stage");
  const speakerPhoto = document.querySelector("#speaker-photo");
  const speakerCurtain = document.querySelector("#speaker-curtain");
  const speakerRailings = gsap.utils.toArray(".speaker-railing");
  const speakerInfo = document.querySelector("#speaker-info");
  const speakerName = speakerInfo.querySelector(".speaker-name");
  const speakerRole = speakerInfo.querySelector(".speaker-role");
  const speakerBio = speakerInfo.querySelector(".speaker-bio");
  const speakerControls = document.querySelector("#speaker-controls");
  const speakerCopy = document.querySelector("#speaker-copy");
  const speakerPrev = document.querySelector(".speaker-arrow--prev");
  const speakerNext = document.querySelector(".speaker-arrow--next");
  const sectionTestimonials = document.querySelector("#section-testimonials");
  const testiScene = document.querySelector("#testi-scene");
  const testiHall = document.querySelector("#testi-hall");
  const testiMistLeft = document.querySelector("#testi-mist-left");
  const testiMistRight = document.querySelector("#testi-mist-right");
  const testiStars = document.querySelector("#testi-stars");
  const testiCopy = document.querySelector("#testi-copy");
  const testiTitle = document.querySelector("#testi-title");
  const testiMedallion = document.querySelector("#testi-medallion");
  const testiPhoto = document.querySelector("#testi-photo");
  const testiPhotoLabel = document.querySelector("#testi-photo-label");
  const testiQuote = document.querySelector("#testi-quote");
  const testiQuoteText = testiQuote.querySelector(".testi-quote__text");
  const testiQuoteName = testiQuote.querySelector(".testi-quote__name");
  const testiQuoteSchool = testiQuote.querySelector(".testi-quote__school");
  const testiControls = document.querySelector("#testi-controls");
  const testiPrev = document.querySelector(".testi-arrow--prev");
  const testiNext = document.querySelector(".testi-arrow--next");
  const navAboutLink = document.querySelector('[data-section="about"]');
  const navValuesLink = document.querySelector('[data-section="values"]');
  const navSpeakersLink = document.querySelector('[data-section="speakers"]');
  const navTestimonialsLink = document.querySelector(
    '[data-section="testimonials"]',
  );
  const sectionProjects = document.querySelector("#section-projects");
  const projectsDoorway = document.querySelector("#projects-doorway");
  const projectsDino = document.querySelector("#projects-dino");
  const projectsArches = document.querySelector("#projects-arches");
  const projectsArchSlabs = document.querySelector("#projects-arch-slabs");
  const projectsWallsGroup = document.querySelector("#projects-walls-group");
  // The frieze and lighting wash only blend correctly over the walls.
  const projectsHallOverlays = [
    document.querySelector("#projects-frieze"),
    document.querySelector("#projects-lighting"),
  ];
  // Their resting opacities (set in CSS), read before any tween touches them.
  const projectsOverlayOpacity = projectsHallOverlays.map((layer) =>
    parseFloat(getComputedStyle(layer).opacity),
  );
  const projectsCopy = document.querySelector("#projects-copy");
  const projectsTitle = document.querySelector("#projects-title");
  const projectFrame = document.querySelector("#project-frame");
  const projectImage = document.querySelector("#project-image");
  const projectDetails = document.querySelector("#project-details");
  const projectLink = projectDetails.querySelector(".project-link");
  const projectNameText = projectDetails.querySelector(".project-name__text");
  const projectAuthors = projectDetails.querySelector(".project-authors");
  const projectDescription = projectDetails.querySelector(
    ".project-description",
  );
  const projectsControls = document.querySelector("#projects-controls");
  const projectsPrev = document.querySelector(".projects-arrow--prev");
  const projectsNext = document.querySelector(".projects-arrow--next");
  const navProjectsLink = document.querySelector('[data-section="projects"]');
  const sectionSponsors = document.querySelector("#section-sponsors");
  const sponsorsBg = document.querySelector("#sponsors-bg");
  const sponsorsCopy = document.querySelector("#sponsors-copy");
  const sponsorsTitle = document.querySelector("#sponsors-title");
  const sponsorFrames = gsap.utils.toArray(".sponsor-frame");
  const sponsorsCta = document.querySelector("#sponsors-cta");
  const navSponsorsLink = document.querySelector('[data-section="sponsors"]');
  const sectionTeam = document.querySelector("#section-team");
  const teamTitle = document.querySelector("#team-title");
  const teamRows = gsap.utils.toArray(".team-row");
  const teamFloor = document.querySelector("#team-floor");
  const teamNav = document.querySelector("#team-nav");
  const navTeamLink = document.querySelector('[data-section="team"]');
  const navFaqsLink = document.querySelector('[data-section="faqs"]');
  const museumShadow = document.querySelector("#museum-shadow");
  const bushLayers = gsap.utils.toArray(".bushes");
  const stoneLayers = gsap.utils.toArray(".staircase");
  const shootingLayer = document.querySelector("#shooting-stars");
  const hudIntro = document.querySelector("#hud-intro");
  const nav = document.querySelector("#site-nav");

  const clamp01 = gsap.utils.clamp(0, 1);
  const smoothstep = (value) => {
    const progress = clamp01(value);
    return progress * progress * (3 - 2 * progress);
  };
  const sunMotion = { progress: 0 };
  const moonMotion = { progress: 0 };
  const setSunX = gsap.quickSetter(sun, "x", "px");
  const setSunY = gsap.quickSetter(sun, "y", "px");
  const setSunOpacity = gsap.quickSetter(sun, "opacity");
  const setSunScale = gsap.quickSetter(sun, "scale");
  const setMoonX = gsap.quickSetter(moon, "x", "px");
  const setMoonY = gsap.quickSetter(moon, "y", "px");
  const setMoonOpacity = gsap.quickSetter(moon, "opacity");
  const setMoonScale = gsap.quickSetter(moon, "scale");
  const setMoonRotation = gsap.quickSetter(moon, "rotation", "deg");

  const getOrbitOffset = (phase) => ({
    x: 1415 * phase,
    y:
      -140 * Math.sin(Math.PI * phase) +
      300 * phase * phase * phase,
  });

  const setShadowSkew = gsap.quickSetter(museumShadow, "skewX", "deg");
  const setShadowX = gsap.quickSetter(museumShadow, "x", "px");
  const setShadowScaleX = gsap.quickSetter(museumShadow, "scaleX");
  const setShadowOpacity = gsap.quickSetter(museumShadow, "opacity");

  const updateSunOrbit = () => {
    const progress = sunMotion.progress;
    const fade = smoothstep((progress - 0.84) / 0.14);
    const position = getOrbitOffset(progress);

    setSunX(position.x);
    setSunY(position.y);
    setSunOpacity(1 - fade);
    setSunScale(1 - 0.04 * smoothstep((progress - 0.72) / 0.28));

    // The museum's ground shadow leans away from the sun, stretching as
    // the sun drops toward the horizon and dissolving once it sets.
    const sunCenterX = 154.5 + position.x;
    const lean = (756 - sunCenterX) / 28;
    setShadowSkew(lean);
    setShadowX(lean * 2.2);
    setShadowScaleX(1 + Math.abs(lean) / 55);
    setShadowOpacity(0.8 * (1 - fade));
  };

  const updateMoonOrbit = () => {
    const progress = moonMotion.progress;
    const eased = smoothstep(progress);
    const position = getOrbitOffset(-0.28 * (1 - eased));

    setMoonX(position.x);
    setMoonY(position.y);
    setMoonOpacity(smoothstep((progress - 0.18) / 0.32));
    setMoonScale(0.8 + 0.2 * eased);
    setMoonRotation(-5 * (1 - eased));
  };

  gsap.set([sun, moon], { transformOrigin: "50% 50%" });
  updateSunOrbit();
  updateMoonOrbit();
  gsap.set(title, { y: -18, scale: 0.95, transformOrigin: "50% 50%" });
  gsap.set(sponsors, { y: -10 });
  gsap.set(moonBanner, { y: -210 });
  gsap.set(nav, { autoAlpha: 0, y: -14 });
  // Tucked below the bush line, ready to pop up at nightfall.
  gsap.set(lightFixtures, { y: 90 });
  gsap.set([...bushLayers, ...stoneLayers, ...grassLayers], {
    filter: "brightness(1)",
  });

  // --- FAQs accordion + footer wiring (works with reduced motion too) ---
  // Only one answer open at a time: opening one closes the rest.
  const faqItems = document.querySelectorAll(".faq-item");
  const setFaqOpen = (item, open) => {
    if (item.classList.contains("is-open") === open) return;
    item.classList.toggle("is-open", open);
    gsap.to(item.querySelector(".faq-answer"), {
      height: open ? "auto" : 0,
      duration: reducedMotion ? 0 : 0.45,
      ease: "power2.inOut",
    });
  };
  faqItems.forEach((item) => {
    item.querySelector(".faq-q").addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      faqItems.forEach((other) => setFaqOpen(other, other === item && open));
    });
  });
  gsap.set(".faq-item.is-open .faq-answer", { height: "auto" });

  document.querySelector("#back-to-top").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });

  // Mailing list form: functional for illustration only — no backend.
  const mailForm = document.querySelector("#mail-form");
  const mailInput = mailForm.querySelector("input");
  const mailSubmit = mailForm.querySelector(".footer-submit");
  mailForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!mailInput.value.trim()) return;
    mailInput.value = "";
    mailSubmit.textContent = "THANKS!";
    mailSubmit.disabled = true;
    gsap.delayedCall(2, () => {
      mailSubmit.textContent = "SUBMIT";
      mailSubmit.disabled = false;
    });
  });

  // --- Meet the team ---
  // Roster from the Figma "Our Team" board. The first person in each team
  // is its lead; Directors are both Co-Directors. Photo boxes are in each
  // frame style's window coordinates (x, y, w, h); `crop` reproduces a
  // Figma image-fill crop (percent size and offset) when it isn't a plain
  // cover fit.
  const TEAMS = [
    {
      key: "directors",
      label: "Directors",
      style: "directors",
      members: [
        { name: "Angie Che", photo: "angie-che.jpg" },
        { name: "Susan Chen", photo: "susan-chen.jpg" },
      ],
    },
    {
      key: "tech",
      label: "Tech",
      style: "tech",
      members: [
        { name: "Aditya Pathak", photo: "aditya-pathak.jpg" },
        { name: "Andre Coullard", photo: "andre-coullard.jpg" },
        { name: "Mehana Nagarur", photo: "mehana-nagarur.jpg" },
        { name: "Michael Zhang", photo: "michael-zhang.jpg" },
        { name: "Phaedra Sanon", photo: "phaedra-sanon.jpg" },
        { name: "Shreeya A.", photo: "shreeya-a.png" },
        { name: "Yurika Kan", photo: "yurika-kan.jpg" },
      ],
    },
    {
      key: "design",
      label: "Design",
      style: "design",
      members: [
        { name: "Zahra Wibisana", photo: "zahra-wibisana.jpg" },
        {
          name: "Carolyn Hoa",
          photo: "carolyn-hoa.jpg",
          box: [-53.28, -35, 261, 279],
          crop: [111.37, 185.62, -0.02, -55.94],
        },
        { name: "Cole Abrams", photo: "cole-abrams.jpg" },
        { name: "Maia Gonzalez", photo: "maia-gonzalez.jpg" },
        { name: "Lucy Liu", photo: "lucy-liu.jpg" },
      ],
    },
    {
      key: "marketing",
      label: "Marketing",
      style: "marketing",
      members: [
        { name: "Rai Makaraju", photo: "rai-makaraju.jpg", box: [-3.27, -21.71, 172, 262] },
        { name: "Dalton Burkhart", photo: "dalton-burkhart.jpg", box: [-7.86, -9.71, 181, 276] },
        { name: "Clio Leung", photo: "clio-leung.jpg", box: [-2.44, 0.29, 171, 260] },
        { name: "Shayaan Hussain", photo: "shayaan-hussain.jpg", box: [-2.02, -1.71, 167, 254] },
        { name: "Isabel Yeow", photo: "isabel-yeow.jpg", box: [-0.61, -25.71, 166, 253] },
        { name: "Camila Carrillo", photo: "camila-carrillo.jpg", box: [-30.19, -10.71, 226, 226] },
        { name: "Justin Xu", photo: "justin-xu.jpg", box: [-22.77, -2.71, 209, 209] },
      ],
    },
    {
      key: "sponsorship",
      label: "Sponsorship",
      style: "sponsorship",
      members: [
        { name: "Jolin Yang", photo: "jolin-yang.jpg", box: [-1.36, -10.18, 286, 192] },
        { name: "Esha Kanakapura", photo: "esha-kanakapura.jpg", box: [-1.63, -10.18, 286, 192] },
        {
          name: "Amogh Athimamula",
          photo: "amogh-athimamula.jpg",
          box: [-0.91, -10.18, 286, 192],
          crop: [100, 148.96, 0, -3.79],
        },
        { name: "Tanvi Agarwal", photo: "tanvi-agarwal.jpg", box: [-1.18, -10.18, 286, 192] },
        { name: "Gauri Rajesh", photo: "gauri-rajesh.jpg", box: [-1.45, -10.18, 286, 192] },
        {
          name: "Seifer Mathias",
          photo: "seifer-mathias.jpg",
          box: [-1.45, -10.18, 286, 192],
          crop: [100, 148.96, 0, -10.34],
        },
      ],
    },
    {
      key: "operations",
      label: "Operations",
      style: "operations",
      members: [
        { name: "Nicole Ni", photo: "nicole-ni.jpg", box: [-32.4, -4.87, 203, 203] },
        { name: "Lyanne Xu", photo: "lyanne-xu.jpg", box: [-29.84, -7.87, 208, 208] },
        { name: "Nicholas Chen", photo: "nicholas-chen.jpg", box: [-62.73, -2.87, 276, 199] },
        { name: "Agrima Jain", photo: "agrima-jain.jpg", box: [-62.18, -1.87, 275, 198] },
        { name: "Rithika Ravichandran", photo: "rithika-ravichandran.jpg", box: [-67.62, -0.87, 275, 198] },
      ],
    },
  ];

  const TEAM_ASSETS = "./assets/team/";
  const px = (x, y, w, h) =>
    `left:${x}px;top:${y}px;width:${w}px;height:${h}px;`;
  const art = (file, x, y, w, h, extra = "") =>
    `<img src="${TEAM_ASSETS}${file}" alt="" style="${px(x, y, w, h)}${extra}" />`;
  const fill = (color, x, y, w, h, extra = "") =>
    `<span style="${px(x, y, w, h)}background:${color};${extra}"></span>`;

  // Each frame style: Figma size, photo window (with its own clipping),
  // the default photo box, and the frame layers drawn under / over it.
  const TEAM_STYLES = {
    directors: {
      size: [200.444, 220],
      window: [20.37, 20.37, 158.074, 178.444],
      photo: [0, 0, 158.074, 178.444],
      over:
        art("directors-frame.svg", -0.12, -0.14, 200.83, 220.4) +
        art("directors-intersect.svg", 13.73, 13.45, 173.05, 193.23),
    },
    design: {
      size: [198.333, 240],
      window: [14.17, 35, 170, 170],
      windowStyle: "border-radius:50%;background:#512309;",
      photo: [-7.5, -3.33, 184.166, 184.166],
      under:
        art("design-top.svg", 66.4, 0.25, 65.53, 26.42) +
        art("design-bottom.svg", 66.4, 213.33, 65.53, 26.42, "transform:rotate(180deg);") +
        art("design-ring.svg", 0, 20.83, 198.333, 198.333),
      over:
        art("design-dot.svg", 95.83, 19.17, 6.667, 6.667) +
        art("design-dot.svg", 95.83, 214.17, 6.667, 6.667),
    },
    tech: {
      size: [171.525, 220],
      window: [14.92, 14.91, 141.695, 190.17],
      windowStyle: "border:2.131px solid #973f13;box-sizing:border-box;",
      photo: [0, 0, 137.433, 185.908],
      under:
        fill("#ca6330", 0, 0, 171.525, 220) +
        fill(
          "#a24e25",
          5.86,
          5.86,
          159.806,
          208.281,
          "border:2.131px solid #973f13;box-sizing:border-box;",
        ) +
        [
          [0, 0, -45],
          [0, 204.75, 45],
          [156.27, 0, 45],
          [156.27, 204.75, -45],
        ]
          .map(([x, y, angle]) =>
            fill(
              "#973f13",
              x - 0.53 + 7.36,
              y - 0.53 - 2.58,
              1.598,
              21.477,
              `transform:rotate(${angle}deg);`,
            ),
          )
          .join(""),
    },
    sponsorship: {
      size: [317.273, 220],
      window: [16.36, 28.18, 283.636, 170.909],
      windowStyle: "background:#060825;",
      photo: [-1.36, -10.18, 286, 192],
      // Rectangle 141's 10.909px outside stroke frames the photo's left
      // and right edges (top and bottom sit under the wood bars).
      under:
        art("sponsorship-crest.svg", 105.45, 0, 106.364, 21.818) +
        fill("#512309", 6.36, 17.27, 304.545, 192.727),
      over:
        fill("#512309", 1.82, 12.73, 313.636, 14.545, "border-radius:0.9px;") +
        fill("#512309", 1.82, 200, 313.636, 14.545, "border-radius:0.9px;") +
        fill("#491f08", 0, 7.27, 317.273, 10, "border-radius:0.9px;") +
        fill("#491f08", 0, 210, 317.273, 10, "border-radius:0.9px;"),
    },
    operations: {
      size: [153.445, 220],
      window: [7.4, 13.87, 138.655, 193.193],
      windowStyle: "background:#cedcfc;",
      photo: [0, 0, 138.655, 193.193],
      under:
        art("operations-top.svg", 7.4, 0, 86.891, 27.731) +
        art("operations-top.svg", 59.16, 0, 86.891, 27.731) +
        art("operations-base.svg", 14.79, 203.36, 123.865, 16.639) +
        fill("#094600", 0, 6.47, 153.445, 207.983),
    },
    marketing: {
      size: [180.583, 220],
      window: [7.69, 9.71, 165.009, 201.667],
      windowStyle:
        `-webkit-mask:url(${TEAM_ASSETS}marketing-mask.svg) 0 0/100% 100% no-repeat;` +
        `mask:url(${TEAM_ASSETS}marketing-mask.svg) 0 0/100% 100% no-repeat;`,
      photo: [0, 0, 165.009, 201.667],
      under: art("marketing-frame.svg", -6.72, -0.05, 187.42, 225.83),
    },
  };

  const teamRole = (team, index) => {
    if (team.key === "directors") return "Co-Director";
    return index === 0 ? `${team.label} Lead` : team.label;
  };

  const TEAM_PEOPLE = TEAMS.flatMap((team) =>
    team.members.map((member, index) => ({
      ...member,
      team: team.key,
      style: team.style,
      role: teamRole(team, index),
      lead: index === 0,
    })),
  );

  const shuffle = (list) => {
    const copy = [...list];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  };

  // Reorder so no frame style repeats back to back (best effort,
  // including across the loop seam).
  const spreadStyles = (list) => {
    const pool = [...list];
    const out = [];
    while (pool.length) {
      const previous = out[out.length - 1];
      const isLast = pool.length === 1;
      let pick = pool.findIndex(
        (person) =>
          person.style !== previous?.style &&
          (!isLast || person.style !== out[0]?.style),
      );
      if (pick === -1) pick = 0;
      out.push(pool.splice(pick, 1)[0]);
    }
    return out;
  };

  const frameMarkup = (person) => {
    const style = TEAM_STYLES[person.style];
    const [w, h] = style.size;
    const [wx, wy, ww, wh] = style.window;
    const [x, y, pw, ph] = person.box ?? style.photo;
    let photo;
    if (person.crop) {
      const [cw, ch, cl, ct] = person.crop;
      photo =
        `<span style="${px(x, y, pw, ph)}position:absolute;overflow:hidden;">` +
        `<img src="${TEAM_ASSETS}photos/${person.photo}" alt="" ` +
        `style="position:absolute;left:${cl}%;top:${ct}%;width:${cw}%;height:${ch}%;max-width:none;" /></span>`;
    } else {
      photo =
        `<img class="tf-cover" src="${TEAM_ASSETS}photos/${person.photo}" alt="" ` +
        `style="${px(x, y, pw, ph)}" />`;
    }
    return (
      `<div class="team-frame-box" style="--w:${w};--h:${h};">` +
      `<div class="tf tf--${person.style}">` +
      (style.under ?? "") +
      `<div class="tf-window" style="${px(wx, wy, ww, wh)}${style.windowStyle ?? ""}">${photo}</div>` +
      (style.over ?? "") +
      `</div></div>`
    );
  };

  const slotMarkup = (person) => {
    const name =
      `<span class="team-name-line"><span class="team-name">${person.name}</span>` +
      `<a class="team-linkedin" href="${person.linkedin ?? "https://www.linkedin.com/"}" ` +
      `target="_blank" rel="noopener noreferrer" aria-label="${person.name} on LinkedIn">` +
      `<img src="${TEAM_ASSETS}linkedin.svg" alt="" /></a></span>`;
    return (
      `<figure class="team-slot team-slot--${person.style}" style="--w:${TEAM_STYLES[person.style].size[0]};">` +
      frameMarkup(person) +
      `<figcaption>${name}<span class="team-role">${person.role}</span></figcaption>` +
      `</figure>`
    );
  };

  // Large/medium: deal a random order into two rows, each rendered three
  // times over so the track can loop.
  const TEAM_COPIES = 3;
  const TEAM_STEP = 3;
  const order = shuffle(TEAM_PEOPLE);
  const teamRowsData = [
    spreadStyles(order.filter((_, index) => index % 2 === 0)),
    spreadStyles(order.filter((_, index) => index % 2 === 1)),
  ];
  const teamTracks = ["#team-row-top", "#team-row-bottom"].map(
    (selector, rowIndex) => {
      const row = document.querySelector(selector);
      const inner = row.querySelector(".team-row__inner");
      const people = teamRowsData[rowIndex];
      inner.innerHTML = Array.from({ length: TEAM_COPIES }, () =>
        people.map((person) => slotMarkup(person)).join(""),
      ).join("");
      return { row, inner, people, index: people.length };
    },
  );

  // Track offset (in artboard px) of slot `index`, from the layout's
  // current scale and gap so it stays right across breakpoints.
  const trackOffset = (track, index) => {
    const styles = getComputedStyle(track.inner);
    const scale = parseFloat(styles.getPropertyValue("--team-scale")) || 1;
    const gap = parseFloat(styles.columnGap) || 0;
    let offset = 0;
    for (let slot = 0; slot < index; slot += 1) {
      const person = track.people[slot % track.people.length];
      offset += TEAM_STYLES[person.style].size[0] * scale + gap;
    }
    return -offset;
  };
  const placeTracks = () =>
    teamTracks.forEach((track) =>
      gsap.set(track.inner, { x: trackOffset(track, track.index) }),
    );
  placeTracks();
  window.addEventListener("resize", placeTracks, { passive: true });

  let teamStepping = false;
  const stepTeam = (direction) => {
    if (teamStepping) return;
    teamStepping = true;
    teamTracks.forEach((track, trackIndex) => {
      track.index += direction * TEAM_STEP;
      gsap.to(track.inner, {
        x: trackOffset(track, track.index),
        duration: 0.65,
        ease: "power2.inOut",
        onComplete: () => {
          // Re-centre into the middle copy; identical slots, no jump.
          const count = track.people.length;
          if (track.index >= count * 2) track.index -= count;
          if (track.index < count) track.index += count;
          gsap.set(track.inner, { x: trackOffset(track, track.index) });
          if (trackIndex === teamTracks.length - 1) teamStepping = false;
        },
      });
    });
  };
  document
    .querySelector(".team-arrow--prev")
    .addEventListener("click", () => stepTeam(-1));
  const teamNext = document.querySelector(".team-arrow--next");
  teamNext.addEventListener("click", () => {
    // The first click retires the "go forward" nudge for good.
    teamNext.classList.remove("team-arrow--nudge");
    stepTeam(1);
  });

  // Small: accordion, one swipeable row per team, lead first and the rest
  // shuffled. Directors starts open.
  document.querySelector("#team-mobile-teams").innerHTML = TEAMS.map((team) => {
    const people = TEAM_PEOPLE.filter((person) => person.team === team.key);
    const ordered = [people[0], ...shuffle(people.slice(1))];
    const open = team.key === "directors";
    return (
      `<section class="team-acc${open ? " is-open" : ""}">` +
      `<button class="team-acc__head" type="button" aria-expanded="${open}" aria-controls="team-acc-${team.key}">` +
      `<span>${team.label}</span><img src="${TEAM_ASSETS}chevron.svg" alt="" /></button>` +
      `<div class="team-acc__panel" id="team-acc-${team.key}"><div class="team-acc__clip">` +
      `<div class="team-acc__row">${ordered.map((person) => slotMarkup(person)).join("")}</div>` +
      `</div></div></section>`
    );
  }).join("");
  // Only one team open at a time: opening one closes the others.
  const teamHeads = document.querySelectorAll(".team-acc__head");
  teamHeads.forEach((head) => {
    head.addEventListener("click", () => {
      const open = !head.parentElement.classList.contains("is-open");
      teamHeads.forEach((other) => {
        const isTarget = other === head && open;
        other.parentElement.classList.toggle("is-open", isTarget);
        other.setAttribute("aria-expanded", String(isTarget));
      });
    });
  });

  // Dwell-state backdrop colors per section, for the jump overlay and
  // the stacked phone page.
  const SECTION_COLORS = {
    hero: ["#0b0d21", "#0b0d21"],
    about: ["#15173b", "#060825"],
    values: ["#37a9c9", "#024354"],
    speakers: ["#ca6330", "#833711"],
    testimonials: ["#1d032c", "#1d032c"],
    projects: ["#73678d", "#352f5a"],
    sponsors: ["#34416b", "#080a27"],
    team: ["#37a9c9", "#024354"],
    faqs: ["#090912", "#090912"],
  };

  // Crossing the narrow breakpoint switches between the two page modes,
  // which are built differently, so rebuild the page from scratch.
  // (Not when the dev toggle has forced the stacked page on.)
  window.matchMedia("(max-width: 599.98px)").addEventListener("change", () => {
    if (document.documentElement.classList.contains("scroll-anim-off")) return;
    const phone =
      window.matchMedia("(hover: none) and (pointer: coarse)").matches &&
      Math.min(screen.width, screen.height) < 600;
    const wantsStatic = phone || window.innerWidth < 600;
    if (wantsStatic !== staticScroll) window.location.reload();
  });

  // Small artboards whose own fill differs from the section's gradient.
  const STATIC_BACKGROUNDS = {
    speakers: "linear-gradient(180deg, #f08854 0%, #d08000 78.8%)",
  };

  const setUpStaticPage = () => {
    // The stage sections leave the pinned hero viewport and stack in the
    // page flow, each on its own resting-state gradient.
    const faqs = document.querySelector("#faqs");
    const sections = gsap.utils.toArray(".stage-section");
    sections.forEach((section) => {
      const key = section.id.replace("section-", "");
      const [top, bottom] = SECTION_COLORS[key];
      section.style.background =
        STATIC_BACKGROUNDS[key] ?? `linear-gradient(180deg, ${top}, ${bottom})`;
      faqs.before(section);
    });
    fitSceneToViewport();

    // The navbar pins to the top of the screen for the whole page.
    document.body.prepend(nav.closest("hbp-navbar") ?? nav);

    const targets = {
      ...Object.fromEntries(
        sections.map((section) => [section.id.replace("section-", ""), section]),
      ),
      faqs,
    };
    const links = gsap.utils.toArray(".site-nav__links > a[data-section]");
    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        targets[link.dataset.section]?.scrollIntoView({ behavior: "smooth" });
      });
    });
    document.querySelector(".site-nav__logo").addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // While the hero is under the bar, the small layout hides the logo and
    // the bar's tint (the MLH badge takes that corner; see styles.css).
    const markOverHero = () => {
      nav.classList.toggle(
        "site-nav--over-hero",
        hero.getBoundingClientRect().bottom > 80,
      );
    };
    markOverHero();
    window.addEventListener("scroll", markOverHero, { passive: true });

    // Underline the tab for whichever section fills the middle of the screen.
    const setCurrent = (key) => {
      nav.classList.toggle("site-nav--sectioned", Boolean(key));
      links.forEach((link) => {
        link.classList.toggle("is-current", link.dataset.section === key);
      });
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // The hero maps to no tab.
            const key = Object.keys(targets).find(
              (name) => targets[name] === entry.target,
            );
            setCurrent(key ?? null);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    [hero, ...Object.values(targets)].forEach((target) =>
      observer.observe(target),
    );
  };

  // Set once the scroll-driven scene below is built.
  let sceneBuilt = false;

  // Carousels (Speakers, Testimonials): the arrows step through the items.
  // The layout stays put; only the item's content crossfades in place.
  // Prev/next disable at the ends, and the left/right arrow keys work
  // while the section is current and its content has entered. Set up
  // before the stacked-page / reduced-motion return so the arrows work
  // there too (the arrow keys only drive the scroll-driven scene).
  function createCarousel({ items, render, content, prev, next, isActive }) {
    let index = 0;
    let swap = null;

    function update() {
      render(items[index]);
      // A longer bio can lengthen a stacked-page artboard.
      if (staticScroll) fitSceneToViewport();
      prev.disabled = index === 0;
      next.disabled = index === items.length - 1;
    }

    function show(target) {
      if (swap || target < 0 || target >= items.length) return;
      index = target;
      if (reducedMotion) {
        update();
        return;
      }
      swap = gsap
        .timeline({ onComplete: () => (swap = null) })
        .to(content, { opacity: 0, duration: 0.25, ease: "power1.in" })
        .add(update)
        .to(content, {
          opacity: 1,
          duration: 0.4,
          ease: "power1.out",
          stagger: 0.04,
        });
    }

    prev.addEventListener("click", () => show(index - 1));
    next.addEventListener("click", () => show(index + 1));
    window.addEventListener("keydown", (event) => {
      if (!sceneBuilt || navJumping || !isActive()) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      show(event.key === "ArrowLeft" ? index - 1 : index + 1);
    });

    return {
      // Back to the first item whenever the section replays from scratch.
      reset() {
        swap?.kill();
        swap = null;
        index = 0;
        gsap.set(content, { opacity: 1 });
        update();
      },
    };
  }

  const SPEAKER_BIO_PLACEHOLDER =
    "Sue Harnett is the Founder & CEO of Rewriting the Code, the " +
    "nonprofit she launched in 2017 that has grown into a global " +
    "community of 38,000+ university and early-career women in tech, " +
    "offering mentorship, education, and career-readiness programs. She " +
    "will be speaking about women in technology, and the value of " +
    "community, teamwork, and thoughtful leadership!";
  const speakersCarousel = createCarousel({
    items: [
      {
        name: "Sue Harnett",
        role: "Founder of Rewriting the Code",
        bio: SPEAKER_BIO_PLACEHOLDER,
        photo: "./assets/speaker-photo-placeholder.jpg",
      },
      {
        name: "Jessica Cao",
        role: "Founder of Rewriting the Code",
        bio: SPEAKER_BIO_PLACEHOLDER,
        photo: "./assets/speaker-photo-placeholder.jpg",
      },
    ],
    render(speaker) {
      speakerName.textContent = speaker.name;
      speakerRole.textContent = speaker.role;
      speakerBio.textContent = speaker.bio;
      speakerPhoto.setAttribute("href", speaker.photo);
    },
    content: [speakerPhoto, speakerName, speakerRole, speakerBio],
    prev: speakerPrev,
    next: speakerNext,
    isActive: () =>
      speakersTextShown && navSpeakersLink.classList.contains("is-current"),
  });

  // The second entry repeats the first until more testimonials are in.
  const TESTIMONIAL_JIMIN = {
    quote:
      "\u201cI joined the astronaut bootcamp event in 2021, and I wanted to " +
      "highlight my great experience there. I was able to connect with " +
      "friendly people, learn about web development through workshops, " +
      "and have free pizza for lunch!\u201d",
    name: "Jimin Kim",
    school: "Northeastern 22\u2019",
    photo: "./assets/testi-photo-jimin.jpg",
  };
  const testimonialsCarousel = createCarousel({
    items: [TESTIMONIAL_JIMIN, { ...TESTIMONIAL_JIMIN }],
    render(testimonial) {
      testiQuoteText.textContent = testimonial.quote;
      testiQuoteName.textContent = testimonial.name;
      testiQuoteSchool.textContent = testimonial.school;
      testiPhoto.setAttribute("href", testimonial.photo);
      testiPhotoLabel.textContent = `Portrait of ${testimonial.name}`;
    },
    content: [testiPhoto, testiQuoteText, testiQuoteName, testiQuoteSchool],
    prev: testiPrev,
    next: testiNext,
    isActive: () =>
      testimonialsEntered &&
      navTestimonialsLink.classList.contains("is-current"),
  });

  // The second entry repeats the first until more projects are in. A
  // project without an image shows the frame's blank canvas.
  const PROJECT_FUTURA = {
    name: "Futura",
    url: "#",
    authors: "Cole Abrams, Maia Gonzalez, Carolyn Hoa, Lucy Liu",
    description: SPEAKER_BIO_PLACEHOLDER,
    image: null,
  };
  const projectsCarousel = createCarousel({
    items: [PROJECT_FUTURA, { ...PROJECT_FUTURA }],
    render(project) {
      projectNameText.textContent = project.name;
      projectLink.href = project.url;
      projectLink.setAttribute("aria-label", `${project.name} (opens in a new tab)`);
      projectAuthors.textContent = project.authors;
      projectDescription.textContent = project.description;
      if (project.image) projectImage.setAttribute("href", project.image);
      else projectImage.removeAttribute("href");
    },
    content: [projectImage, ...projectDetails.children],
    prev: projectsPrev,
    next: projectsNext,
    isActive: () =>
      projectsEntered && navProjectsLink.classList.contains("is-current"),
  });

  if (reducedMotion || staticScroll) {
    gsap.set(sky, { backgroundColor: "#0b0d21" });
    gsap.set(viewport, {
      "--backdrop-sky": "#0b0d21",
      "--backdrop-grass": "#2d5827",
    });
    gsap.set(skyShade, { opacity: 1 });
    gsap.set(grassLayers, { filter: "brightness(0.44)" });
    gsap.set([skylineNight, museumNight], { opacity: 1 });
    gsap.set(starsFar, { opacity: 1 });
    gsap.set(starsNear, { opacity: 0.78 });
    gsap.set([skylineDay, skylineTwilight, museumDay, sun], { opacity: 0 });
    gsap.set(bushLayers, { filter: "brightness(0.55)" });
    gsap.set(stoneLayers, { filter: "brightness(0.78)" });
    gsap.set(museumShadow, { opacity: 0 });
    gsap.set(moon, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0 });
    gsap.set(lightFixtures, { opacity: 0 });
    gsap.set([leftSpotlight, rightSpotlight, title, sponsors], {
      opacity: 1,
      y: 0,
      scale: 1,
    });
    gsap.set(moonBanner, { y: 0 });
    gsap.set(nav, { autoAlpha: 1, y: 0 });
    gsap.set(sceneBg, { x: 0, y: 0, scale: 1, transformOrigin: "0 0" });
    gsap.set(sceneFg, {
      x: 148.911,
      y: 160.338,
      scale: 0.77784,
      transformOrigin: "0 0",
    });
    if (staticScroll) setUpStaticPage();
    return;
  }
  sceneBuilt = true;

  // The stars drift continuously, independent of scrolling. The slight
  // up-scale keeps the rotating field covering the frame corners.
  gsap.set([starsFar, starsNear], { scale: 1.15, transformOrigin: "50% 50%" });
  gsap.to(starsFar, { rotation: 360, duration: 420, repeat: -1, ease: "none" });
  gsap.to(starsNear, { rotation: -360, duration: 300, repeat: -1, ease: "none" });

  // --- FAQs sock ambient animations ---

  // Both skeletons float like the About page candlesticks.
  gsap.to(".sock-float--fg", {
    y: -8,
    duration: 3.4,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
  });
  gsap.to(".sock-float--bg", {
    y: -6,
    duration: 4.3,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
    delay: 0.9,
  });

  // The star in the skeleton's eye twinkles, its glow breathing with it.
  gsap.set(["#sock-eye-star", "#sock-glow", ".sock-twinkle"], {
    transformOrigin: "50% 50%",
  });
  gsap.to("#sock-eye-star", {
    scale: 0.72,
    opacity: 0.55,
    duration: 1.4,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
  });
  gsap.to("#sock-glow", {
    scale: 1.18,
    opacity: 0.5,
    duration: 1.4,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
    delay: 0.2,
  });

  // The stars scattered through the right-side mist twinkle on their own
  // offbeat rhythms.
  gsap.utils.toArray(".sock-twinkle").forEach((star, index) => {
    gsap.to(star, {
      opacity: gsap.utils.random(0.2, 0.5),
      scale: gsap.utils.random(0.55, 0.8),
      duration: gsap.utils.random(0.9, 2.1),
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: index * 0.37,
    });
  });

  // The mist wafts gently, echoing the About page haze.
  gsap.to("#sock-mist", {
    x: -26,
    y: 8,
    duration: 11,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
  });

  // --- About section ambient animations (per the design's Prompt frame) ---

  // Mist wafts around as if a breeze is behind it.
  gsap.to(".mist--a", {
    x: 30,
    y: -14,
    rotation: 1.8,
    skewX: 2.2,
    duration: 9,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
  });
  gsap.to(".mist--a", {
    opacity: 0.62,
    duration: 5.4,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
  });
  gsap.to(".mist--b", {
    x: -38,
    y: 12,
    rotation: -2.2,
    skewX: -2.6,
    duration: 12.5,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
  });
  gsap.to(".mist--b", {
    opacity: 0.7,
    duration: 7.3,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
    delay: 1.2,
  });

  // Fossils atop the pillars float very subtly.
  gsap.utils.toArray(".fossil").forEach((fossil, index) => {
    gsap.to(fossil, {
      y: index % 2 ? -6 : -8,
      duration: 2.6 + index * 0.45,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: index * 0.5,
    });
  });

  // Candles float ever so subtly.
  gsap.utils.toArray(".candle__float").forEach((floatEl, index) => {
    gsap.to(floatEl, {
      y: index % 2 ? -7 : -5,
      duration: index % 2 ? 3.4 : 2.8,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: index * 0.9,
    });
  });

  // Flames flicker with random jitters; the glow rings track the flicker.
  const candleFlames = gsap.utils.toArray(".candle__flame");
  const candleRings = gsap.utils.toArray(".candle__rings");
  candleFlames.forEach((flame, index) => {
    const rings = candleRings[index];
    const state = { v: 1 };
    const applyFlicker = () => {
      const v = state.v;
      gsap.set(flame, {
        scaleY: 0.72 + 0.32 * v,
        scaleX: 1.16 - 0.2 * v,
        skewX: (v - 1) * 20,
      });
      gsap.set(rings, {
        opacity: 0.62 + 0.38 * gsap.utils.clamp(0, 1, (v - 0.7) / 0.45),
        scale: 0.965 + 0.05 * v,
        transformOrigin: "50% 50%",
      });
    };
    const jitter = () => {
      gsap.to(state, {
        v: gsap.utils.random(0.7, 1.15),
        duration: gsap.utils.random(0.07, 0.18),
        ease: "sine.inOut",
        onUpdate: applyFlicker,
        onComplete: jitter,
      });
    };
    gsap.delayedCall(index * 0.35, jitter);
  });

  // A few shooting stars streak across the back of the sky on random loops.
  gsap.utils.toArray(".shooting-star").forEach((star, index) => {
    const launch = () => {
      const fromX = gsap.utils.random(120, 1250);
      const fromY = gsap.utils.random(40, 330);
      const angle = gsap.utils.random(18, 34);
      const distance = gsap.utils.random(240, 460);
      const radians = (angle * Math.PI) / 180;
      gsap
        .timeline({ delay: gsap.utils.random(1.5, 7.5), onComplete: launch })
        .set(star, {
          x: fromX,
          y: fromY,
          rotation: angle,
          scaleX: 0.4,
          opacity: 0,
        })
        .to(star, { opacity: 1, duration: 0.15, ease: "none" }, 0)
        .to(
          star,
          {
            x: fromX + Math.cos(radians) * distance,
            y: fromY + Math.sin(radians) * distance,
            scaleX: 1,
            duration: gsap.utils.random(0.55, 0.85),
            ease: "power1.in",
          },
          0,
        )
        .to(star, { opacity: 0, duration: 0.25, ease: "power1.out" }, ">-0.25");
    };
    gsap.delayedCall(index * 1.7, launch);
  });

  // The resting intro framing ("1x") comes from the Figma reference frame;
  // the load animation pushes in from 0.75x of it, scaled about the frame
  // center. The background plane never moves — a fixed skyline reads as
  // infinitely far away, which sells the perspective.
  // y is shifted +45 from the Figma reference so the hero text clears the
  // navbar; the 0.75x start point is derived from it about the frame center.
  const introFrame = { x: 148.911, y: 160.338, scale: 0.77784 };
  const introFrameStart = { x: 300.683, y: 243.004, scale: 0.58338 };

  gsap.set(sceneFg, { ...introFrameStart, transformOrigin: "0 0" });

  // The day-to-night sequence plays on load (in real seconds) while the
  // museum holds its smallest size, ending with the title popping in.
  const intro = gsap.timeline({ defaults: { ease: "none" }, paused: true });

  // Slow camera push from 0.75x to 1x while day turns to night.
  intro.to(
    sceneFg,
    { ...introFrame, duration: 5, ease: "power1.inOut" },
    0.2,
  );

  intro
    .to(
      sunMotion,
      {
        progress: 1,
        duration: 3.4,
        ease: "power1.inOut",
        onUpdate: updateSunOrbit,
      },
      0.5,
    )
    .to(
      sun,
      {
        filter:
          "sepia(0.45) saturate(1.6) hue-rotate(-12deg) drop-shadow(0 0 18px rgba(255, 178, 83, 0.45))",
        duration: 1.6,
      },
      1.7,
    );

  // Later skylines simply fade in over the earlier ones (which stay fully
  // opaque underneath), so buildings never turn translucent mid-fade.
  intro
    .to(sky, { backgroundColor: "#7a9fbd", duration: 1.6 }, 0.9)
    .to(viewport, { "--backdrop-sky": "#7a9fbd", duration: 1.6 }, 0.9)
    .to(starsFar, { opacity: 0.7, duration: 1.6 }, 0.9)
    .to(starsNear, { opacity: 0.34, duration: 1.6 }, 0.9)
    .to(bushLayers, { filter: "brightness(0.8)", duration: 1.6 }, 0.9)
    .to(grassLayers, { filter: "brightness(0.72)", duration: 1.6 }, 0.9)
    .to(stoneLayers, { filter: "brightness(0.92)", duration: 1.6 }, 0.9);

  intro
    .to(sky, { backgroundColor: "#5760c3", duration: 1.5 }, 2.7)
    .to(
      viewport,
      {
        "--backdrop-sky": "#5760c3",
        "--backdrop-grass": "#2d5827",
        duration: 1.5,
      },
      2.7,
    )
    // Night deepens to the lit-state sky as the lights come up.
    .to(sky, { backgroundColor: "#0b0d21", duration: 1.4 }, 4.4)
    .to(viewport, { "--backdrop-sky": "#0b0d21", duration: 1.4 }, 4.4)
    .to(skylineNight, { opacity: 1, duration: 1.4 }, 4.4)
    .to(skyShade, { opacity: 1, duration: 1.4 }, 4.4)
    .to(skyShade, { opacity: 0.1, duration: 1.5 }, 2.7)
    .to(starsFar, { opacity: 1, duration: 1.5 }, 2.7)
    .to(starsNear, { opacity: 0.78, duration: 1.5 }, 2.7)
    .to(shootingLayer, { opacity: 1, duration: 1.5 }, 2.7)
    // Figma keeps the teal day skyline through twilight; it turns purple
    // with the lights-off night, then near-black as night deepens.
    .to(skylineTwilight, { opacity: 1, duration: 1.4 }, 2.7)
    .to(museumNight, { opacity: 1, duration: 1 }, 3.1)
    .to(bushLayers, { filter: "brightness(0.55)", duration: 1.5 }, 2.7)
    .to(grassLayers, { filter: "brightness(0.44)", duration: 1.5 }, 2.7)
    .to(stoneLayers, { filter: "brightness(0.78)", duration: 1.5 }, 2.7)
    .to(
      moonMotion,
      {
        progress: 1,
        duration: 1.9,
        onUpdate: updateMoonOrbit,
      },
      3.5,
    );

  // Once night has fully settled, the ground lights pop up from behind the
  // bushes, then flicker on per the Figma annotation.
  intro
    .set(lightFixtures, { opacity: 1 }, 5.55)
    .to(
      lightFixtures,
      { y: 0, duration: 0.5, ease: "back.out(1.5)", stagger: 0.12 },
      5.55,
    );

  intro
    .to(lightFixtures, { opacity: 0, duration: 0.08 }, 6.25)
    .to(leftSpotlight, { opacity: 0.78, duration: 0.06 }, 6.25)
    .to(leftSpotlight, { opacity: 0.12, duration: 0.05 }, 6.31)
    .to(leftSpotlight, { opacity: 1, duration: 0.08 }, 6.36)
    .to(leftSpotlight, { opacity: 0.42, duration: 0.05 }, 6.44)
    .to(leftSpotlight, { opacity: 1, duration: 0.12 }, 6.49)
    .to(rightSpotlight, { opacity: 0.65, duration: 0.05 }, 6.31)
    .to(rightSpotlight, { opacity: 0.08, duration: 0.04 }, 6.36)
    .to(rightSpotlight, { opacity: 0.85, duration: 0.07 }, 6.4)
    .to(rightSpotlight, { opacity: 0.24, duration: 0.04 }, 6.47)
    .to(rightSpotlight, { opacity: 1, duration: 0.13 }, 6.51);

  // Title and navbar arrive while the museum is still at its smallest size.
  intro
    .to(
      title,
      { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.7)" },
      5.1,
    )
    .to(sponsors, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 5.3)
    .to(nav, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 5.15);

  // The MLH banner unrolls from behind the moon once it has fully settled
  // (the moon's rise finishes at 5.4). One soft overshoot, no bouncing.
  intro.to(
    moonBanner,
    { y: 0, duration: 0.85, ease: "back.out(1.3)" },
    5.45,
  );

  // Scroll-snap safety: past the doorway, a stop between section dwell
  // points settles at one, so a section is never left half entered or
  // half exited — scrolling even a little into a section carries it to
  // its middle state. The hero zoom stays a free scrub, and a dead zone
  // around each dwell keeps tiny nudges from committing a full jump.
  const SNAP_DWELLS = [11.4, 14.8, 19.7, 24.6, 29.6, 34.6, 39.8, 44];
  const SNAP_FREE_END = 10.05;
  const SNAP_DEADZONE = 0.5;
  // True while a navbar jump choreographs the scroll; pauses snapping
  // and the section entrance latches.
  let navJumping = false;
  const snapToDwell = (value, self) => {
    if (navJumping) return value;
    // Fully past the hero: the user is in the FAQs/footer page flow, and
    // snapping would yank them back up to the pinned viewport.
    if (value >= 0.999) return value;
    const T = value * TIMELINE_SPAN;
    if (T < SNAP_FREE_END) return value;
    let previous = -1;
    let next = -1;
    for (const dwell of SNAP_DWELLS) {
      if (dwell <= T) previous = dwell;
      else {
        next = dwell;
        break;
      }
    }
    let target;
    if (self.direction >= 0) {
      target =
        previous >= 0 && T <= previous + SNAP_DEADZONE ? previous : next;
    } else {
      target = next >= 0 && T >= next - SNAP_DEADZONE ? next : previous;
    }
    // Scrolling back up out of the first section hands the doorway zoom
    // over to the user un-snapped.
    if (target < 0) return value;
    return target / TIMELINE_SPAN;
  };

  // Scroll only drives the camera: museum grows to full framing, then
  // pushes through the door. The skyline never moves.
  const scrollTimeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      invalidateOnRefresh: true,
      snap: {
        snapTo: snapToDwell,
        inertia: false,
        duration: { min: 0.4, max: 1.4 },
        delay: 0.1,
        ease: "power2.inOut",
      },
      onUpdate(self) {
        // If the user starts scrolling mid-sunset, hurry the intro along.
        if (self.progress > 0.04 && intro.isActive() && intro.timeScale() === 1) {
          intro.timeScale(3);
        }
      },
    },
  });

  // Phase A restores the original hero zoom exactly: the continuous push
  // from the resting frame to the Figma door-crop framing (frame 4 of the
  // hero designs). Phase B then continues through the doorway.
  const DOOR_CROP = { x: -867.415, y: -642.753, scale: 2.1194 };

  // Phase B: exponential continuation (constant zoom rate) from the door
  // crop until the doorway interior is full bleed. Doorway measured from
  // the museum asset: x 714..797.5, y 528..666.
  const PLUNGE_LOG_START = Math.log(DOOR_CROP.scale);
  const PLUNGE_LOG_END = Math.log(30);
  const PLUNGE_FOCUS_START = {
    x: (756 - DOOR_CROP.x) / DOOR_CROP.scale,
    y: (491 - DOOR_CROP.y) / DOOR_CROP.scale,
  };
  const FOCUS_DOOR = { x: 755.75, y: 600 };

  // The camera is computed directly from the scrubbed timeline's progress
  // by a single writer. Tween-based variants proved fragile here: GSAP's
  // scale quickSetter silently no-ops, and phantom first renders corrupted
  // the intro's starting frame.
  //
  // The whole journey runs in log-scale space (constant perceived zoom
  // rate), paced by a C1-continuous monotone Hermite spline so there is no
  // velocity kink where the classic door-crop framing hands off to the
  // plunge. The path passes through DOOR_CROP exactly.
  const TIMELINE_SPAN = 44;
  const CAM_T_START = 0.01;
  const CAM_T_END = 10.4;
  const LOG_START = Math.log(introFrame.scale);
  const LOG_END = PLUNGE_LOG_END;
  const U_CROP = (PLUNGE_LOG_START - LOG_START) / (LOG_END - LOG_START);
  const T_CROP = (8.15 - CAM_T_START) / (CAM_T_END - CAM_T_START);
  const PACE_MID_SLOPE = 0.75;
  const PACE_END_SLOPE = 4.5;
  const FOCUS_FRAME = {
    x: (756 - introFrame.x) / introFrame.scale,
    y: (491 - introFrame.y) / introFrame.scale,
  };
  let cameraEngaged = false;
  // The camera T of the previous unsuppressed frame; nav jumps leave it
  // stale on purpose so a post-jump frame sees the crossing it made.
  let lastCameraT = 0;

  // Piecewise Hermite: (0, 0, slope 0) -> (T_CROP, U_CROP, slope M) -> (1, 1).
  const pace = (t) => {
    if (t <= T_CROP) {
      const h = t / T_CROP;
      const h2 = h * h;
      const h3 = h2 * h;
      return (h3 - h2) * T_CROP * PACE_MID_SLOPE + (-2 * h3 + 3 * h2) * U_CROP;
    }
    const span = 1 - T_CROP;
    const h = (t - T_CROP) / span;
    const h2 = h * h;
    const h3 = h2 * h;
    return (
      (2 * h3 - 3 * h2 + 1) * U_CROP +
      (h3 - 2 * h2 + h) * span * PACE_MID_SLOPE +
      (-2 * h3 + 3 * h2) +
      (h3 - h2) * span * PACE_END_SLOPE
    );
  };

  const applyScrollCamera = (progress) => {
    const T = progress * TIMELINE_SPAN;
    const t = clamp01((T - CAM_T_START) / (CAM_T_END - CAM_T_START));
    const u = pace(t);
    const scale = Math.exp(LOG_START + (LOG_END - LOG_START) * u);

    let focusX;
    let focusY;
    if (u <= U_CROP) {
      const g = smoothstep(u / U_CROP);
      focusX = FOCUS_FRAME.x + (PLUNGE_FOCUS_START.x - FOCUS_FRAME.x) * g;
      focusY = FOCUS_FRAME.y + (PLUNGE_FOCUS_START.y - FOCUS_FRAME.y) * g;
    } else {
      const g = smoothstep((u - U_CROP) / (1 - U_CROP));
      focusX =
        PLUNGE_FOCUS_START.x + (FOCUS_DOOR.x - PLUNGE_FOCUS_START.x) * g;
      focusY =
        PLUNGE_FOCUS_START.y + (FOCUS_DOOR.y - PLUNGE_FOCUS_START.y) * g;
    }

    gsap.set(sceneFg, {
      x: 756 - scale * focusX,
      y: 491 - scale * focusY,
      scale,
    });
    // Render panels only in the scroll ranges where they can be seen.
    gsap.set(stageBackdrop, { display: T >= 8 ? "block" : "none" });
    gsap.set(sectionAbout, {
      display: T >= 8 && T <= 13.9 ? "block" : "none",
    });
    gsap.set(sectionValues, {
      display: T >= 13.2 && T <= 17.3 ? "block" : "none",
    });
    gsap.set(sectionSpeakers, {
      display: T >= 16.4 && T <= 22.4 ? "block" : "none",
    });
    gsap.set(sectionTestimonials, {
      display: T >= 21.7 && T <= 27.5 ? "block" : "none",
    });
    gsap.set(sectionProjects, {
      display: T >= 26.9 && T <= 32.7 ? "block" : "none",
    });
    gsap.set(sectionSponsors, {
      display: T >= 32.1 && T <= 37.9 ? "block" : "none",
    });
    gsap.set(sectionTeam, {
      display: T >= 37.3 && T <= 43.1 ? "block" : "none",
    });
    // Past the doorway the navbar marks the active section tab.
    nav.classList.toggle("site-nav--sectioned", T >= 10);
    navAboutLink.classList.toggle("is-current", T < 13.6);
    navValuesLink.classList.toggle("is-current", T >= 13.6 && T < 16.9);
    navSpeakersLink.classList.toggle("is-current", T >= 16.9 && T < 22.2);
    navTestimonialsLink.classList.toggle("is-current", T >= 22.2 && T < 27.4);
    navProjectsLink.classList.toggle("is-current", T >= 27.4 && T < 32.6);
    navSponsorsLink.classList.toggle("is-current", T >= 32.6 && T < 37.8);
    navTeamLink.classList.toggle("is-current", T >= 37.8 && T < 43.5);
    navFaqsLink.classList.toggle("is-current", T >= 43.5);
    // During navbar jumps the entrance latches pause, so sections being
    // skipped over never animate mid-flight; they re-sync on arrival.
    if (navJumping) return;
    // One-shot entrances for section contents.
    if (T >= 10.05 && !aboutEntered) {
      aboutEntered = true;
      aboutEnter.play();
    } else if (T < 9.3 && aboutEntered) {
      aboutEntered = false;
      aboutEnter.pause(0);
    }
    if (T >= 13.75 && !valuesEntered) {
      valuesEntered = true;
      valuesEnter.play();
    } else if (T < 12.9 && valuesEntered) {
      valuesEntered = false;
      valuesEnter.pause(0);
    }
    // Speaker text appears only once the frames reach their final state.
    if (T >= 19.35 && !speakersTextShown) {
      speakersTextShown = true;
      speakersTextIn.play();
    } else if (T < 18.7 && speakersTextShown) {
      speakersTextShown = false;
      speakersTextIn.pause(0);
      speakersCarousel.reset();
    }
    if (T >= 22.45 && !testimonialsEntered) {
      testimonialsEntered = true;
      testimonialsEnter.play();
    } else if (T < 21.6 && testimonialsEntered) {
      testimonialsEntered = false;
      testimonialsEnter.pause(0);
      testimonialsCarousel.reset();
    }
    // Project details appear only once the arches settle.
    if (T >= 29.35 && !projectsEntered) {
      projectsEntered = true;
      projectsEnter.play();
    } else if (T < 28.7 && projectsEntered) {
      projectsEntered = false;
      projectsEnter.pause(0);
      projectsCarousel.reset();
    }
    if (T >= 32.85 && !sponsorsEntered) {
      sponsorsEntered = true;
      sponsorsEnter.play();
    } else if (T < 32.0 && sponsorsEntered) {
      sponsorsEntered = false;
      sponsorsEnter.pause(0);
    }
    if (T >= 38.05 && !teamEntered) {
      teamEntered = true;
      teamEnter.play();
    } else if (T < 37.2 && teamEntered) {
      teamEntered = false;
      teamEnter.pause(0);
    }
    // Crossing back below a section's exit range re-asserts its latched
    // entrance state. The one-shot enter timelines and the scrubbed exit
    // tweens write the same properties, and across nav-jump seeks the
    // last writer can be the wrong one, leaving entered content stuck at
    // a stale state; an explicit end-state render on the crossing makes
    // the dwell state deterministic.
    const reassertEnter = (timeline) =>
      timeline.pause(0, false).progress(1, false);
    if (lastCameraT >= 12.2 && T < 12.2 && aboutEntered) {
      reassertEnter(aboutEnter);
    }
    if (lastCameraT >= 15.7 && T < 15.7 && valuesEntered) {
      reassertEnter(valuesEnter);
    }
    if (lastCameraT >= 26 && T < 26 && testimonialsEntered) {
      reassertEnter(testimonialsEnter);
    }
    if (lastCameraT >= 31.2 && T < 31.2 && projectsEntered) {
      reassertEnter(projectsEnter);
    }
    if (lastCameraT >= 36.4 && T < 36.4 && sponsorsEntered) {
      reassertEnter(sponsorsEnter);
    }
    if (lastCameraT >= 41.6 && T < 41.6 && teamEntered) {
      reassertEnter(teamEnter);
    }
    lastCameraT = T;
  };

  // Section content entrance: plays once when the camera crosses into the
  // section, rewinds if the user scrolls back out through the door.
  const aboutTitle = document.querySelector(".about-copy h2");
  const aboutText = document.querySelector(".about-copy p");
  const aboutPlaque = document.querySelector(".about-plaque");
  const teamPicture = document.querySelector(".team-picture");
  const mistLayer = document.querySelector("#mist-layer");
  let aboutEntered = false;

  gsap.set([aboutPlaque, aboutTitle, aboutText], { autoAlpha: 0, y: 30 });
  gsap.set(teamPicture, {
    autoAlpha: 0,
    y: 26,
    scale: 0.95,
    transformOrigin: "50% 50%",
  });
  gsap.set(mistLayer, { autoAlpha: 0 });
  gsap.set(candles, { y: 340 });

  const aboutEnter = gsap.timeline({ paused: true });
  aboutEnter
    .to(mistLayer, { autoAlpha: 1, duration: 0.9, ease: "power1.out" }, 0)
    .to(
      aboutPlaque,
      { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" },
      0.08,
    )
    .to(
      aboutTitle,
      { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" },
      0.15,
    )
    .to(
      aboutText,
      { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" },
      0.28,
    )
    .to(
      teamPicture,
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: "back.out(1.3)" },
      0.3,
    )
    .to(
      candles,
      { y: 0, duration: 0.9, ease: "power2.out", stagger: 0.18 },
      0.45,
    );

  // Our Values entrance: pillars rise staggered left-to-right (pushing
  // their text and fossils up with them) while the vases rumble.
  let valuesEntered = false;

  gsap.set(valuesTitle, { autoAlpha: 0, y: 26 });
  gsap.set(pillarGroups, { y: 220 });

  const valuesEnter = gsap.timeline({ paused: true });
  valuesEnter
    .to(
      valuesTitle,
      { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" },
      0,
    )
    .to(
      pillarGroups,
      { y: 0, duration: 0.85, ease: "power3.out", stagger: 0.22 },
      0.15,
    )
    .fromTo(
      vases,
      { x: -3, rotation: -1.2 },
      {
        x: 3,
        rotation: 1.2,
        duration: 0.06,
        repeat: 7,
        yoyo: true,
        ease: "none",
        stagger: 0.015,
      },
      0.3,
    )
    .set(vases, { x: 0, rotation: 0 }, 0.9);

  // Testimonials entrance: the hall of arches fades up, the mists drift in
  // from both sides and the sparkles come out, then the title, medallion,
  // quote, and arrows arrive together.
  let testimonialsEntered = false;
  const testiCopyParts = [testiTitle, testiMedallion, testiQuote, testiControls];

  gsap.set(testiHall, { autoAlpha: 0, scale: 1.04, transformOrigin: "50% 60%" });
  gsap.set(testiMistLeft, { autoAlpha: 0, x: -260 });
  gsap.set(testiMistRight, { autoAlpha: 0, x: 260 });
  gsap.set(testiStars, { autoAlpha: 0 });
  gsap.set(testiCopyParts, { autoAlpha: 0, y: 18 });

  const testimonialsEnter = gsap.timeline({ paused: true });
  testimonialsEnter
    .to(
      testiHall,
      { autoAlpha: 1, scale: 1, duration: 0.9, ease: "power2.out" },
      0,
    )
    .to(
      [testiMistLeft, testiMistRight],
      { autoAlpha: 1, x: 0, duration: 1.1, ease: "power3.out" },
      0.1,
    )
    .to(testiStars, { autoAlpha: 1, duration: 0.8, ease: "power1.out" }, 0.4)
    .to(
      testiCopyParts,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
        ease: "power2.out",
        stagger: 0.12,
      },
      0.45,
    );

  // Projects entrance: once the arches and dinosaur have risen into place
  // (scrubbed on scroll, below), the title, frame, details, and arrows
  // arrive together.
  let projectsEntered = false;
  const projectsCopyParts = [
    projectsTitle,
    projectFrame,
    projectDetails,
    projectsControls,
  ];

  // They fade in where they sit; no slide.
  gsap.set(projectsCopyParts, { autoAlpha: 0 });

  const projectsEnter = gsap.timeline({ paused: true });
  projectsEnter.to(projectsCopyParts, {
    autoAlpha: 1,
    duration: 0.6,
    ease: "power1.out",
    stagger: 0.1,
  });

  // Sponsors entrance: the title fades in, the frames pop up one by one in
  // reading order (gold row, then silver), then the call to action.
  let sponsorsEntered = false;

  gsap.set(sponsorsTitle, { autoAlpha: 0 });
  gsap.set(sponsorFrames, { autoAlpha: 0, scale: 0.9, transformOrigin: "50% 50%" });
  gsap.set(sponsorsCta, { autoAlpha: 0 });

  const sponsorsEnter = gsap.timeline({ paused: true });
  sponsorsEnter
    .to(sponsorsTitle, { autoAlpha: 1, duration: 0.6, ease: "power1.out" }, 0)
    .to(
      sponsorFrames,
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.6)",
        stagger: 0.09,
      },
      0.15,
    )
    .to(sponsorsCta, { autoAlpha: 1, duration: 0.6, ease: "power1.out" }, 0.75);

  // Meet the team entrance: title rises in, the rows fade up, the arrow
  // buttons appear, and the floor and benches slide up from the bottom.
  let teamEntered = false;

  gsap.set(teamTitle, { autoAlpha: 0, y: 26 });
  gsap.set(teamRows, { autoAlpha: 0, y: 24 });
  gsap.set(teamNav, { autoAlpha: 0 });
  gsap.set(teamFloor, { y: 90 });

  const teamEnter = gsap.timeline({ paused: true });
  teamEnter
    .to(
      teamTitle,
      { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" },
      0,
    )
    .to(
      teamRows,
      { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.15 },
      0.15,
    )
    .to(teamNav, { autoAlpha: 1, duration: 0.5, ease: "power1.out" }, 0.4)
    .to(teamFloor, { y: 0, duration: 0.7, ease: "power3.out" }, 0.1);

  // Speakers: the title, details, and arrows pop in once the arch settles.
  let speakersTextShown = false;
  const speakerCopyParts = [speakersTitle, speakerInfo, speakerControls];
  gsap.set(speakerCopyParts, { autoAlpha: 0, y: 18 });
  const speakersTextIn = gsap.timeline({ paused: true });
  speakersTextIn.to(speakerCopyParts, {
    autoAlpha: 1,
    y: 0,
    duration: 0.55,
    ease: "power2.out",
    stagger: 0.18,
  });

  scrollTimeline.eventCallback("onUpdate", () => {
    const progress = scrollTimeline.progress();
    if (progress > 0.0005) {
      cameraEngaged = true;
    }
    if (cameraEngaged) {
      applyScrollCamera(progress);
    }
  });

  scrollTimeline
    .to(hudIntro, { opacity: 0, duration: 1.1, ease: "power1.in" }, 0.15)
    .to(nav, { autoAlpha: 0, y: -14, duration: 1.1, ease: "power1.in" }, 0.15)
    // The doorway is full bleed by ~9.97; only then does the About section
    // emerge out of the darkness.
    .to(stageBackdrop, { autoAlpha: 1, duration: 1, ease: "power1.inOut" }, 10.05)
    .to(
      sectionAbout,
      { autoAlpha: 1, duration: 1, ease: "power1.inOut" },
      10.05,
    )
    // The navbar returns with the section and stays for all later ones.
    .to(nav, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" }, 10.35)
    // ---- About Us exit (per prompt): picture and text rise and fade,
    // candles drop out with a slight fade, mists scale and drift left.
    .fromTo(
      teamPicture,
      { y: 0, autoAlpha: 1, scale: 1 },
      {
        y: -140,
        autoAlpha: 0,
        duration: 1.1,
        ease: "power1.in",
        immediateRender: false,
      },
      12.2,
    )
    .fromTo(
      aboutPlaque,
      { y: 0, autoAlpha: 1 },
      {
        y: -120,
        autoAlpha: 0,
        duration: 1.05,
        ease: "power1.in",
        immediateRender: false,
      },
      12.25,
    )
    .fromTo(
      aboutTitle,
      { y: 0, autoAlpha: 1 },
      {
        y: -120,
        autoAlpha: 0,
        duration: 1.05,
        ease: "power1.in",
        immediateRender: false,
      },
      12.25,
    )
    .fromTo(
      aboutText,
      { y: 0, autoAlpha: 1 },
      {
        y: -120,
        autoAlpha: 0,
        duration: 1.05,
        ease: "power1.in",
        immediateRender: false,
      },
      12.35,
    )
    .fromTo(
      candles,
      { y: 0, autoAlpha: 1 },
      {
        y: 420,
        autoAlpha: 0.45,
        duration: 1.15,
        ease: "power1.in",
        stagger: 0.1,
        immediateRender: false,
      },
      12.25,
    )
    .fromTo(
      mistLayer,
      { x: 0, scale: 1, autoAlpha: 1 },
      {
        x: -420,
        scale: 1.08,
        autoAlpha: 0,
        transformOrigin: "40% 50%",
        duration: 1.2,
        ease: "power1.in",
        immediateRender: false,
      },
      12.2,
    )
    .to(sectionAbout, { autoAlpha: 0, duration: 0.5 }, 13.3)
    // ---- Gradient morph: About navy to Our Values teal.
    .to(
      stageBackdrop,
      {
        "--sec-top": "#37a9c9",
        "--sec-bottom": "#024354",
        duration: 1.2,
        ease: "power1.inOut",
      },
      12.7,
    )
    .to(
      sectionValues,
      { autoAlpha: 1, duration: 0.8, ease: "power1.inOut" },
      13.55,
    )
    // ---- Our Values exit: pillars scale down and fade, text/fossils and
    // title rise away, vases drop out like the About candles.
    .fromTo(
      pillarImgs,
      { scale: 1, autoAlpha: 1 },
      {
        scale: 0.8,
        autoAlpha: 0,
        duration: 1.1,
        ease: "power1.in",
        stagger: 0.05,
        immediateRender: false,
      },
      15.7,
    )
    .fromTo(
      pillarTops,
      { y: 0, autoAlpha: 1 },
      {
        y: -130,
        autoAlpha: 0,
        duration: 1.05,
        ease: "power1.in",
        stagger: 0.05,
        immediateRender: false,
      },
      15.75,
    )
    .fromTo(
      valuesTitle,
      { y: 0, autoAlpha: 1 },
      {
        y: -110,
        autoAlpha: 0,
        duration: 1,
        ease: "power1.in",
        immediateRender: false,
      },
      15.8,
    )
    .fromTo(
      vases,
      { y: 0 },
      {
        y: 340,
        duration: 1.1,
        ease: "power1.in",
        stagger: 0.06,
        immediateRender: false,
      },
      15.8,
    )
    .to(sectionValues, { autoAlpha: 0, duration: 0.5 }, 16.8)
    // ---- Gradient morph: teal to the Speakers rust.
    .to(
      stageBackdrop,
      {
        "--sec-top": "#ca6330",
        "--sec-bottom": "#833711",
        duration: 1.2,
        ease: "power1.inOut",
      },
      16.1,
    )
    .to(
      sectionSpeakers,
      { autoAlpha: 1, duration: 0.8, ease: "power1.inOut" },
      16.9,
    )
    // ---- Speakers enter: the curtains sweep in first; once they're in
    // place, the arch rises from the bottom (on medium it fades in where it
    // stands) while the balustrade fades up gently in front of it, both
    // settling just before the text appears (19.35).
    .fromTo(
      speakerCurtain,
      { x: 620 },
      {
        x: 0,
        duration: 1.1,
        ease: "power2.out",
        immediateRender: false,
      },
      16.9,
    )
    // Rendered immediately so the arch and railing stay hidden while the
    // curtains come in, instead of showing before their fade starts.
    // Large: the arch rises from below. Medium: it fades in where it stands.
    .fromTo(
      speakerStage,
      {
        y: () => (mediumQuery.matches ? 0 : 820),
        autoAlpha: () => (mediumQuery.matches ? 0 : 1),
      },
      {
        y: 0,
        autoAlpha: 1,
        duration: 1.25,
        ease: "power2.out",
        immediateRender: true,
      },
      18.0,
    )
    .fromTo(
      speakerRailings,
      { y: 60, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 1.3,
        ease: "power1.out",
        immediateRender: true,
      },
      18.0,
    )
    // ---- Speakers exit: the text rises away while the arch sinks back the
    // way it came in, both fading; the balustrade reverses its entrance
    // (sinks and fades), then the curtains pull back right.
    .fromTo(
      speakerCopy,
      { y: 0, autoAlpha: 1 },
      {
        y: -140,
        autoAlpha: 0,
        duration: 1.1,
        ease: "power1.in",
        immediateRender: false,
      },
      20.98,
    )
    .fromTo(
      speakerStage,
      { y: 0, autoAlpha: 1 },
      {
        y: 140,
        autoAlpha: 0,
        duration: 1.1,
        ease: "power1.in",
        immediateRender: false,
      },
      20.9,
    )
    .fromTo(
      speakerRailings,
      { y: 0, autoAlpha: 1 },
      {
        y: 60,
        autoAlpha: 0,
        duration: 0.55,
        ease: "power1.in",
        immediateRender: false,
      },
      20.9,
    )
    .fromTo(
      speakerCurtain,
      { x: 0 },
      { x: 620, duration: 0.5, ease: "power1.in", immediateRender: false },
      21.4,
    )
    .to(sectionSpeakers, { autoAlpha: 0, duration: 0.5 }, 21.9)
    // ---- Gradient morph: rust to the Testimonials deep purple.
    .to(
      stageBackdrop,
      {
        "--sec-top": "#1d032c",
        "--sec-bottom": "#1d032c",
        duration: 1.2,
        ease: "power1.inOut",
      },
      21.5,
    )
    .to(
      sectionTestimonials,
      { autoAlpha: 1, duration: 0.8, ease: "power1.inOut" },
      22.2,
    )
    // ---- Testimonials exit: the title, medallion, quote, and arrows fade
    // out in place while the hall and its mists push in and fade.
    .fromTo(
      testiCopy,
      { autoAlpha: 1 },
      {
        autoAlpha: 0,
        duration: 1.05,
        ease: "power1.in",
        immediateRender: false,
      },
      26,
    )
    .fromTo(
      testiScene,
      { scale: 1, autoAlpha: 1 },
      {
        scale: 1.08,
        autoAlpha: 0,
        duration: 1.2,
        ease: "power1.in",
        immediateRender: false,
      },
      26,
    )
    .to(sectionTestimonials, { autoAlpha: 0, duration: 0.5 }, 27)
    // ---- Gradient morph: deep purple to the Projects wall violet, so any
    // wall the sliding arches haven't covered yet reads as wall. (The
    // hall's dark backdrop lives behind the dinosaur, inside the doorway.)
    .to(
      stageBackdrop,
      {
        "--sec-top": "#73678d",
        "--sec-bottom": "#352f5a",
        duration: 1.2,
        ease: "power1.inOut",
      },
      26.6,
    )
    .to(
      sectionProjects,
      { autoAlpha: 1, duration: 0.8, ease: "power1.inOut" },
      27.4,
    )
    // ---- Projects enter (parallax), like walking past a doorway: the
    // arches slide in from the left carrying the doorway mask with them,
    // while the dinosaur inside drifts back against that motion so it
    // travels only half as far. Both settle together.
    .fromTo(
      [projectsArches, projectsArchSlabs, projectsDoorway],
      { x: -820 },
      { x: 0, duration: 2.15, ease: "power1.out", immediateRender: false },
      27.1,
    )
    .fromTo(
      projectsDino,
      { x: 410 },
      { x: 0, duration: 2.15, ease: "power1.out", immediateRender: false },
      27.1,
    )
    // ---- Projects exit: the doorway leaves the way it came, reversed. The
    // arches and doorway slide back out to the left with the dinosaur
    // lagging at half their speed, and the project (frame, details,
    // arrows) follows them out. The title and the hall around it fade in
    // place as the backdrop crossfades to Sponsors.
    .fromTo(
      [projectsArches, projectsArchSlabs, projectsDoorway],
      { x: 0 },
      { x: -820, duration: 1.2, ease: "power1.in", immediateRender: false },
      31.2,
    )
    .fromTo(
      projectsDino,
      { x: 0 },
      { x: 410, duration: 1.2, ease: "power1.in", immediateRender: false },
      31.2,
    )
    .fromTo(
      [projectFrame, projectDetails, projectsControls],
      { x: 0 },
      {
        x: -320,
        duration: 1.05,
        ease: "power1.in",
        stagger: 0.05,
        immediateRender: false,
      },
      31.2,
    )
    // The copy wrapper carries the fade, so it never fights the entrance,
    // which fades the parts inside it.
    .fromTo(
      projectsCopy,
      { autoAlpha: 1 },
      {
        autoAlpha: 0,
        duration: 1,
        ease: "power1.in",
        immediateRender: false,
      },
      31.2,
    )
    // The walls (with the slabs that slide with the arches) fade as one
    // group. The frieze and lighting wash blend against those walls, so
    // they fade out quickly first, before the walls turn see-through, and
    // from their own resting opacities (18% and 20%), never from 100%.
    .fromTo(
      projectsHallOverlays,
      { autoAlpha: (i) => projectsOverlayOpacity[i] },
      {
        autoAlpha: 0,
        duration: 0.45,
        ease: "power1.out",
        immediateRender: false,
      },
      31.2,
    )
    .fromTo(
      projectsWallsGroup,
      { autoAlpha: 1 },
      {
        autoAlpha: 0,
        duration: 1.2,
        ease: "power1.in",
        immediateRender: false,
      },
      31.2,
    )
    .to(sectionProjects, { autoAlpha: 0, duration: 0.5 }, 32.2)
    // ---- Gradient morph: to the Sponsors gallery's deep blue.
    .to(
      stageBackdrop,
      {
        "--sec-top": "#34416b",
        "--sec-bottom": "#080a27",
        duration: 1.2,
        ease: "power1.inOut",
      },
      31.8,
    )
    .to(
      sectionSponsors,
      { autoAlpha: 1, duration: 0.8, ease: "power1.inOut" },
      32.6,
    )
    // ---- Sponsors exit: the title, frames, and call to action rise and
    // fade while the gallery fades behind them.
    .fromTo(
      sponsorsCopy,
      { y: 0, autoAlpha: 1 },
      {
        y: -120,
        autoAlpha: 0,
        duration: 1.05,
        ease: "power1.in",
        immediateRender: false,
      },
      36.4,
    )
    .fromTo(
      sponsorsBg,
      { autoAlpha: 1 },
      {
        autoAlpha: 0,
        duration: 1.2,
        ease: "power1.in",
        immediateRender: false,
      },
      36.4,
    )
    .to(sectionSponsors, { autoAlpha: 0, duration: 0.5 }, 37.4)
    // ---- Gradient morph: orange to the Meet the Team teal.
    .to(
      stageBackdrop,
      {
        "--sec-top": "#37a9c9",
        "--sec-bottom": "#024354",
        duration: 1.2,
        ease: "power1.inOut",
      },
      37.0,
    )
    .to(
      sectionTeam,
      { autoAlpha: 1, duration: 0.8, ease: "power1.inOut" },
      37.8,
    )
    // ---- Meet the Team exit: rows and title rise and fade, the arrows
    // fade out, and the floor drops away below.
    .fromTo(
      teamRows,
      { y: 0, autoAlpha: 1 },
      {
        y: -140,
        autoAlpha: 0,
        duration: 1.1,
        ease: "power1.in",
        stagger: 0.08,
        immediateRender: false,
      },
      41.6,
    )
    .fromTo(
      teamTitle,
      { y: 0, autoAlpha: 1 },
      {
        y: -110,
        autoAlpha: 0,
        duration: 1,
        ease: "power1.in",
        immediateRender: false,
      },
      41.65,
    )
    .fromTo(
      teamNav,
      { autoAlpha: 1 },
      {
        autoAlpha: 0,
        duration: 0.6,
        ease: "power1.in",
        immediateRender: false,
      },
      41.6,
    )
    .fromTo(
      teamFloor,
      { y: 0, autoAlpha: 1 },
      {
        y: 160,
        autoAlpha: 0.5,
        duration: 1.05,
        ease: "power1.in",
        immediateRender: false,
      },
      41.65,
    )
    .to(sectionTeam, { autoAlpha: 0, duration: 0.5 }, 42.6)
    // ---- Gradient morph: teal to the FAQs section's top color, so the
    // pinned viewport hands off seamlessly into the page flow below.
    .to(
      stageBackdrop,
      {
        "--sec-top": "#090912",
        "--sec-bottom": "#090912",
        duration: 1.2,
        ease: "power1.inOut",
      },
      42.2,
    )
    // Dwell segment: the handoff color holds while the scroll runs out.
    .set({}, {}, 44);

  // ---- Navbar navigation: rather than scrolling through every section
  // between origin and destination, the origin plays its exit, the page
  // teleports across the skipped sections in a single hidden frame, and
  // the destination plays its entrance. The page still physically lands
  // on the destination's real scroll position, so the section order
  // stays consistent — scrolling up from Testimonials always reaches
  // Speakers, no matter how you got there.
  // enterStart: where the section's reveal begins (backward jumps unwind
  //   to here). exitEnd: where its exit content has cleared, capped so a
  //   forward jump's exit phase never drifts into the NEXT section's
  //   reveal range. landing: forward-jump teleport point — the earliest T
  //   where the PREVIOUS section's panel is fully faded out, so nothing
  //   of it (not even static props) can show while the destination
  //   enters.
  const SECTION_FLOW = {
    about: { dwell: 11.4, enterStart: 10.05, exitEnd: 13.5, landing: 10.05 },
    values: { dwell: 14.8, enterStart: 13.55, exitEnd: 16.85, landing: 13.85 },
    speakers: { dwell: 19.7, enterStart: 16.9, exitEnd: 22.1, landing: 17.35 },
    testimonials: {
      dwell: 24.6,
      enterStart: 22.2,
      exitEnd: 27.2,
      landing: 22.45,
    },
    projects: { dwell: 29.6, enterStart: 27.4, exitEnd: 32.4, landing: 27.55 },
    sponsors: { dwell: 34.6, enterStart: 32.6, exitEnd: 37.6, landing: 32.75 },
    team: { dwell: 39.8, enterStart: 37.8, exitEnd: 42.8, landing: 37.95 },
  };
  const navBackdrop = document.querySelector("#stage-backdrop-nav");
  let navScrollTween = null;
  let navJumpTimeline = null;

  const endNavJump = () => {
    navJumping = false;
    // The trigger is disabled for the duration of a jump; hand scroll
    // control back (idempotent if it never was disabled).
    scrollTimeline.scrollTrigger.enable(false, false);
    gsap.to(navBackdrop, {
      autoAlpha: 0,
      duration: 0.35,
      onComplete: () => gsap.set(navBackdrop, { display: "none" }),
    });
  };

  const killNavScroll = () => {
    if (navScrollTween) {
      navScrollTween.kill();
      navScrollTween = null;
    }
    if (navJumpTimeline) {
      navJumpTimeline.kill();
      navJumpTimeline = null;
      endNavJump();
    }
  };

  const scrollYForT = (T) => {
    const trigger = scrollTimeline.scrollTrigger;
    return (
      trigger.start + clamp01(T / TIMELINE_SPAN) * (trigger.end - trigger.start)
    );
  };

  const scrollToTimelineT = (T) => {
    killNavScroll();
    const target = scrollYForT(T);
    const proxy = { y: window.scrollY };
    navScrollTween = gsap.to(proxy, {
      y: target,
      duration: gsap.utils.clamp(0.9, 2.8, Math.abs(target - proxy.y) / 2000),
      ease: "power2.inOut",
      onUpdate: () => window.scrollTo(0, Math.round(proxy.y)),
      onComplete: killNavScroll,
    });
  };

  // The section whose enter/exit range holds the playhead; falls back to
  // the nearest dwell (or the hero before the doorway). Past the hero's
  // scroll range entirely, the user is in the FAQs/footer page flow.
  const currentSectionKey = () => {
    if (window.scrollY >= scrollTimeline.scrollTrigger.end - 1) return "faqs";
    const T = scrollTimeline.progress() * TIMELINE_SPAN;
    if (T < SNAP_FREE_END) return "hero";
    let best = null;
    let bestDistance = Infinity;
    for (const [key, flow] of Object.entries(SECTION_FLOW)) {
      const inZone = T >= flow.enterStart - 0.01 && T <= flow.exitEnd + 0.01;
      const distance = Math.abs(T - flow.dwell) + (inZone ? 0 : 100);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = key;
      }
    }
    return best;
  };

  const navigateToSection = (destinationKey) => {
    killNavScroll();
    const originKey = currentSectionKey();
    if (originKey === destinationKey) {
      if (destinationKey !== "faqs") {
        scrollToTimelineT(SECTION_FLOW[destinationKey].dwell);
      }
      return;
    }
    const trigger = scrollTimeline.scrollTrigger;
    // "hero" and "faqs" aren't stage sections; they get bespoke phases.
    const origin = SECTION_FLOW[originKey] ?? null;
    const destination = SECTION_FLOW[destinationKey] ?? null;
    const forward =
      destinationKey === "faqs" ||
      (originKey !== "faqs" &&
        (!origin || destination.dwell > origin.dwell));

    // Phase 1 target: the origin finishes its exit (forward) or unwinds
    // its entrance (backward). From the hero, dive through the door;
    // from the FAQs flow, slide back up to the pinned viewport.
    const exitY = origin
      ? scrollYForT(forward ? origin.exitEnd : origin.enterStart)
      : originKey === "faqs"
        ? trigger.end
        : scrollYForT(SNAP_FREE_END);
    // Teleport landing: just before the destination's reveal (forward)
    // or just past its exit (backward), so phase 3 plays it in. The FAQs
    // "landing" is the hero's very end, with the flow content below.
    const landingT = destination
      ? forward
        ? destination.landing
        : destination.exitEnd
      : TIMELINE_SPAN;
    const landingY = destination ? scrollYForT(landingT) : trigger.end;
    const dwellY = destination
      ? scrollYForT(destination.dwell)
      : trigger.end + window.innerHeight;

    navJumping = true;
    const [originTop, originBottom] = SECTION_COLORS[originKey];
    const [destinationTop, destinationBottom] = SECTION_COLORS[destinationKey];
    // A still-running fade from a previous jump would fight the new
    // overlay state; clear it first.
    gsap.killTweensOf(navBackdrop);
    gsap.set(navBackdrop, {
      display: "block",
      autoAlpha: 1,
      "--sec-top": originTop,
      "--sec-bottom": originBottom,
    });

    // While a jump runs, the trigger is disabled and the scroll position
    // and timeline playhead are driven together in lockstep. That keeps
    // ScrollTrigger's internal catch-up tween — whose retargeting proved
    // racy around teleports — entirely out of the picture, and the
    // visuals track the jump with zero lag.
    const exitT = origin
      ? forward
        ? origin.exitEnd
        : origin.enterStart
      : originKey === "faqs"
        ? TIMELINE_SPAN
        : SNAP_FREE_END;
    const dwellT = destination ? destination.dwell : TIMELINE_SPAN;
    const proxy = {
      y: window.scrollY,
      p: scrollTimeline.progress() * TIMELINE_SPAN,
    };
    const writeFrame = () => {
      window.scrollTo(0, Math.round(proxy.y));
      scrollTimeline.progress(clamp01(proxy.p / TIMELINE_SPAN));
    };
    const exitDuration = origin || originKey === "faqs" ? 0.9 : 1.2;
    const teleportAt = exitDuration + 0.1;

    scrollTimeline.scrollTrigger.getTween()?.pause();
    scrollTimeline.scrollTrigger.disable(false, false);

    navJumpTimeline = gsap.timeline({
      onComplete: () => {
        navJumpTimeline = null;
        endNavJump();
      },
    });
    navJumpTimeline
      .to(
        navBackdrop,
        {
          "--sec-top": destinationTop,
          "--sec-bottom": destinationBottom,
          duration: teleportAt + 0.9,
          ease: "power1.inOut",
        },
        0,
      )
      .to(
        proxy,
        {
          y: exitY,
          p: exitT,
          duration: exitDuration,
          ease: "power1.inOut",
          onUpdate: writeFrame,
        },
        0,
      )
      .call(
        () => {
          try {
            proxy.y = landingY;
            proxy.p = landingT;
            writeFrame();
          } finally {
            // Whatever happens, the latches must come back.
            navJumping = false;
          }
        },
        null,
        teleportAt,
      )
      .to(
        proxy,
        {
          y: dwellY,
          p: dwellT,
          duration: 1.15,
          ease: "power1.out",
          onUpdate: writeFrame,
        },
        teleportAt + 0.05,
      );
  };

  nav.querySelectorAll(".site-nav__links > a[data-section]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigateToSection(link.dataset.section);
    });
  });
  document.querySelector(".site-nav__logo").addEventListener("click", (event) => {
    event.preventDefault();
    scrollToTimelineT(0);
  });
  // A real scroll gesture immediately hands control back to the user.
  ["wheel", "touchstart"].forEach((type) =>
    window.addEventListener(type, killNavScroll, { passive: true }),
  );

  const startIntro = () => {
    ScrollTrigger.refresh();
    intro.play();
  };
  if (document.readyState === "complete") {
    startIntro();
  } else {
    window.addEventListener("load", startIntro, { once: true });
  }
})();
