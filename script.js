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

  const SECTION_WIDTH = 1512;
  const SECTION_HEIGHT = 982;
  const sectionFits = document.querySelectorAll(".section-fit");

  function fitSceneToViewport() {
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const coverScale = Math.max(
      viewportWidth / DESIGN_WIDTH,
      viewportHeight / DESIGN_HEIGHT,
    );

    fit.style.transform =
      `translate(-50%, -50%) scale(${coverScale.toFixed(5)})`;

    // Contain-fit: the panel gradient fills the viewport, so letterboxing
    // is invisible and section content never gets cropped.
    const sectionScale = Math.min(
      viewportWidth / SECTION_WIDTH,
      viewportHeight / SECTION_HEIGHT,
    );
    sectionFits.forEach((element) => {
      element.style.transform =
        `translate(-50%, -50%) scale(${sectionScale.toFixed(5)})`;
    });
  }

  fitSceneToViewport();
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
  const sectionBlank = document.querySelector("#section-blank");
  const candles = gsap.utils.toArray(".candle");
  const valuesTitle = document.querySelector("#values-title");
  const pillarGroups = gsap.utils.toArray(".pillar-group");
  const pillarTops = gsap.utils.toArray(".pillar-top");
  const pillarImgs = gsap.utils.toArray(".pillar-img");
  const vases = gsap.utils.toArray(".vase");
  const sectionSpeakers = document.querySelector("#section-speakers");
  const speakersStrip = document.querySelector("#speakers-strip");
  const speakersTitle = document.querySelector("#speakers-title");
  const speakerRows = gsap.utils.toArray(".speaker-row");
  const speakerInfos = gsap.utils.toArray(".speaker-info");
  const sectionTestimonials = document.querySelector("#section-testimonials");
  const testiMist = document.querySelector("#testi-mist");
  const testiTitle = document.querySelector("#testi-title");
  const testiCenter = document.querySelector("#testi-center");
  const testiPillars = gsap.utils.toArray(".testi-pillar");
  const stageButtons = document.querySelector("#stage-buttons");
  const stageButtonEls = gsap.utils.toArray(".stage-button");
  const navAboutLink = document.querySelector('[data-section="about"]');
  const navValuesLink = document.querySelector('[data-section="values"]');
  const navSpeakersLink = document.querySelector('[data-section="speakers"]');
  const navTestimonialsLink = document.querySelector(
    '[data-section="testimonials"]',
  );
  const sectionProjects = document.querySelector("#section-projects");
  const projectsTitle = document.querySelector("#projects-title");
  const projectFrames = gsap.utils.toArray(".project-frame");
  const navProjectsLink = document.querySelector('[data-section="projects"]');
  const sectionSponsors = document.querySelector("#section-sponsors");
  const sponsorsTitle = document.querySelector("#sponsors-title");
  const sponsorTiles = gsap.utils.toArray(".sponsor-tile");
  const sponsorStage = document.querySelector("#sponsor-stage");
  const sponsorStone = document.querySelector("#sponsor-stone");
  const navSponsorsLink = document.querySelector('[data-section="sponsors"]');
  const sectionTeam = document.querySelector("#section-team");
  const teamTitle = document.querySelector("#team-title");
  const teamRows = gsap.utils.toArray(".team-row");
  const teamFloor = document.querySelector("#team-floor");
  const navTeamLink = document.querySelector('[data-section="team"]');
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
    const sunCenterX = 184.5 + position.x;
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

  if (reducedMotion) {
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
    return;
  }

  // The stars drift continuously, independent of scrolling. The slight
  // up-scale keeps the rotating field covering the frame corners.
  gsap.set([starsFar, starsNear], { scale: 1.15, transformOrigin: "50% 50%" });
  gsap.to(starsFar, { rotation: 360, duration: 420, repeat: -1, ease: "none" });
  gsap.to(starsNear, { rotation: -360, duration: 300, repeat: -1, ease: "none" });

  // --- Meet the team marquee rows ---
  // Each row cycles a randomized order of the five completed frame assets
  // (never the same frame twice in a row, including across the loop seam).
  // The top row drifts right, the bottom row left, looping seamlessly.
  const TEAM_MEMBERS = [
    { id: "maia", name: "Maia Gonzales", role: "Designer", width: 373 },
    { id: "zahra", name: "Zahra Wibisana", role: "Design Lead", width: 262 },
    { id: "carolyn", name: "Carolyn Hoa", role: "Designer", width: 218 },
    { id: "lucy", name: "Lucy Liu", role: "Designer", width: 206 },
    { id: "cole", name: "Cole Abrams", role: "Designer", width: 256 },
  ];

  const makeTeamSequence = (length) => {
    const sequence = [];
    for (let index = 0; index < length; index += 1) {
      const previous = sequence[index - 1];
      // The final slot also can't match the first, since the cycle repeats.
      const last = index === length - 1 ? sequence[0] : null;
      const options = TEAM_MEMBERS.filter(
        (member) => member !== previous && member !== last,
      );
      sequence.push(gsap.utils.random(options));
    }
    return sequence;
  };

  const buildTeamRow = (row, gap, movesRight) => {
    const inner = row.querySelector(".team-row__inner");
    const sequence = makeTeamSequence(8);
    const cycleWidth =
      sequence.reduce((sum, member) => sum + member.width, 0) +
      sequence.length * gap;

    const COPIES = 3;
    for (let copy = 0; copy < COPIES; copy += 1) {
      sequence.forEach((member) => {
        const slot = document.createElement("figure");
        slot.className = `team-slot team-slot--${member.id}`;
        slot.innerHTML =
          `<img src="./assets/team-frame-${member.id}.png" alt="${member.name}" />` +
          `<figcaption><span class="team-name">${member.name}</span>` +
          `<span class="team-role">${member.role}</span></figcaption>`;
        inner.appendChild(slot);
      });
    }

    gsap.fromTo(
      inner,
      { x: movesRight ? -cycleWidth : 0 },
      {
        x: movesRight ? 0 : -cycleWidth,
        duration: cycleWidth / 44,
        ease: "none",
        repeat: -1,
      },
    );
  };

  buildTeamRow(document.querySelector("#team-row-top"), 56, true);
  buildTeamRow(document.querySelector("#team-row-bottom"), 66, false);

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
    .to(sky, { backgroundColor: "#5760c3", duration: 1.6 }, 0.9)
    .to(viewport, { "--backdrop-sky": "#5760c3", duration: 1.6 }, 0.9)
    .to(skyShade, { opacity: 0.1, duration: 1.6 }, 0.9)
    .to(starsFar, { opacity: 0.7, duration: 1.6 }, 0.9)
    .to(starsNear, { opacity: 0.34, duration: 1.6 }, 0.9)
    .to(skylineTwilight, { opacity: 1, duration: 1.4 }, 1)
    .to(bushLayers, { filter: "brightness(0.8)", duration: 1.6 }, 0.9)
    .to(grassLayers, { filter: "brightness(0.72)", duration: 1.6 }, 0.9)
    .to(stoneLayers, { filter: "brightness(0.92)", duration: 1.6 }, 0.9);

  intro
    .to(sky, { backgroundColor: "#0b0d21", duration: 1.5 }, 2.7)
    .to(
      viewport,
      {
        "--backdrop-sky": "#0b0d21",
        "--backdrop-grass": "#2d5827",
        duration: 1.5,
      },
      2.7,
    )
    .to(skyShade, { opacity: 1, duration: 1.5 }, 2.7)
    .to(starsFar, { opacity: 1, duration: 1.5 }, 2.7)
    .to(starsNear, { opacity: 0.78, duration: 1.5 }, 2.7)
    .to(shootingLayer, { opacity: 1, duration: 1.5 }, 2.7)
    .to(skylineNight, { opacity: 1, duration: 1.2 }, 2.85)
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
    gsap.set(stageButtons, { display: T >= 21.9 ? "block" : "none" });
    gsap.set(sectionProjects, {
      display: T >= 26.9 && T <= 32.7 ? "block" : "none",
    });
    gsap.set(sectionSponsors, {
      display: T >= 32.1 && T <= 37.9 ? "block" : "none",
    });
    gsap.set(sectionTeam, {
      display: T >= 37.3 && T <= 43.1 ? "block" : "none",
    });
    gsap.set(sectionBlank, { display: T >= 42.6 ? "block" : "none" });
    // Past the doorway the navbar marks the active section tab.
    nav.classList.toggle("site-nav--sectioned", T >= 10);
    navAboutLink.classList.toggle("is-current", T < 13.6);
    navValuesLink.classList.toggle("is-current", T >= 13.6 && T < 16.9);
    navSpeakersLink.classList.toggle("is-current", T >= 16.9 && T < 22.2);
    navTestimonialsLink.classList.toggle("is-current", T >= 22.2 && T < 27.4);
    navProjectsLink.classList.toggle("is-current", T >= 27.4 && T < 32.6);
    navSponsorsLink.classList.toggle("is-current", T >= 32.6 && T < 37.8);
    navTeamLink.classList.toggle("is-current", T >= 37.8);
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
    }
    if (T >= 22.45 && !testimonialsEntered) {
      testimonialsEntered = true;
      testimonialsEnter.play();
    } else if (T < 21.6 && testimonialsEntered) {
      testimonialsEntered = false;
      testimonialsEnter.pause(0);
    }
    if (T >= 27.65 && !projectsEntered) {
      projectsEntered = true;
      projectsEnter.play();
      // "Reset" the carried-over buttons: a quick re-pop back to default.
      gsap.fromTo(
        stageButtonEls,
        { scale: 0.8, autoAlpha: 0.4 },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.5,
          ease: "back.out(2)",
          stagger: 0.1,
        },
      );
    } else if (T < 26.8 && projectsEntered) {
      projectsEntered = false;
      projectsEnter.pause(0);
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
  };

  // Section content entrance: plays once when the camera crosses into the
  // section, rewinds if the user scrolls back out through the door.
  const aboutTitle = document.querySelector(".about-copy h2");
  const aboutText = document.querySelector(".about-copy p");
  const teamPicture = document.querySelector(".team-picture");
  const mistLayer = document.querySelector("#mist-layer");
  let aboutEntered = false;

  gsap.set([aboutTitle, aboutText], { autoAlpha: 0, y: 30 });
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
        repeat: 16,
        yoyo: true,
        ease: "none",
        stagger: 0.015,
      },
      0.3,
    )
    .set(vases, { x: 0, rotation: 0 }, 1.5);

  // Testimonials entrance, in the prompted order: center content, then the
  // mist breathes in, then the pillars rise while the buttons pop in.
  let testimonialsEntered = false;

  gsap.set(testiCenter, { autoAlpha: 0, y: 30 });
  gsap.set(testiMist, { autoAlpha: 0 });
  gsap.set(testiPillars, { y: 480 });
  gsap.set(stageButtonEls, {
    autoAlpha: 0,
    scale: 0.8,
    transformOrigin: "50% 50%",
  });

  const testimonialsEnter = gsap.timeline({ paused: true });
  testimonialsEnter
    .to(testiCenter, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0)
    .to(testiMist, { autoAlpha: 1, duration: 0.8, ease: "power1.out" }, 0.5)
    .to(
      testiPillars,
      { y: 0, duration: 0.9, ease: "power3.out", stagger: 0.15 },
      0.85,
    )
    .to(
      stageButtonEls,
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(2)",
        stagger: 0.12,
      },
      1.1,
    );

  // Projects entrance: title rises in, the frames scale into place from
  // their centers.
  let projectsEntered = false;

  gsap.set(projectsTitle, { autoAlpha: 0, y: 26 });
  gsap.set(projectFrames, { autoAlpha: 0, scale: 0.7 });

  const projectsEnter = gsap.timeline({ paused: true });
  projectsEnter
    .to(
      projectsTitle,
      { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" },
      0,
    )
    .to(
      projectFrames[0],
      { autoAlpha: 1, scale: 1, duration: 0.75, ease: "back.out(1.2)" },
      0.15,
    )
    .to(
      projectFrames[1],
      { autoAlpha: 1, scale: 1, duration: 0.75, ease: "back.out(1.2)" },
      0.35,
    );

  // Sponsors entrance: the logo grid pops in tile by tile in reading order
  // (left to right, top to bottom) while the pedestal and stone rise from
  // below; the stone teeters, hunting for balance before it settles.
  let sponsorsEntered = false;

  gsap.set(sponsorsTitle, { autoAlpha: 0, y: 26 });
  gsap.set(sponsorTiles, { autoAlpha: 0, y: 16 });
  gsap.set(sponsorStage, { y: 700 });

  const sponsorsEnter = gsap.timeline({ paused: true });
  sponsorsEnter
    .to(
      sponsorsTitle,
      { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" },
      0,
    )
    .to(
      sponsorTiles,
      { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.09 },
      0.15,
    )
    .to(sponsorStage, { y: 0, duration: 1.15, ease: "power3.out" }, 0.2)
    .to(sponsorStone, { rotation: -3.2, duration: 0.4, ease: "sine.inOut" }, 0.35)
    .to(sponsorStone, { rotation: 2.6, duration: 0.42, ease: "sine.inOut" }, 0.75)
    .to(sponsorStone, { rotation: -1.5, duration: 0.36, ease: "sine.inOut" }, 1.17)
    .to(sponsorStone, { rotation: 0.7, duration: 0.3, ease: "sine.inOut" }, 1.53)
    .to(sponsorStone, { rotation: 0, duration: 0.3, ease: "sine.out" }, 1.83);

  // Meet the team entrance: title rises in, the marquee rows fade up into
  // their drift, and the checkered floor slides up from the bottom edge.
  let teamEntered = false;

  gsap.set(teamTitle, { autoAlpha: 0, y: 26 });
  gsap.set(teamRows, { autoAlpha: 0, y: 24 });
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
    .to(teamFloor, { y: 0, duration: 0.7, ease: "power3.out" }, 0.1);

  // Speakers: the info text pops in only when its frame has settled.
  let speakersTextShown = false;
  gsap.set(speakerInfos, { autoAlpha: 0, y: 18 });
  const speakersTextIn = gsap.timeline({ paused: true });
  speakersTextIn.to(speakerInfos, {
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
    // ---- Gradient morph: About purple to Our Values teal.
    .to(
      stageBackdrop,
      {
        "--sec-top": "#37a9c9",
        "--sec-bottom": "#017b9d",
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
        "--sec-top": "#894a3c",
        "--sec-bottom": "#512309",
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
    // ---- Speakers enter: both frames ride up the rail as one strip
    // (constant spacing), settling into the designed layout.
    .fromTo(
      speakersStrip,
      { y: 854 },
      {
        y: 0,
        duration: 2.15,
        ease: "power1.out",
        immediateRender: false,
      },
      17.1,
    )
    // ---- Speakers exit: frames with their text, and the title, rise away.
    .fromTo(
      speakerRows,
      { y: 0, autoAlpha: 1 },
      {
        y: -140,
        autoAlpha: 0,
        duration: 1.1,
        ease: "power1.in",
        stagger: 0.08,
        immediateRender: false,
      },
      20.9,
    )
    .fromTo(
      speakersTitle,
      { y: 0, autoAlpha: 1 },
      {
        y: -110,
        autoAlpha: 0,
        duration: 1,
        ease: "power1.in",
        immediateRender: false,
      },
      20.95,
    )
    .to(sectionSpeakers, { autoAlpha: 0, duration: 0.5 }, 21.9)
    // ---- Gradient morph: rust to the Testimonials purple.
    .to(
      stageBackdrop,
      {
        "--sec-top": "#322243",
        "--sec-bottom": "#251930",
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
    // ---- Testimonials exit: pillars drop out like the About candles,
    // center content and title rise away, mist drifts left. The buttons
    // deliberately stay put for the next section.
    .fromTo(
      testiPillars,
      { y: 0, autoAlpha: 1 },
      {
        y: 430,
        autoAlpha: 0.4,
        duration: 1.1,
        ease: "power1.in",
        stagger: 0.08,
        immediateRender: false,
      },
      26,
    )
    .fromTo(
      testiCenter,
      { y: 0, autoAlpha: 1 },
      {
        y: -140,
        autoAlpha: 0,
        duration: 1.05,
        ease: "power1.in",
        immediateRender: false,
      },
      26.05,
    )
    .fromTo(
      testiTitle,
      { y: 0, autoAlpha: 1 },
      {
        y: -110,
        autoAlpha: 0,
        duration: 1,
        ease: "power1.in",
        immediateRender: false,
      },
      26.1,
    )
    .fromTo(
      testiMist,
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
      26,
    )
    .to(sectionTestimonials, { autoAlpha: 0, duration: 0.5 }, 27)
    // ---- Gradient morph: purple to the Projects teal.
    .to(
      stageBackdrop,
      {
        "--sec-top": "#37a9c9",
        "--sec-bottom": "#017b9d",
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
    // ---- Projects exit: title rises away, frames scale down and fade,
    // and the carried-over buttons finally drop out of frame.
    .fromTo(
      projectFrames,
      { scale: 1, autoAlpha: 1 },
      {
        scale: 0.75,
        autoAlpha: 0,
        duration: 1.05,
        ease: "power1.in",
        stagger: 0.06,
        immediateRender: false,
      },
      31.2,
    )
    .fromTo(
      projectsTitle,
      { y: 0, autoAlpha: 1 },
      {
        y: -110,
        autoAlpha: 0,
        duration: 1,
        ease: "power1.in",
        immediateRender: false,
      },
      31.25,
    )
    .fromTo(
      stageButtonEls,
      { y: 0 },
      {
        y: 320,
        duration: 1,
        ease: "power1.in",
        stagger: 0.05,
        immediateRender: false,
      },
      31.3,
    )
    .to(sectionProjects, { autoAlpha: 0, duration: 0.5 }, 32.2)
    // ---- Gradient morph: teal to the Sponsors burnt orange.
    .to(
      stageBackdrop,
      {
        "--sec-top": "#ca6330",
        "--sec-bottom": "#8f4622",
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
    // ---- Sponsors exit: the grid and its title rise and fade, while the
    // stone and pedestal drop out the bottom, dimming as they go.
    .fromTo(
      sponsorTiles,
      { y: 0, autoAlpha: 1 },
      {
        y: -120,
        autoAlpha: 0,
        duration: 1.05,
        ease: "power1.in",
        stagger: 0.02,
        immediateRender: false,
      },
      36.4,
    )
    .fromTo(
      sponsorsTitle,
      { y: 0, autoAlpha: 1 },
      {
        y: -110,
        autoAlpha: 0,
        duration: 1,
        ease: "power1.in",
        immediateRender: false,
      },
      36.45,
    )
    .fromTo(
      sponsorStage,
      { y: 0, autoAlpha: 1 },
      {
        y: 430,
        autoAlpha: 0.45,
        duration: 1.1,
        ease: "power1.in",
        immediateRender: false,
      },
      36.45,
    )
    .to(sectionSponsors, { autoAlpha: 0, duration: 0.5 }, 37.4)
    // ---- Gradient morph: orange to the Meet the Team teal.
    .to(
      stageBackdrop,
      {
        "--sec-top": "#37a9c9",
        "--sec-bottom": "#017b9d",
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
    // ---- Meet the Team exit: rows and title rise and fade while the
    // floor drops out below, still drifting as they go.
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
    // ---- Gradient morph: teal to the blank test page.
    .to(
      stageBackdrop,
      {
        "--sec-top": "#1b1526",
        "--sec-bottom": "#0e0b14",
        duration: 1.2,
        ease: "power1.inOut",
      },
      42.2,
    )
    .to(
      sectionBlank,
      { autoAlpha: 1, duration: 0.8, ease: "power1.inOut" },
      43.0,
    )
    // Dwell segment: the last section holds while the scroll runs out.
    .set({}, {}, 44);

  // ---- Navbar navigation: animate the page scroll to a section's dwell
  // point, so the current section plays its exit and the target its enter
  // along the way. The logo returns to the hero's settled night state.
  const NAV_SCROLL_TARGETS = {
    about: 11.4,
    values: 14.8,
    speakers: 19.7,
    testimonials: 24.6,
    projects: 29.6,
    sponsors: 34.6,
    team: 39.8,
  };
  let navScrollTween = null;
  const killNavScroll = () => {
    if (navScrollTween) {
      navScrollTween.kill();
      navScrollTween = null;
    }
  };

  const scrollToTimelineT = (T) => {
    const trigger = scrollTimeline.scrollTrigger;
    const target =
      trigger.start +
      clamp01(T / TIMELINE_SPAN) * (trigger.end - trigger.start);
    killNavScroll();
    const proxy = { y: window.scrollY };
    navScrollTween = gsap.to(proxy, {
      y: target,
      duration: gsap.utils.clamp(0.9, 2.8, Math.abs(target - proxy.y) / 2000),
      ease: "power2.inOut",
      onUpdate: () => window.scrollTo(0, Math.round(proxy.y)),
      onComplete: killNavScroll,
    });
  };

  nav.querySelectorAll(".site-nav__links > a[data-section]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToTimelineT(NAV_SCROLL_TARGETS[link.dataset.section]);
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
