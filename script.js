const mobileMenu = document.querySelector(".mobile-menu");
const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".mobile-menu-close");
const productsToggle = document.querySelector(".mobile-menu-link-products");
const productsBack = document.querySelector(".mobile-menu-back");
const mobileMenuScroll = document.querySelector(".mobile-menu-scroll");
const heroBookingButton = document.querySelector(".hero .button-primary");

function openMobileMenu(event) {
  mobileMenu.classList.add("is-open");
  mobileMenu.classList.remove("is-products");
  mobileMenu.setAttribute("aria-hidden", "false");
  menuToggle.setAttribute("aria-expanded", "true");
  document.body.classList.add("is-menu-open");
}

function closeMobileMenu() {
  mobileMenu.classList.remove("is-open", "is-products");
  mobileMenu.setAttribute("aria-hidden", "true");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("is-menu-open");
}

function toggleMobileMenu(event) {
  if (event) {
    event.preventDefault();
  }

  if (mobileMenu.classList.contains("is-open")) {
    closeMobileMenu();
    return;
  }

  openMobileMenu();
}

function showProductsMenu() {
  mobileMenu.classList.add("is-products");
  if (mobileMenuScroll) {
    mobileMenuScroll.scrollTop = 0;
  }
}

function showMainMenu() {
  mobileMenu.classList.remove("is-products");
}

// Mobilmenuen styres kun, hvis elementerne findes på siden.
if (mobileMenu && menuToggle && menuClose && productsToggle && productsBack) {
  menuToggle.addEventListener("click", toggleMobileMenu);
  menuClose.addEventListener("click", closeMobileMenu);
  productsToggle.addEventListener("click", showProductsMenu);
  productsBack.addEventListener("click", showMainMenu);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenu.classList.contains("is-open")) {
      closeMobileMenu();
    }
  });
}

function updateStickyBooking(isHeroBookingVisible) {
  document.body.classList.toggle("is-sticky-booking-visible", !isHeroBookingVisible);
}

if (heroBookingButton && "IntersectionObserver" in window) {
  const heroBookingObserver = new IntersectionObserver(
    ([entry]) => {
      updateStickyBooking(entry.isIntersecting);
    },
    {
      threshold: 0.08,
    }
  );

  heroBookingObserver.observe(heroBookingButton);
} else if (heroBookingButton) {
  const handleBookingVisibility = () => {
    const bounds = heroBookingButton.getBoundingClientRect();
    updateStickyBooking(bounds.bottom > 0 && bounds.top < window.innerHeight);
  };

  handleBookingVisibility();
  window.addEventListener("scroll", handleBookingVisibility, { passive: true });
  window.addEventListener("resize", handleBookingVisibility);
}

function updateMobileNavPosition() {
  const isFixed = window.scrollY > 0;
  document.body.classList.toggle("is-mobile-nav-fixed", isFixed);

  if (!heroBookingButton) {
    updateStickyBooking(!isFixed);
  }
}

updateMobileNavPosition();
window.addEventListener("scroll", updateMobileNavPosition, { passive: true });
window.addEventListener("resize", updateMobileNavPosition);

const contactStatus = document.querySelector(".kontakt-status");

if (heroBookingButton) {
  document.body.classList.add("has-hero-booking-cta");
}

function getCopenhagenTimeParts() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Copenhagen",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  return formatter.formatToParts(new Date()).reduce((parts, part) => {
    parts[part.type] = part.value;
    return parts;
  }, {});
}

function formatOpeningTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
}

function getNextOpening(schedule, currentDayIndex, currentMinutes) {
  for (let offset = 0; offset < schedule.length; offset += 1) {
    const dayIndex = (currentDayIndex + offset) % schedule.length;
    const day = schedule[dayIndex];

    if (!day.open) {
      continue;
    }

    if (offset === 0 && currentMinutes >= day.open) {
      continue;
    }

    return {
      dayLabel: offset === 0 ? "i dag" : day.name,
      time: formatOpeningTime(day.open),
    };
  }

  return null;
}

