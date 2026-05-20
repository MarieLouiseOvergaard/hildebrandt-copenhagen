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
} else {
  updateStickyBooking(false);
}

function updateMobileNavPosition() {
  document.body.classList.toggle("is-mobile-nav-fixed", window.scrollY > 0);
}

updateMobileNavPosition();
window.addEventListener("scroll", updateMobileNavPosition, { passive: true });
window.addEventListener("resize", updateMobileNavPosition);
