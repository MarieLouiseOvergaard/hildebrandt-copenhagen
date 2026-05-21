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

const productRows = document.querySelectorAll(".product-row");
const productCards = document.querySelectorAll(".product-card");

function setupProductIndicators(row) {
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

    const card = row.querySelector(".product-card, .product-promo-card");
    const cardWidth = card ? card.getBoundingClientRect().width : row.clientWidth;
    const visibleCards = Math.max(1, Math.floor(row.clientWidth / cardWidth));
    const totalCards = row.querySelectorAll(".product-card, .product-promo-card").length;
    const pages = Math.max(2, totalCards - visibleCards + 1);

    if (indicators.children.length !== pages) {
      indicators.replaceChildren();

      for (let index = 0; index < pages; index += 1) {
        const indicator = document.createElement("button");
        indicator.className = "indicator";
        indicator.type = "button";
        indicator.setAttribute("aria-label", `Gå til produktgruppe ${index + 1}`);

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

productRows.forEach(setupProductIndicators);

productCards.forEach((card) => {
  const image = card.querySelector(".product-image");

  if (!image || image.querySelector(".product-add-button")) {
    return;
  }

  const quickViewButton = document.createElement("button");
  quickViewButton.className = "product-hover-eye";
  quickViewButton.type = "button";
  quickViewButton.setAttribute("aria-label", "Se produkt");

  const quickViewIcon = document.createElement("img");
  quickViewIcon.src = "img/Eye-icon.svg";
  quickViewIcon.alt = "";
  quickViewIcon.setAttribute("aria-hidden", "true");

  const addButton = document.createElement("button");
  addButton.className = "product-add-button";
  addButton.type = "button";
  addButton.textContent = "Tilføj til kurv";

  quickViewButton.appendChild(quickViewIcon);
  image.append(quickViewButton, addButton);
});