function updateContactOpeningStatus() {
  if (!contactStatus) {
    return;
  }

  const statusLabel = contactStatus.querySelector(".kontakt-status-label");
  const statusDetail = contactStatus.querySelector(".kontakt-status-detail");

  if (!statusLabel || !statusDetail) {
    return;
  }

  const schedule = [
    { name: "mandag", weekday: "Mon", open: 8 * 60 + 30, close: 14 * 60 },
    { name: "tirsdag", weekday: "Tue", open: 10 * 60, close: 17 * 60 + 30 },
    { name: "onsdag", weekday: "Wed", open: null, close: null },
    { name: "torsdag", weekday: "Thu", open: 10 * 60, close: 17 * 60 + 30 },
    { name: "fredag", weekday: "Fri", open: 10 * 60, close: 16 * 60 },
    { name: "lørdag", weekday: "Sat", open: null, close: null },
    { name: "søndag", weekday: "Sun", open: null, close: null },
  ];

  const timeParts = getCopenhagenTimeParts();
  const currentDayIndex = schedule.findIndex((day) => day.weekday === timeParts.weekday);

  if (currentDayIndex === -1) {
    return;
  }

  const currentMinutes = Number(timeParts.hour) * 60 + Number(timeParts.minute);
  const today = schedule[currentDayIndex];
  const isOpen = Boolean(today && today.open !== null && currentMinutes >= today.open && currentMinutes < today.close);

  contactStatus.classList.toggle("kontakt-status--open", isOpen);
  contactStatus.classList.toggle("kontakt-status--closed", !isOpen);
  statusLabel.textContent = isOpen ? "ÅBEN NU" : "LUKKET NU";

  if (isOpen) {
    statusDetail.textContent = `Lukker kl. ${formatOpeningTime(today.close)}`;
    return;
  }

  const nextOpening = getNextOpening(schedule, currentDayIndex, currentMinutes);
  statusDetail.textContent = nextOpening ? `Åbner igen ${nextOpening.dayLabel} kl. ${nextOpening.time}` : "";
}

if (contactStatus) {
  updateContactOpeningStatus();
  window.setInterval(updateContactOpeningStatus, 60000);
}

const postMenu = document.querySelector(".indlaeg-menu");

