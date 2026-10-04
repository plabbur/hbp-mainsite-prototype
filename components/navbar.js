// <hbp-navbar current="about"> — the site's shared primary navigation.
//
// Every page includes components/navbar.css plus this script (in <head>,
// without defer, so the element upgrades as soon as it is parsed) and drops
// the tag where the nav belongs. It renders light DOM with the .site-nav
// classes, so page scripts can query #site-nav and its links directly.
//
// Responsive states (see navbar.css):
//   >= 1180px  logo, section links and both buttons inline
//   600-1179px logo, buttons and a menu toggle; links move into the menu
//   <  600px   logo and menu toggle; links and the two actions (as plain
//              menu items) move into the menu
// The open menu is the Figma "Mobile Menu" frame: a navy overlay with the
// links stacked top-left and a dinosaur skeleton in the bottom corner.
(() => {
  const NAV_ITEMS = [
    { section: "about", label: "About us" },
    { section: "values", label: "Our values" },
    { section: "speakers", label: "Speakers" },
    { section: "testimonials", label: "Testimonials" },
    { section: "projects", label: "Projects" },
    { section: "sponsors", label: "Sponsors" },
    { section: "team", label: "Our team" },
    { section: "faqs", label: "FAQs" },
  ];
  const NAV_ACTIONS = [
    { label: "Sponsor us", href: "#", variant: "ghost" },
    { label: "Apply", href: "#", variant: "solid" },
  ];
  const DESKTOP_QUERY = "(min-width: 1180px)";
  const SCROLL_KEYS = new Set([
    " ",
    "ArrowUp",
    "ArrowDown",
    "PageUp",
    "PageDown",
    "Home",
    "End",
  ]);

  const actionsMarkup = (modifier) => `
    <div class="site-nav__actions site-nav__actions--${modifier}">
      ${NAV_ACTIONS.map(
        ({ label, href, variant }) =>
          `<a class="btn btn--${variant}" href="${href}">${label}</a>`,
      ).join("")}
    </div>`;

  class HbpNavbar extends HTMLElement {
    connectedCallback() {
      if (this.nav) return;

      const current = this.getAttribute("current");
      this.innerHTML = `
        <nav class="site-nav" id="site-nav" aria-label="Primary">
          <a class="site-nav__logo" href="#" aria-label="HackBeanpot home">
            <img src="./assets/logo-mark.svg" alt="" />
            <span>HackBeanpot</span>
          </a>
          <div class="site-nav__right">
            <div class="site-nav__links" id="site-nav-menu">
              ${NAV_ITEMS.map(
                ({ section, label }) =>
                  `<a href="#" data-section="${section}"${
                    section === current ? ' class="is-current"' : ""
                  }>${label}</a>`,
              ).join("")}
              ${NAV_ACTIONS.map(
                ({ label, href }) =>
                  `<a class="site-nav__menu-action" href="${href}">${label}</a>`,
              ).join("")}
              <div class="site-nav__menu-art" aria-hidden="true">
                <div class="site-nav__menu-art-inner">
                  <img class="menu-art-dino" src="./assets/menu/dinosaur.svg" alt="" />
                  <img class="menu-art-glow" src="./assets/menu/glow.svg" alt="" />
                  <img class="menu-art-eye" src="./assets/menu/eye.svg" alt="" />
                  <img class="menu-art-wave" src="./assets/menu/wave.svg" alt="" />
                </div>
              </div>
            </div>
            ${actionsMarkup("bar")}
            <button
              class="site-nav__toggle"
              type="button"
              aria-expanded="false"
              aria-controls="site-nav-menu"
              aria-label="Open menu"
            >
              <img class="site-nav__toggle-open" src="./assets/icon-menu.svg" alt="" />
              <img class="site-nav__toggle-close" src="./assets/menu/close.svg" alt="" />
            </button>
          </div>
        </nav>`;

      this.nav = this.querySelector(".site-nav");
      this.menu = this.querySelector(".site-nav__links");
      this.toggle = this.querySelector(".site-nav__toggle");

      this.toggle.addEventListener("click", () => this.setOpen(!this.isOpen));
      // Any link or button in the open menu navigates, so close behind it;
      // a click on the overlay's empty space dismisses it.
      this.menu.addEventListener("click", (event) => {
        if (!this.isOpen) return;
        if (event.target === this.menu || event.target.closest("a")) {
          this.setOpen(false);
        }
      });
      document.addEventListener("keydown", (event) => {
        if (!this.isOpen) return;
        if (event.key === "Escape") {
          this.setOpen(false);
          this.toggle.focus({ preventScroll: true });
        } else if (SCROLL_KEYS.has(event.key)) {
          event.preventDefault();
        }
      });
      // The page scroll drives the scene, so hold it while the menu is up.
      // (overflow: hidden on the root would unstick the sticky stage.) The
      // menu itself may still scroll when it overflows a short viewport.
      const holdScroll = (event) => {
        if (!this.isOpen) return;
        const menuScrolls = this.menu.scrollHeight > this.menu.clientHeight;
        if (!(menuScrolls && this.menu.contains(event.target))) {
          event.preventDefault();
        }
      };
      window.addEventListener("wheel", holdScroll, { passive: false });
      window.addEventListener("touchmove", holdScroll, { passive: false });
      window.matchMedia(DESKTOP_QUERY).addEventListener("change", (event) => {
        if (event.matches) this.setOpen(false);
      });
    }

    get isOpen() {
      return this.nav.classList.contains("site-nav--open");
    }

    setOpen(open) {
      this.nav.classList.toggle("site-nav--open", open);
      this.toggle.setAttribute("aria-expanded", String(open));
      this.toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      // preventScroll: the stage clips with overflow: hidden, and a focus
      // scroll would shift it sideways.
      if (open) this.menu.querySelector("a").focus({ preventScroll: true });
    }
  }

  customElements.define("hbp-navbar", HbpNavbar);
})();