if (postMenu) {
  const postMenuLinks = Array.from(postMenu.querySelectorAll(".indlaeg-menu-link"));
  const postMenuToggle = postMenu.querySelector(".indlaeg-menu-toggle");
  const postMenuSteps = Array.from(postMenu.querySelectorAll(".indlaeg-menu-step"));
  const postMenuLayout = postMenu.closest(".indlaeg-layout");
  const postSections = postMenuLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  let shouldIgnorePostScrollSpy = false;
  let postScrollTimeoutId = null;
  let postMenuStartTop = 0;

  function setActivePostMenuItem(id) {
    postMenuLinks.forEach((link) => {
      const item = link.closest(".indlaeg-menu-punkt");
      const isActive = link.getAttribute("href") === `#${id}`;
      const linkIndex = postMenuLinks.indexOf(link);

      link.classList.toggle("aktiv", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }

      if (item) {
        item.classList.toggle("aktiv", isActive);
      }

      if (postMenuSteps[linkIndex]) {
        postMenuSteps[linkIndex].classList.toggle("aktiv", isActive);
      }
    });
  }

  function setPostMenuOpen(isOpen) {
    postMenu.classList.toggle("is-open", isOpen);

    if (postMenuToggle) {
      postMenuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
  }

  function getPostHeaderOffset() {
    const header = document.querySelector(".header");
    return header && getComputedStyle(header).position === "fixed" ? header.offsetHeight + 24 : 24;
  }

  function updateActivePostMenuFromScroll() {
    if (shouldIgnorePostScrollSpy || postSections.length === 0) {
      return;
    }

    const headerOffset = getPostHeaderOffset();
    const activeSection = postSections.reduce((currentSection, section) => {
      const sectionTop = section.getBoundingClientRect().top - headerOffset - 20;

      if (sectionTop <= 0) {
        return section;
      }

      return currentSection;
    }, postSections[0]);

    setActivePostMenuItem(activeSection.id);
  }

  function updatePostMenuFixedPosition() {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    if (!isMobile) {
      postMenu.classList.remove("is-mobile-fixed");

      if (postMenuLayout) {
        postMenuLayout.classList.remove("is-menu-fixed");
      }

      return;
    }

    const isFixed = window.scrollY >= postMenuStartTop;
    postMenu.classList.toggle("is-mobile-fixed", isFixed);

    if (postMenuLayout) {
      postMenuLayout.classList.toggle("is-menu-fixed", isFixed);
    }
  }

  function setPostMenuStartTop() {
    const wasFixed = postMenu.classList.contains("is-mobile-fixed");

    postMenu.classList.remove("is-mobile-fixed");
    postMenuStartTop = postMenu.getBoundingClientRect().top + window.scrollY;
    postMenu.classList.toggle("is-mobile-fixed", wasFixed);
    updatePostMenuFixedPosition();
  }

  postMenuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("href").slice(1);
      const target = document.getElementById(targetId);

      if (!target) {
        return;
      }

      shouldIgnorePostScrollSpy = true;
      setActivePostMenuItem(targetId);
      setPostMenuOpen(false);

      window.clearTimeout(postScrollTimeoutId);
      postScrollTimeoutId = window.setTimeout(() => {
        shouldIgnorePostScrollSpy = false;
        updateActivePostMenuFromScroll();
      }, 500);
    });
  });

  if (postMenuToggle) {
    postMenuToggle.addEventListener("click", () => {
      setPostMenuOpen(!postMenu.classList.contains("is-open"));
    });
  }

  if (window.location.hash) {
    setActivePostMenuItem(window.location.hash.slice(1));
  } else {
    updateActivePostMenuFromScroll();
  }

  setPostMenuStartTop();
  window.addEventListener("scroll", updateActivePostMenuFromScroll, { passive: true });
  window.addEventListener("scroll", updatePostMenuFixedPosition, { passive: true });
  window.addEventListener("load", setPostMenuStartTop);
  window.addEventListener("resize", () => {
    setPostMenuStartTop();
    updateActivePostMenuFromScroll();
  });
  window.addEventListener("hashchange", () => {
    if (window.location.hash) {
      setActivePostMenuItem(window.location.hash.slice(1));
    }
  });
}

const productRows = document.querySelectorAll(".product-row");
const treatmentRows = document.querySelectorAll(".behandlinger-sektion-liste");
const productCards = document.querySelectorAll(".product-card");
const reviewSlider = document.querySelector("[data-anmeldelser-slider]");

function setupReviewSlider(slider) {
  const track = slider.querySelector("[data-anmeldelser-track]");
  const slides = track ? Array.from(track.querySelectorAll(".anmeldelse")) : [];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const displayDuration = Number.parseFloat(getComputedStyle(slider.closest(".anmeldelser")).getPropertyValue("--anmeldelse-display-duration")) || 5000;
  const transitionDuration = Number.parseFloat(getComputedStyle(slider.closest(".anmeldelser")).getPropertyValue("--anmeldelse-transition-duration")) || 600;
  let activeIndex = 0;
  let intervalId = null;
  let visibleCount = 1;

  if (!track || slides.length <= 1) {
    return;
  }

  function getVisibleCount() {
    return window.matchMedia("(max-width: 767px)").matches ? 1 : 3;
  }

  function updateSlideAccessibility() {
    Array.from(track.children).forEach((slide) => {
      const originalIndex = Number(slide.dataset.reviewIndex);
      const isVisible =
        !slide.dataset.clone &&
        originalIndex >= activeIndex &&
        originalIndex < activeIndex + visibleCount;

      slide.setAttribute("aria-hidden", isVisible ? "false" : "true");
    });
  }

  function getSlideStep() {
    const firstSlide = track.querySelector(".anmeldelse");
    const secondSlide = firstSlide ? firstSlide.nextElementSibling : null;

    if (firstSlide && secondSlide) {
      return secondSlide.offsetLeft - firstSlide.offsetLeft;
    }

    return slider.clientWidth;
  }

  function setTrackPosition(shouldAnimate = true) {
    track.style.transition = shouldAnimate ? "" : "none";
    track.style.transform = `translateX(${-getSlideStep() * activeIndex}px)`;
    updateSlideAccessibility();

    if (!shouldAnimate) {
      track.offsetHeight;
      track.style.transition = "";
    }
  }

  function rebuildClones() {
    track.querySelectorAll("[data-clone='true']").forEach((clone) => clone.remove());
    visibleCount = getVisibleCount();

    slides.forEach((slide, index) => {
      slide.dataset.reviewIndex = String(index);
      slide.removeAttribute("data-clone");
    });

    slides.slice(0, visibleCount).forEach((slide, index) => {
      const clone = slide.cloneNode(true);
      clone.dataset.clone = "true";
      clone.dataset.reviewIndex = String(index);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });

    activeIndex = 0;
    setTrackPosition(false);
  }

  function setActiveReview(nextIndex) {
    activeIndex = nextIndex;
    setTrackPosition();

    if (activeIndex >= slides.length) {
      window.setTimeout(() => {
        activeIndex = 0;
        setTrackPosition(false);
      }, transitionDuration);
    }
  }

  function stopReviews() {
    window.clearInterval(intervalId);
    intervalId = null;
  }

  function startReviews() {
    if (reduceMotion || intervalId) {
      return;
    }

    intervalId = window.setInterval(() => {
      setActiveReview(activeIndex + 1);
    }, displayDuration);
  }

  slider.addEventListener("mouseenter", stopReviews);
  slider.addEventListener("mouseleave", startReviews);
  slider.addEventListener("focusin", stopReviews);
  slider.addEventListener("focusout", startReviews);
  window.addEventListener("resize", rebuildClones);

  rebuildClones();
  startReviews();
}

if (reviewSlider) {
  setupReviewSlider(reviewSlider);
}

function setupSliderIndicators(row, options = {}) {
  const itemSelector = options.itemSelector || ".product-card, .product-promo-card";
  const label = options.label || "produktgruppe";
  const indicators = row.nextElementSibling;

  if (!indicators || !indicators.classList.contains("slider-indicators")) {
    return;
  }

  function updateIndicators() {
    const maxScroll = row.scrollWidth - row.clientWidth;

    if (maxScroll <= 1) {
      indicators.classList.add("is-hidden");
      indicators.replaceChildren();
      return;
    }

    indicators.classList.remove("is-hidden");

    const card = row.querySelector(itemSelector);
    const cardWidth = card ? card.getBoundingClientRect().width : row.clientWidth;
    const visibleCards = Math.max(1, Math.floor(row.clientWidth / cardWidth));
    const totalCards = row.querySelectorAll(itemSelector).length;
    const pages = Math.max(2, totalCards - visibleCards + 1);

    if (indicators.children.length !== pages) {
      indicators.replaceChildren();

      for (let index = 0; index < pages; index += 1) {
        const indicator = document.createElement("button");
        indicator.className = "indicator";
        indicator.type = "button";
        indicator.setAttribute("aria-label", `Gå til ${label} ${index + 1}`);

        indicator.addEventListener("click", () => {
          const targetLeft = pages === 1 ? 0 : (maxScroll / (pages - 1)) * index;

          row.scrollTo({
            left: targetLeft,
            behavior: "smooth",
          });
        });

        indicators.appendChild(indicator);
      }
    }

    const activeIndex = Math.round((row.scrollLeft / maxScroll) * (pages - 1));

    Array.from(indicators.children).forEach((indicator, index) => {
      const isActive = index === activeIndex;
      indicator.classList.toggle("active", isActive);
      indicator.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  updateIndicators();
  row.addEventListener("scroll", updateIndicators, { passive: true });
  window.addEventListener("resize", updateIndicators);
}

productRows.forEach((row) => {
  setupSliderIndicators(row, {
    itemSelector: ".product-card, .product-promo-card",
    label: "produktgruppe",
  });
});

treatmentRows.forEach((row) => {
  setupSliderIndicators(row, {
    itemSelector: ".forside-behandling-kort",
    label: "behandling",
  });
});

productCards.forEach((card) => {
  const image = card.querySelector(".product-image");

  if (!image || image.querySelector(".product-add-button")) {
    return;
  }

  const productLink = card.querySelector("h4 a");
  const productImage = image.querySelector("img");

  if (productLink && productImage && !productImage.closest("a")) {
    const imageLink = document.createElement("a");
    imageLink.href = productLink.getAttribute("href");
    imageLink.setAttribute("aria-label", `Se ${productLink.textContent.trim()}`);
    productImage.before(imageLink);
    imageLink.appendChild(productImage);
  }

  const quickViewButton = document.createElement("button");
  quickViewButton.className = "product-hover-eye";
  quickViewButton.type = "button";
  quickViewButton.setAttribute("aria-label", "Se produkt");

  const quickViewIcon = document.createElement("img");
  quickViewIcon.src = "img/ikoner/eye.svg";
  quickViewIcon.alt = "";
  quickViewIcon.setAttribute("aria-hidden", "true");
  quickViewButton.addEventListener("click", () => {
    openQuickView(card);
  });

  const addButton = document.createElement("button");
  addButton.className = "product-add-button";
  addButton.type = "button";
  addButton.setAttribute("aria-label", "Tilføj til kurv");

  const addButtonText = document.createElement("span");
  addButtonText.className = "product-add-button-text";
  addButtonText.textContent = "Tilføj til kurv";

  const addButtonIcon = document.createElement("img");
  addButtonIcon.className = "product-add-button-icon";
  addButtonIcon.src = "img/ikoner/kurv.svg";
  addButtonIcon.alt = "";
  addButtonIcon.setAttribute("aria-hidden", "true");

  quickViewButton.appendChild(quickViewIcon);
  addButton.append(addButtonText, addButtonIcon);
  image.append(quickViewButton, addButton);
});

const quickViewCatalog = {
  "rich repair cleansing shampoo": {
    tags: ["Økologisk", "Vegansk", "Parfumefri", "Unisex"],
    description:
      "Giver mere næring og ro til krøller, der føles tørre, frizzede eller medtagne.",
    sizes: [
      { label: "100 ml", price: "110 kr.", image: "img/produktbilleder/MIXLY-Rich-Repair-Shampoo-100.png" },
      { label: "250 ml", price: "299 kr.", image: "img/produktbilleder/Rich-Shampoo-1.png" },
      { label: "1000 ml", price: "379 kr.", image: "img/produktbilleder/MIXLY-Rich-Repair-Shampoo-1000ml.png" },
    ],
    detailsImage: "img/produktbilleder/MIXLY-Rich-Repair-Shampoo-1000ml.png",
    fullLink: "products/shampoo/rich-repair-cleansing-shampoo.html",
    guide: [
      ["Brug", "Fordel i vådt hår, massér og skyl grundigt."],
      ["God til", "Tørre, krusede eller medtagne krøller."],
      ["Effekt", "Mere næring, styrke og mindre frizz."],
    ],
  },
  "low refresh cleansing shampoo": {
    tags: ["Økologisk", "Vegansk", "Parfumefri", "Unisex"],
    description:
      "Renser skånsomt og hjælper krøller med at bevare fugt, lethed og spændstighed.",
    sizes: [
      { label: "100 ml", price: "110 kr.", image: "img/produktbilleder/MIXLY-Low-Refresh-Shampoo-100.png" },
      { label: "1000 ml", price: "379 kr.", image: "img/produktbilleder/MIXLY-Low-Refresh-Shampoo-1000.png" },
    ],
    detailsImage: "img/produktbilleder/MIXLY-Low-Refresh-Shampoo-1000.png",
    fullLink: "products/shampoo/low-refresh-cleansing-shampoo.html",
    guide: [
      ["Brug", "Massér i vådt hår og skyl grundigt."],
      ["God til", "Fint hår, bølger og krøller der let tynges."],
      ["Effekt", "Renser let og bevarer bevægelse."],
    ],
  },
  "low conditioner": {
    tags: ["Økologisk", "Vegansk", "Parfumefri", "Unisex"],
    description:
      "Let conditioner, der hjælper krøller med styrke og bevægelse uden at tynge.",
    sizes: [
      { label: "250 ml", price: "159 kr.", image: "img/produktbilleder/Low-Conditioner-1.png", link: "products/conditioner/mixly-low-conditioner.html" },
      { label: "1000 ml", price: "399 kr.", image: "img/produktbilleder/MIXLY-Low-Conditioner-1000.png", link: "products/conditioner/mixly-low-conditioner.html" },
    ],
    detailsImage: "img/ingredienser/Ingrediens-MIXLY-Low-Conditioner-1000.png",
    fullLink: "products/conditioner/mixly-low-conditioner.html",
    guide: [
      ["Brug", "Fordel i nyvasket, vådt hår og skyl grundigt."],
      ["God til", "Fine krøller, bølger eller hår der let bliver tynget."],
      ["Effekt", "Fugt, styrke og naturlig lethed."],
    ],
  },
  "rich deep drink conditioner": {
    tags: ["Økologisk", "Vegansk", "Parfumefri", "Unisex"],
    description:
      "Conditioner med intens fugt, der hjælper tørre krøller med mere blødhed og ro.",
    sizes: [
      { label: "200 ml", price: "159 kr.", image: "img/produktbilleder/MIXLY-Rich-Deep-Drink-Conditioner-200.png" },
      { label: "1000 ml", price: "399 kr.", image: "img/produktbilleder/MIXLY-Rich-Deep-Drink-Conditioner-1000.png" },
    ],
    detailsImage: "img/produktbilleder/MIXLY-Rich-Deep-Drink-Conditioner-1000.png",
    fullLink: "products/conditioner/rich-deep-drink-conditioner.html",
    guide: [
      ["Brug", "Fordel i længderne efter shampoo og skyl."],
      ["God til", "Tørre krøller der mangler fugt og ro."],
      ["Effekt", "Blødhed, glans og mindre frizz."],
    ],
  },
};

const productPageSizeButtons = document.querySelectorAll(".produkt-skabelon-size[data-product-price]");

if (productPageSizeButtons.length) {
  const productPagePrice = document.querySelector("[data-product-page-price]");

  productPageSizeButtons.forEach((button, index) => {
    const isActive = index === 0;
    button.classList.toggle("produkt-skabelon-size-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));

    if (isActive && productPagePrice) {
      productPagePrice.textContent = button.dataset.productPrice;
    }

    button.addEventListener("click", () => {
      productPageSizeButtons.forEach((sizeButton) => {
        sizeButton.classList.remove("produkt-skabelon-size-active");
        sizeButton.setAttribute("aria-pressed", "false");
      });

      button.classList.add("produkt-skabelon-size-active");
      button.setAttribute("aria-pressed", "true");

      if (productPagePrice) {
        productPagePrice.textContent = button.dataset.productPrice;
      }
    });
  });
}

let quickViewModal = null;
let lastQuickViewTrigger = null;

function normalizeProductTitle(title) {
  return title.trim().toLowerCase();
}

function getQuickViewData(card) {
  const title = card.querySelector("h4")?.textContent.trim() || "Produkt";
  const key = normalizeProductTitle(title);
  const catalogData = quickViewCatalog[key] || {};
  const image = card.querySelector(".product-image img");
  const price = card.querySelector(".product-meta span:first-child")?.textContent.trim() || "";
  const description = card.querySelector(".product-content p")?.textContent.trim() || "";
  const fullLink = card.querySelector("h4 a")?.getAttribute("href") || catalogData.fullLink || "#";
  const fallbackImage = image?.getAttribute("src") || "";

  return {
    title,
    description: catalogData.description || description,
    tags: catalogData.tags || ["Økologisk", "Vegansk", "Parfumefri", "Unisex"],
    sizes: catalogData.sizes || [{ label: "", price, image: fallbackImage, link: fullLink }],
    detailsImage: catalogData.detailsImage || fallbackImage,
    fullLink,
    // TODO: Eksisterende quick view-tekster til Brug, God til og Effekt mangler for produkter uden catalogData.guide.
    guide: catalogData.guide || [],
  };
}

function createQuickViewModal() {
  const modal = document.createElement("div");
  modal.className = "quick-view";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "quick-view-title");
  modal.hidden = true;
  modal.innerHTML = `
    <div class="quick-view-backdrop" data-quick-view-close></div>
    <article class="quick-view-panel">
      <button class="quick-view-close" type="button" aria-label="Luk quick view" data-quick-view-close>×</button>
      <div class="quick-view-body">
        <section class="quick-view-intro">
          <div class="quick-view-media">
            <div class="quick-view-detail-image">
              <img alt="">
            </div>
          </div>
          <div class="quick-view-summary">
            <h2 id="quick-view-title"></h2>
            <fieldset class="quick-view-sizes">
              <legend class="quick-view-size-label">Vælg størrelse</legend>
              <div class="quick-view-size-options"></div>
            </fieldset>
            <p class="quick-view-price" aria-live="polite"></p>
            <button class="button button-primary quick-view-buy" type="button">Tilføj til kurv</button>
            <div class="quick-view-guide" aria-label="Kort produktinformation"></div>
            <a class="quick-view-read-more" href="#">
              <span>Læs mere om produktet</span>
              <span aria-hidden="true">›</span>
            </a>
          </div>
        </section>
      </div>
    </article>
  `;

  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-quick-view-close]")) {
      closeQuickView();
    }
  });

  document.body.appendChild(modal);
  return modal;
}

function setQuickViewSize(modal, data, selectedIndex) {
  const selectedSize = data.sizes[selectedIndex];
  const price = modal.querySelector(".quick-view-price");
  const readMore = modal.querySelector(".quick-view-read-more");

  price.textContent = selectedSize.price;
  readMore.href = selectedSize.link || data.fullLink;

  modal.querySelectorAll(".quick-view-size").forEach((button, index) => {
    const isActive = index === selectedIndex;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderQuickView(card) {
  const data = getQuickViewData(card);
  const modal = quickViewModal || createQuickViewModal();
  quickViewModal = modal;

  modal.querySelector("#quick-view-title").textContent = data.title;

  const sizes = modal.querySelector(".quick-view-size-options");
  const sizeFieldset = modal.querySelector(".quick-view-sizes");
  const hasMultipleSizes = data.sizes.length > 1;

  sizeFieldset.hidden = !hasMultipleSizes;
  sizes.replaceChildren(...(hasMultipleSizes ? data.sizes.map((size, index) => {
    const button = document.createElement("button");
    button.className = "quick-view-size";
    button.type = "button";
    button.textContent = size.label;
    button.setAttribute("aria-label", `Vælg ${size.label}`);
    button.addEventListener("click", () => {
      setQuickViewSize(modal, data, index);
    });
    return button;
  }) : []));

  const detailImage = modal.querySelector(".quick-view-detail-image img");
  detailImage.src = data.detailsImage;
  detailImage.alt = `${data.title} produktvisual`;

  const guide = modal.querySelector(".quick-view-guide");
  guide.replaceChildren(...data.guide.map(([title, text]) => {
    const item = document.createElement("div");
    item.className = "quick-view-guide-item";

    const itemTitle = document.createElement("h3");
    itemTitle.textContent = title;

    const itemText = document.createElement("p");
    itemText.textContent = text;

    item.append(itemTitle, itemText);
    return item;
  }));

  setQuickViewSize(modal, data, 0);
  return modal;
}

function openQuickView(card) {
  lastQuickViewTrigger = document.activeElement;
  const modal = renderQuickView(card);
  modal.hidden = false;
  document.body.classList.add("is-quick-view-open");

  window.setTimeout(() => {
    modal.querySelector(".quick-view-close").focus();
  }, 0);
}

function closeQuickView() {
  if (!quickViewModal || quickViewModal.hidden) {
    return;
  }

  quickViewModal.hidden = true;
  document.body.classList.remove("is-quick-view-open");

  if (lastQuickViewTrigger && typeof lastQuickViewTrigger.focus === "function") {
    lastQuickViewTrigger.focus();
  }
}

document.addEventListener("keydown", (event) => {
  if (!quickViewModal || quickViewModal.hidden) {
    return;
  }

  if (event.key === "Escape") {
    closeQuickView();
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusable = Array.from(
    quickViewModal.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])")
  ).filter((item) => item.offsetParent !== null);

  if (!focusable.length) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
