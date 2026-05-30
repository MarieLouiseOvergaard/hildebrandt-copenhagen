const mobileMenu = document.querySelector(".mobile-menu");
const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".mobile-menu-close");
const productsToggle = document.querySelector(".mobile-menu-link-products");
const productsBack = document.querySelector(".mobile-menu-back");
const mobileMenuScroll = document.querySelector(".mobile-menu-scroll");
const mobileBookingMedia = window.matchMedia("(max-width: 767px)");
const mainContent = document.querySelector("main");
const mobileBookingTrigger = mainContent?.querySelector(":scope > section, :scope > article, :scope > div") || mainContent;

function prepareButtonUnderlines() {
  const underlineButtons = document.querySelectorAll(
    ".button, .book-knap, .guide-button, .kroelle-button, .kroelle-form-button, .kroelle-course-button, .side-cart-checkout, .product-filter-link, .blog-filter, .produkt-skabelon-size, .mobile-menu-link"
  );

  underlineButtons.forEach((button) => {
    if (button.querySelector(".button-label")) {
      return;
    }

    const hasElementChildren = Array.from(button.childNodes).some((node) => node.nodeType === Node.ELEMENT_NODE);

    if (hasElementChildren) {
      return;
    }

    const label = button.textContent.trim();

    if (!label) {
      return;
    }

    button.textContent = "";

    const labelElement = document.createElement("span");
    labelElement.className = "button-label";
    labelElement.textContent = label;
    button.append(labelElement);
  });
}

prepareButtonUnderlines();

function setupCommunitySignup(formSelector, copySelector, successClass) {
  document.querySelectorAll(formSelector).forEach((form) => {
    const section = form.closest("section");
    const copy = section?.querySelector(copySelector);
    const nameInput = form.querySelector("input[name='name']");
    const emailInput = form.querySelector("input[type='email']");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!nameInput?.value.trim()) {
        nameInput?.focus();
        return;
      }

      if (!emailInput?.value.trim()) {
        emailInput?.focus();
        return;
      }

      if (copy) {
        copy.innerHTML = `
          <p>Velkommen til</p>
          <p>HCM community</p>
        `;
      }

      form.replaceChildren();
      form.classList.add(successClass);
      form.innerHTML = `
        <h3>Tak! Du er nu tilmeldt</h3>
        <p>FÃ¥ 10% rabat pÃ¥ fragt og 10% pÃ¥ din fÃ¸rste ordre - samt early access til nye produkter, eksklusive events, konkurrencer, tilbud og kampagner kun for vores community.</p>
      `;
    });
  });
}

setupCommunitySignup(".blog-newsletter-form", ".blog-newsletter-copy", "blog-newsletter-success");
setupCommunitySignup(".kroelle-form", ".kroelle-signup-copy", "kroelle-signup-success");

const checkoutForm = document.querySelector("[data-checkout-form]");

if (checkoutForm) {
  let productSubtotal = 0;
  let discountAmount = 0;
  let activeDiscountCode = "";
  const checkoutCartItems = checkoutForm.querySelector("[data-checkout-cart-items]");
  const checkoutSubtotal = checkoutForm.querySelector("[data-checkout-subtotal]");
  const discountInput = checkoutForm.querySelector("#checkout-discount-code");
  const discountButton = checkoutForm.querySelector("[data-apply-discount]");
  const discountMessage = checkoutForm.querySelector("[data-discount-message]");
  const discountTotalRow = checkoutForm.querySelector("[data-discount-total-row]");
  const discountTotal = checkoutForm.querySelector("[data-discount-total]");
  const shippingTotal = checkoutForm.querySelector("[data-shipping-total]");
  const orderTotal = checkoutForm.querySelector("[data-order-total]");
  const checkoutError = checkoutForm.querySelector("[data-checkout-error]");
  const commentToggle = checkoutForm.querySelector(".checkout-comment-toggle");
  const commentField = checkoutForm.querySelector(".checkout-comment-field");
  const shippingOptions = Array.from(checkoutForm.querySelectorAll("[name='shipping']"));
  const paymentOptions = Array.from(checkoutForm.querySelectorAll("[name='payment']"));

  function formatDanishCurrency(amount) {
    return `${amount.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr.`;
  }

  function loadCheckoutCartItems() {
    try {
      const storedItems = JSON.parse(localStorage.getItem("hildebrandtMixlyCart"));
      return Array.isArray(storedItems) ? storedItems : [];
    } catch (error) {
      return [];
    }
  }

  function saveCheckoutCartItems(items) {
    try {
      localStorage.setItem("hildebrandtMixlyCart", JSON.stringify(items));
    } catch (error) {
      // Checkouten kan stadig vise kurven, selv hvis localStorage er blokeret.
    }

    document.dispatchEvent(new CustomEvent("hildebrandt-cart-updated"));
  }

  function escapeCheckoutText(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
  }

  function renderCheckoutCartItems() {
    const items = loadCheckoutCartItems().filter((item) => item && Number(item.quantity) > 0);
    productSubtotal = items.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);
    updateCheckoutDiscount();

    if (checkoutSubtotal) {
      checkoutSubtotal.textContent = formatDanishCurrency(productSubtotal);
    }

    if (!checkoutCartItems) {
      updateCheckoutTotals();
      return;
    }

    if (items.length === 0) {
      checkoutCartItems.innerHTML = '<p class="checkout-empty">Din kurv er tom.</p>';
      updateCheckoutTotals();
      return;
    }

    checkoutCartItems.innerHTML = items.map((item) => {
      const name = escapeCheckoutText(item.name || "Mixly produkt");
      const size = escapeCheckoutText(item.size || "");
      const image = escapeCheckoutText(item.image || "");
      const id = escapeCheckoutText(item.id || "");
      const quantity = Number(item.quantity || 0);
      const lineTotal = Number(item.price || 0) * quantity;

      return `
        <div class="checkout-product">
          <div class="checkout-product-image">
            ${image ? `<img src="${image}" alt="${name}">` : "<span>IMG</span>"}
          </div>
          <div class="checkout-product-info">
            <div class="checkout-product-heading">
              <p>${name}</p>
              <button class="checkout-remove" type="button" aria-label="Fjern ${name} fra kurv" data-checkout-cart-action="remove" data-checkout-cart-item-id="${id}">Ã—</button>
            </div>
            ${size ? `<div class="checkout-product-meta"><span>${size}</span></div>` : ""}
            <strong>${formatDanishCurrency(lineTotal)}</strong>
            <div class="checkout-quantity">
              <button type="button" aria-label="Reducer antal af ${name}" data-checkout-cart-action="decrease" data-checkout-cart-item-id="${id}">-</button>
              <span aria-label="Antal">${quantity}</span>
              <button type="button" aria-label="Ã˜g antal af ${name}" data-checkout-cart-action="increase" data-checkout-cart-item-id="${id}">+</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    updateCheckoutTotals();
  }

  function setCheckoutDiscountMessage(message, isError = false) {
    if (!discountMessage) {
      return;
    }

    discountMessage.textContent = message;
    discountMessage.classList.toggle("is-error", isError);
  }

  function updateCheckoutDiscount() {
    discountAmount = activeDiscountCode === "rabat10" ? Math.round(productSubtotal * 0.1) : 0;

    if (discountTotalRow) {
      discountTotalRow.hidden = discountAmount <= 0;
    }

    if (discountTotal) {
      discountTotal.textContent = `-${formatDanishCurrency(discountAmount)}`;
    }
  }

  function updateCheckoutOptionState(options, selectedInput) {
    options.forEach((input) => {
      const option = input.closest(".checkout-option, .checkout-payment-option");

      if (option) {
        option.classList.toggle("is-selected", input.checked && input === selectedInput);
      }
    });
  }

  function allowCheckoutOptionToggle(input, options, afterToggle) {
    const option = input.closest(".checkout-option, .checkout-payment-option");

    option?.addEventListener("pointerdown", () => {
      input.dataset.wasChecked = String(input.checked);
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        input.dataset.wasChecked = String(input.checked);
      }
    });

    option?.addEventListener("click", () => {
      if (input.dataset.wasChecked !== "true") {
        return;
      }

      window.setTimeout(() => {
        input.checked = false;
        updateCheckoutOptionState(options, input);
        afterToggle();
      }, 0);
    });
  }

  function updateCheckoutTotals() {
    const selectedShipping = checkoutForm.querySelector("[name='shipping']:checked");

    if (!selectedShipping) {
      if (shippingTotal) {
        shippingTotal.textContent = "VÃ¦lg levering";
      }

      if (orderTotal) {
        orderTotal.textContent = formatDanishCurrency(Math.max(productSubtotal - discountAmount, 0));
      }

      return;
    }

    const shippingPrice = Number(selectedShipping.value);

    if (shippingTotal) {
      shippingTotal.textContent = shippingPrice === 0 ? "Gratis" : formatDanishCurrency(shippingPrice);
    }

    if (orderTotal) {
      orderTotal.textContent = formatDanishCurrency(Math.max(productSubtotal - discountAmount, 0) + shippingPrice);
    }
  }

  function applyCheckoutDiscount() {
    const code = discountInput?.value.trim().toLowerCase() || "";

    if (!code) {
      activeDiscountCode = "";
      updateCheckoutDiscount();
      updateCheckoutTotals();
      setCheckoutDiscountMessage("");
      return;
    }

    if (code === "rabat10") {
      activeDiscountCode = code;
      updateCheckoutDiscount();
      updateCheckoutTotals();
      setCheckoutDiscountMessage("Rabatkode anvendt: 10% rabat.");
      return;
    }

    activeDiscountCode = "";
    updateCheckoutDiscount();
    updateCheckoutTotals();
    setCheckoutDiscountMessage("Rabatkoden er ikke gyldig.", true);
  }

  shippingOptions.forEach((input) => {
    allowCheckoutOptionToggle(input, shippingOptions, updateCheckoutTotals);
    input.addEventListener("change", () => {
      updateCheckoutOptionState(shippingOptions, input);
      checkoutForm.querySelector("[data-shipping-options]")?.classList.remove("is-invalid");
      updateCheckoutTotals();
    });
  });

  paymentOptions.forEach((input) => {
    allowCheckoutOptionToggle(input, paymentOptions, () => {});
    input.addEventListener("change", () => {
      updateCheckoutOptionState(paymentOptions, input);
      checkoutForm.querySelector("[data-payment-options]")?.classList.remove("is-invalid");
    });
  });

  if (commentToggle && commentField) {
    commentToggle.addEventListener("click", () => {
      const isOpen = commentToggle.getAttribute("aria-expanded") === "true";
      const symbol = commentToggle.querySelector(".checkout-comment-toggle-symbol");

      commentToggle.setAttribute("aria-expanded", String(!isOpen));
      if (symbol) {
        symbol.textContent = isOpen ? "+" : "-";
      }
      commentField.hidden = isOpen;
    });
  }

  discountButton?.addEventListener("click", applyCheckoutDiscount);
  discountInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  });

  checkoutCartItems?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-checkout-cart-action]");

    if (!button) {
      return;
    }

    const id = button.dataset.checkoutCartItemId;
    const action = button.dataset.checkoutCartAction;
    const items = loadCheckoutCartItems();
    const nextItems = items
      .map((item) => {
        if (item.id !== id) {
          return item;
        }

        const quantity = Number(item.quantity || 0);
        const nextQuantity = action === "increase" ? quantity + 1 : quantity - 1;

        if (action === "remove") {
          return { ...item, quantity: 0 };
        }

        return { ...item, quantity: nextQuantity };
      })
      .filter((item) => Number(item.quantity || 0) > 0);

    saveCheckoutCartItems(nextItems);
  });

  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const cartIsEmpty = productSubtotal <= 0;
    const invalidFields = Array.from(checkoutForm.querySelectorAll("[required]")).filter((field) => !field.checkValidity());
    const selectedShipping = checkoutForm.querySelector("[name='shipping']:checked");
    const selectedPayment = checkoutForm.querySelector("[name='payment']:checked");
    const shippingList = checkoutForm.querySelector("[data-shipping-options]");
    const paymentList = checkoutForm.querySelector("[data-payment-options]");

    checkoutForm.querySelectorAll(".is-invalid").forEach((field) => field.classList.remove("is-invalid"));

    invalidFields.forEach((field) => {
      const wrapper = field.closest(".checkout-field, .checkout-terms") || field;
      wrapper.classList.add("is-invalid");
    });

    if (shippingList) {
      shippingList.classList.toggle("is-invalid", !selectedShipping);
    }

    if (paymentList) {
      paymentList.classList.toggle("is-invalid", !selectedPayment);
    }

    if (checkoutError) {
      checkoutError.textContent = invalidFields.length > 0 || !selectedShipping || !selectedPayment || cartIsEmpty
        ? "Udfyld de markerede felter, vÃ¦lg levering og betalingsmetode, accepter vilkÃ¥r og betingelser, og sÃ¸rg for at der er produkter i kurven."
        : "";
    }

    if (cartIsEmpty) {
      checkoutCartItems?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (invalidFields[0]) {
      invalidFields[0].focus();
      return;
    }

    if (!selectedShipping) {
      shippingList?.querySelector("input")?.focus();
      return;
    }

    if (!selectedPayment) {
      paymentList?.querySelector("input")?.focus();
      return;
    }

    if (checkoutError) {
      checkoutError.textContent = "Tak. Checkouten er klar til betaling.";
    }
  });

  renderCheckoutCartItems();
  window.addEventListener("storage", (event) => {
    if (event.key === "hildebrandtMixlyCart") {
      renderCheckoutCartItems();
    }
  });
  document.addEventListener("hildebrandt-cart-updated", renderCheckoutCartItems);
}

function setActiveMainNavigation() {
  const currentPath = window.location.pathname.replace(/\/index\.html$/, "/");
  const isProductPage =
    /\/produkter(?:-[^/]*)?\.html$/.test(currentPath) ||
    currentPath.includes("/products/");
  const isCurlUniversePage =
    /\/(?:kroelleunivers|guides|blog)\.html$/.test(currentPath) ||
    currentPath.includes("/blog/");

  document.querySelectorAll(".menu-link").forEach((link) => {
    const href = link.getAttribute("href");

    if (!href || href === "#") {
      return;
    }

    const linkPath = new URL(href, window.location.href).pathname.replace(/\/index\.html$/, "/");
    const isActive =
      (isProductPage && /\/produkter\.html$/.test(linkPath)) ||
      (isCurlUniversePage && /\/kroelleunivers\.html$/.test(linkPath)) ||
      (!isProductPage && !isCurlUniversePage && currentPath === linkPath);

    link.classList.toggle("menu-link-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else if (link.getAttribute("aria-current") === "page") {
      link.removeAttribute("aria-current");
    }
  });
}

setActiveMainNavigation();

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

// Mobilmenuen styres kun, hvis elementerne findes pÃ¥ siden.
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

const footerAccordionItems = Array.from(document.querySelectorAll(".footer > section, .footer > nav"));
const footerAccordionMedia = window.matchMedia("(max-width: 767px)");
const salonbookUrl = "https://salonbook.one/?henriksencopenhagen#/";

document.querySelectorAll(".footer-booking").forEach((link) => {
  link.href = salonbookUrl;
  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = salonbookUrl;
  });
});

if (footerAccordionItems.length > 0) {
  footerAccordionItems.forEach((item) => {
    const heading = item.querySelector("h2");

    if (!heading) {
      return;
    }

    function toggleFooterItem() {
      if (!footerAccordionMedia.matches) {
        return;
      }

      const isOpen = item.classList.toggle("footer-accordion-open");
      heading.setAttribute("aria-expanded", String(isOpen));
    }

    heading.addEventListener("click", toggleFooterItem);
    heading.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      toggleFooterItem();
    });
  });

  function updateFooterAccordionState() {
    document.body.classList.toggle("has-footer-accordion", footerAccordionMedia.matches);

    footerAccordionItems.forEach((item) => {
      const heading = item.querySelector("h2");

      if (!heading) {
        return;
      }

      if (footerAccordionMedia.matches) {
        heading.setAttribute("role", "button");
        heading.setAttribute("tabindex", "0");
        heading.setAttribute("aria-expanded", String(item.classList.contains("footer-accordion-open")));
        return;
      }

      item.classList.remove("footer-accordion-open");
      heading.removeAttribute("role");
      heading.removeAttribute("tabindex");
      heading.removeAttribute("aria-expanded");
    });
  }

  updateFooterAccordionState();
  footerAccordionMedia.addEventListener("change", updateFooterAccordionState);
}

function updateStickyBooking() {
  if (!mobileBookingMedia.matches) {
    document.body.classList.remove("is-sticky-booking-visible");
    return;
  }

  if (!mobileBookingTrigger) {
    document.body.classList.toggle("is-sticky-booking-visible", window.scrollY > 0);
    return;
  }

  const triggerBounds = mobileBookingTrigger.getBoundingClientRect();
  document.body.classList.toggle("is-sticky-booking-visible", triggerBounds.bottom <= 0);
}

function updateMobileNavPosition() {
  const isFixed = window.scrollY > 0;
  document.body.classList.toggle("is-mobile-nav-fixed", isFixed);
  updateStickyBooking();
}

updateMobileNavPosition();
window.addEventListener("scroll", updateMobileNavPosition, { passive: true });
window.addEventListener("resize", updateMobileNavPosition);

if (typeof mobileBookingMedia.addEventListener === "function") {
  mobileBookingMedia.addEventListener("change", updateMobileNavPosition);
} else {
  mobileBookingMedia.addListener(updateMobileNavPosition);
}

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
    { name: "lÃ¸rdag", weekday: "Sat", open: null, close: null },
    { name: "sÃ¸ndag", weekday: "Sun", open: null, close: null },
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
  statusLabel.textContent = isOpen ? "Ã…BEN NU" : "LUKKET NU";

  if (isOpen) {
    statusDetail.textContent = `Lukker kl. ${formatOpeningTime(today.close)}`;
    return;
  }

  const nextOpening = getNextOpening(schedule, currentDayIndex, currentMinutes);
  statusDetail.textContent = nextOpening ? `Ã…bner igen ${nextOpening.dayLabel} kl. ${nextOpening.time}` : "";
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
const relatedProductCards = document.querySelectorAll(".produkt-skabelon-related-card");
const reviewSlider = document.querySelector("[data-anmeldelser-slider]");
const productSections = Array.from(document.querySelectorAll("[data-product-section]"));
const productFilterLinks = Array.from(document.querySelectorAll("[data-product-filter]"));
const phoneMedia = window.matchMedia("(max-width: 767px)");

function getProductSetGroupLabel(card) {
  const title = card.querySelector("h4")?.textContent.trim() || "";
  const description = card.querySelector(".product-content p")?.textContent.trim() || "";
  const sourceText = `${title} ${description}`;
  const descriptionGroup = description.match(/^(Mists|Shampoo bars|Conditioner bars|Shampooer|Conditioners)/i);

  if (descriptionGroup) {
    return descriptionGroup[0];
  }

  const titleGroups = [
    /Intensive Care for Curly Ends/i,
    /Curly Shampoo Bar Sensitive/i,
    /Curly Conditioner Bars Orange Sensitive/i,
    /Sea Mist Barrier/i,
    /Shampoo/i,
    /Conditioner/i,
  ];

  const match = titleGroups
    .map((pattern) => sourceText.match(pattern))
    .find(Boolean);

  return match ? match[0] : title;
}

function getProductSetSortRank(card) {
  const title = card.querySelector("h4")?.textContent.trim() || "";
  const description = card.querySelector(".product-content p")?.textContent.trim() || "";
  const sourceText = `${title} ${description}`;

  if (/shampoo/i.test(sourceText)) {
    return 1;
  }

  if (/conditioner/i.test(sourceText)) {
    return 2;
  }

  return 3;
}

const productSetCardUpdates = {
  "products/saet/rich-low-intensive-care-for-curly-ends.html": {
    title: "Rich + Low Intensive Care For Curly Ends",
    ariaLabel: "Se Rich + Low Intensive Care For Curly Ends",
    imageAlt: "Rich + Low Intensive Care For Curly Ends",
    size: "80 ml",
  },
  "products/saet/rich-low-curly-conditioner-bars-orange-sensitive.html": {
    title: "Rich + Low Curly Conditioner Bar Orange-Sensitive",
    ariaLabel: "Se Rich + Low Curly Conditioner Bar Orange-Sensitive",
    imageAlt: "Rich + Low Curly Conditioner Bar Orange-Sensitive",
    size: "150 g",
  },
  "products/saet/rich-morning-low-sea-mist-barrier.html": {
    size: "300 ml",
  },
  "products/saet/low-rich-curly-shampoo-bar-sensitive.html": {
    size: "170 g",
  },
  "products/saet/low-rich-shampoo.html": {
    size: "2 Ã— 250 ml",
  },
  "products/saet/rich-low-shampoo.html": {
    title: "Low Refresh + Rich Repair Cleansing Shampoo",
    ariaLabel: "Se Low Refresh + Rich Repair Cleansing Shampoo",
    imageAlt: "Low Refresh + Rich Repair Cleansing Shampoo",
    price: "Fra 209 kr.",
    size: "2 Ã— 100 ml / 2 Ã— 1000 ml",
  },
  "products/saet/low-rich-conditioner.html": {
    title: "Low + Rich Deep Drink Conditioner",
    ariaLabel: "Se Low + Rich Deep Drink Conditioner",
    imageAlt: "Low + Rich Deep Drink Conditioner",
    price: "Fra 299 kr.",
    size: "2 Ã— 200 ml / 2 Ã— 1000 ml",
  },
  "products/saet/low-rich-leave-in-conditioner.html": {
    size: "2 Ã— 150 ml",
  },
  "products/saet/low-refiner-curl-gel-rich-curl-cream.html": {
    size: "2 Ã— 150 ml",
  },
};

const duplicateProductSetLinks = new Set([
  "products/saet/low-rich-deep-drink-conditioner-200.html",
  "products/saet/low-refresh-rich-repair-cleansing-shampoo-1000.html",
]);

const productSetCardOrder = [
  "products/saet/rich-low-intensive-care-for-curly-ends.html",
  "products/saet/rich-low-curly-conditioner-bars-orange-sensitive.html",
  "products/saet/rich-morning-low-sea-mist-barrier.html",
  "products/saet/low-rich-curly-shampoo-bar-sensitive.html",
  "products/saet/low-rich-shampoo.html",
  "products/saet/rich-low-shampoo.html",
  "products/saet/low-rich-conditioner.html",
  "products/saet/low-rich-leave-in-conditioner.html",
  "products/saet/low-refiner-curl-gel-rich-curl-cream.html",
];

const startPackageCardUpdates = {
  "products/startpakker/startpakke-2.html": "6 produkter",
  "products/startpakker/startpakke-3.html": "6 produkter",
};

const productCardSizeUpdates = {
  "products/shampoo/rich-repair-cleansing-shampoo.html": "100 ml / 1000 ml",
  "products/shampoo/low-refresh-cleansing-shampoo.html": "100 ml / 1000 ml",
  "products/shampoo/curly-charcoal-calm-shampoo.html": "50 ml / 200 ml",
  "products/conditioner/rich-deep-drink-conditioner.html": "200 ml / 1000 ml",
  "products/conditioner/mixly-low-conditioner.html": "200 ml / 1000 ml",
  "products/haarmasker/rich-intensive-care-for-curly-ends.html": "30 ml / 50 ml",
  "products/saet/rich-low-shampoo.html": "2 Ã— 100 ml / 2 Ã— 1000 ml",
  "products/saet/low-rich-conditioner.html": "2 Ã— 200 ml / 2 Ã— 1000 ml",
};

function normalizeProductHref(href) {
  return href.replace(/^(\.\.\/)+/, "");
}

function normalizeProductCardSizes() {
  document.querySelectorAll(".product-card").forEach((card) => {
    const titleLink = card.querySelector("h4 a");
    const imageLink = card.querySelector(".product-image a");
    const image = card.querySelector(".product-image img");
    const link = normalizeProductHref(titleLink?.getAttribute("href") || imageLink?.getAttribute("href") || "");
    const contentUpdate = productSetCardUpdates[link];
    const size = productCardSizeUpdates[link] || contentUpdate?.size;
    const metaItems = card.querySelectorAll(".product-meta span");

    if (contentUpdate?.title && titleLink) {
      titleLink.textContent = contentUpdate.title;
    }

    if (contentUpdate?.ariaLabel) {
      titleLink?.setAttribute("aria-label", contentUpdate.ariaLabel);
      imageLink?.setAttribute("aria-label", contentUpdate.ariaLabel);
    }

    if (contentUpdate?.imageAlt && image) {
      image.alt = contentUpdate.imageAlt;
    }

    if (contentUpdate?.price && metaItems[0]) {
      metaItems[0].textContent = contentUpdate.price;
    }

    if (size && metaItems[1]) {
      metaItems[1].textContent = size;
    }
  });
}

function normalizeStartPackageCards() {
  document.querySelectorAll('[data-product-section="startpakker"] .product-card').forEach((card) => {
    const link = card.querySelector("h4 a")?.getAttribute("href") || "";
    const productCount = startPackageCardUpdates[link];
    const metaItems = card.querySelectorAll(".product-meta span");

    if (productCount && metaItems[1]) {
      metaItems[1].textContent = productCount;
    }
  });
}

function normalizeProductSetCard(card) {
  const titleLink = card.querySelector("h4 a");
  const imageLink = card.querySelector(".product-image a");
  const image = card.querySelector(".product-image img");
  const metaItems = card.querySelectorAll(".product-meta span");
  const href = normalizeProductHref(titleLink?.getAttribute("href") || imageLink?.getAttribute("href") || "");
  const update = productSetCardUpdates[href];

  if (!update) {
    return;
  }

  if (update.title && titleLink) {
    titleLink.textContent = update.title;
  }

  if (update.ariaLabel) {
    titleLink?.setAttribute("aria-label", update.ariaLabel);
    imageLink?.setAttribute("aria-label", update.ariaLabel);
  }

  if (update.imageAlt && image) {
    image.alt = update.imageAlt;
  }

  if (update.price && metaItems[0]) {
    metaItems[0].textContent = update.price;
  }

  if (update.size && metaItems[1]) {
    metaItems[1].textContent = update.size;
  }
}

function organizeProductSets() {
  document.querySelectorAll("[data-organize-product-sets]").forEach((row) => {
    Array.from(row.querySelectorAll(".product-card")).forEach(normalizeProductSetCard);

    const cards = Array.from(row.querySelectorAll(".product-card")).filter((card) => {
      const href = card.querySelector("h4 a")?.getAttribute("href") || card.querySelector(".product-image a")?.getAttribute("href") || "";
      return !duplicateProductSetLinks.has(href);
    });

    if (!cards.length || row.dataset.productSetsOrganized === "true") {
      return;
    }

    const sortedCards = cards.sort((firstCard, secondCard) => {
      const firstLink = firstCard.querySelector("h4 a")?.getAttribute("href") || "";
      const secondLink = secondCard.querySelector("h4 a")?.getAttribute("href") || "";
      const firstOrder = productSetCardOrder.indexOf(firstLink);
      const secondOrder = productSetCardOrder.indexOf(secondLink);

      if (firstOrder !== -1 || secondOrder !== -1) {
        return (firstOrder === -1 ? Number.MAX_SAFE_INTEGER : firstOrder) - (secondOrder === -1 ? Number.MAX_SAFE_INTEGER : secondOrder);
      }

      const firstRank = getProductSetSortRank(firstCard);
      const secondRank = getProductSetSortRank(secondCard);

      if (firstRank !== secondRank) {
        return firstRank - secondRank;
      }

      const firstLabel = getProductSetGroupLabel(firstCard);
      const secondLabel = getProductSetGroupLabel(secondCard);

      return firstLabel.localeCompare(secondLabel, "da");
    });

    row.replaceChildren(...sortedCards);

    row.dataset.productSetsOrganized = "true";
  });
}

function setProductFilter(filter) {
  productSections.forEach((section) => {
    const isVisible = filter === "all" || section.dataset.productSection === filter;
    section.hidden = !isVisible;
  });

  productFilterLinks.forEach((link) => {
    const isActive = link.dataset.productFilter === filter;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function centerActiveProductFilter() {
  const filterBar = document.querySelector(".product-filter");
  const activeFilter = filterBar?.querySelector(".product-filter-link.is-active");
  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  if (!filterBar || !activeFilter || !isMobile) {
    return;
  }

  const targetLeft = activeFilter.offsetLeft - (filterBar.clientWidth - activeFilter.offsetWidth) / 2;

  filterBar.scrollTo({
    left: Math.max(0, targetLeft),
    behavior: "smooth",
  });
}

normalizeStartPackageCards();
normalizeProductCardSizes();
organizeProductSets();

if (productSections.length) {
  setProductFilter(document.body.dataset.productPageFilter || "all");
  window.setTimeout(centerActiveProductFilter, 0);
  window.addEventListener("resize", centerActiveProductFilter);
  productFilterLinks.forEach((link) => {
    link.addEventListener("click", () => {
      window.setTimeout(centerActiveProductFilter, 0);
    });
  });
}

function getCardTitle(card) {
  return card.querySelector("h4, h3")?.textContent.trim() || "Mixly produkt";
}

function getCardDescription(card) {
  return card.querySelector(".product-content p")?.textContent.trim() ||
    card.querySelector(".produkt-skabelon-related-card > a > p")?.textContent.trim() ||
    card.querySelector("p")?.textContent.trim() ||
    "";
}

function getCardImage(card) {
  return card.querySelector(".product-image img, .produkt-skabelon-related-image img");
}

function getCardLink(card) {
  return card.querySelector("h4 a, h3 a, .produkt-skabelon-related-card > a, a")?.getAttribute("href") || "#";
}

function getCardImageFrame(card) {
  return card.querySelector(".product-image, .produkt-skabelon-related-image");
}

function getInterfaceIconUrl(iconName) {
  const cartIcon = document.querySelector(".top-nav-icon-cart")?.getAttribute("src") || "img/ikoner/kurv.svg";
  return cartIcon.replace(/kurv\.svg$/i, `${iconName}.svg`);
}

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
  const alwaysShow = Boolean(options.alwaysShow);
  const indicators = row.nextElementSibling;

  if (!indicators || !indicators.classList.contains("slider-indicators")) {
    return;
  }

  function updateIndicators() {
    const maxScroll = row.scrollWidth - row.clientWidth;

    if (maxScroll <= 1 && !alwaysShow) {
      indicators.classList.add("is-hidden");
      indicators.replaceChildren();
      return;
    }

    indicators.classList.remove("is-hidden");

    const card = row.querySelector(itemSelector);
    const cardWidth = card ? card.getBoundingClientRect().width : row.clientWidth;
    const visibleCards = Math.max(1, Math.floor(row.clientWidth / cardWidth));
    const totalCards = row.querySelectorAll(itemSelector).length;
    const pages = maxScroll <= 1 ? 1 : Math.max(2, totalCards - visibleCards + 1);

    if (indicators.children.length !== pages) {
      indicators.replaceChildren();

      for (let index = 0; index < pages; index += 1) {
        const indicator = document.createElement("button");
        indicator.className = "indicator";
        indicator.type = "button";
        indicator.setAttribute("aria-label", `GÃ¥ til ${label} ${index + 1}`);

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

    const activeIndex = maxScroll <= 1 ? 0 : Math.round((row.scrollLeft / maxScroll) * (pages - 1));

    Array.from(indicators.children).forEach((indicator, index) => {
      const isActive = index === activeIndex;
      indicator.classList.toggle("active", isActive);
      indicator.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  updateIndicators();
  row.addEventListener("scroll", updateIndicators, { passive: true });
  window.addEventListener("resize", updateIndicators);
  row.closest("details")?.addEventListener("toggle", updateIndicators);
}

productRows.forEach((row) => {
  setupSliderIndicators(row, {
    itemSelector: ".product-card, .product-promo-card",
    label: "produktgruppe",
    alwaysShow: document.body.dataset.productPageFilter === "all",
  });
});

document.querySelectorAll("[data-package-products-row]").forEach((row) => {
  setupSliderIndicators(row, {
    itemSelector: ".produkt-skabelon-package-card",
    label: "produkt i pakken",
  });
});

treatmentRows.forEach((row) => {
  setupSliderIndicators(row, {
    itemSelector: ".forside-behandling-kort",
    label: "behandling",
  });
});

productCards.forEach((card) => {
  const image = getCardImageFrame(card);
  const content = card.querySelector(".product-content");

  if (!image || !content || card.querySelector(".product-add-button")) {
    return;
  }

  const productLink = card.querySelector("h4 a");
  const productImage = getCardImage(card);

  if (productLink && productImage && !productImage.closest("a")) {
    const imageLink = document.createElement("a");
    imageLink.href = productLink.getAttribute("href");
    imageLink.setAttribute("aria-label", `Se ${productLink.textContent.trim()}`);
    productImage.before(imageLink);
    imageLink.appendChild(productImage);
  }

  const addButton = document.createElement("button");
  addButton.className = "product-add-button";
  addButton.type = "button";
  addButton.setAttribute("aria-label", "TilfÃ¸j til kurv");

  const addButtonText = document.createElement("span");
  addButtonText.className = "product-add-button-text";
  addButtonText.textContent = "TilfÃ¸j til kurv";

  const addButtonIcon = document.createElement("img");
  addButtonIcon.className = "product-add-button-icon";
  addButtonIcon.src = getInterfaceIconUrl("kurv");
  addButtonIcon.alt = "";
  addButtonIcon.setAttribute("aria-hidden", "true");

  addButton.append(addButtonText, addButtonIcon);
  if (!phoneMedia.matches) {
    content.append(addButton);
  } else {
    image.append(addButton);
  }
});

relatedProductCards.forEach((card) => {
  const image = getCardImageFrame(card);

  if (!image || image.querySelector(".product-add-button")) {
    return;
  }

  const addButton = document.createElement("button");
  addButton.className = "product-add-button";
  addButton.type = "button";
  addButton.setAttribute("aria-label", "TilfÃ¸j til kurv");

  const addButtonText = document.createElement("span");
  addButtonText.className = "product-add-button-text";
  addButtonText.textContent = "TilfÃ¸j til kurv";

  const addButtonIcon = document.createElement("img");
  addButtonIcon.className = "product-add-button-icon";
  addButtonIcon.src = getInterfaceIconUrl("kurv");
  addButtonIcon.alt = "";
  addButtonIcon.setAttribute("aria-hidden", "true");

  addButton.append(addButtonText, addButtonIcon);
  image.append(addButton);
});

function syncProductCardAddButtonPlacement() {
  productCards.forEach((card) => {
    const image = getCardImageFrame(card);
    const content = card.querySelector(".product-content");
    const addButton = card.querySelector(".product-add-button");

    if (!image || !content || !addButton) {
      return;
    }

    if (phoneMedia.matches) {
      image.append(addButton);
      return;
    }

    content.append(addButton);
  });

  relatedProductCards.forEach((card) => {
    const image = getCardImageFrame(card);
    const addButton = card.querySelector(".product-add-button");

    if (image && addButton) {
      image.append(addButton);
    }
  });
}

syncProductCardAddButtonPlacement();

if (typeof phoneMedia.addEventListener === "function") {
  phoneMedia.addEventListener("change", syncProductCardAddButtonPlacement);
} else {
  phoneMedia.addListener(syncProductCardAddButtonPlacement);
}

const cartStorageKey = "hildebrandtMixlyCart";
let cartItems = loadCartItems();
let cartDrawer = null;
let lastCartTrigger = null;
let lastAddedCartItem = null;

const quickAddCatalog = {
  "rich repair cleansing shampoo": {
    tags: ["Ã˜kologisk", "Vegansk", "Parfumefri", "Unisex"],
    description:
      "Giver mere nÃ¦ring og ro til krÃ¸ller, der fÃ¸les tÃ¸rre, frizzede eller medtagne.",
    sizes: [
      { label: "100 ml", price: "110 kr.", image: "img/produktbilleder/MIXLY-Rich-Repair-Shampoo-100.png" },
      { label: "1000 ml", price: "379 kr.", image: "img/produktbilleder/MIXLY-Rich-Repair-Shampoo-1000ml.png" },
    ],
    detailsImage: "img/ingredienser/ingredienser-Rich-Repair-Shampoo-1000ml.png",
    fullLink: "products/shampoo/rich-repair-cleansing-shampoo.html",
    guide: [
      ["Brug", "Fordel i vÃ¥dt hÃ¥r, massÃ©r og skyl grundigt."],
      ["God til", "TÃ¸rre, krusede eller medtagne krÃ¸ller."],
      ["Effekt", "Mere nÃ¦ring, styrke og mindre frizz."],
    ],
  },
  "rich shampoo": {
    tags: ["Ã˜kologisk", "Vegansk", "Parfumefri", "Unisex"],
    description:
      "Giver mere nÃ¦ring og ro til krÃ¸ller, der fÃ¸les tÃ¸rre, frizzede eller medtagne.",
    sizes: [
      { label: "250 ml", price: "299 kr.", image: "img/produktbilleder/Rich-Shampoo-1.png" },
    ],
    detailsImage: "img/ingredienser/ingredienser-Rich-Repair-Shampoo-1000ml.png",
    fullLink: "products/shampoo/rich-shampoo.html",
    guide: [
      ["Brug", "Fordel i vÃ¥dt hÃ¥r, massÃ©r og skyl grundigt."],
      ["God til", "TÃ¸rre, krusede eller medtagne krÃ¸ller."],
      ["Effekt", "Mere nÃ¦ring, styrke og mindre frizz."],
    ],
  },
  "low refresh cleansing shampoo": {
    tags: ["Ã˜kologisk", "Vegansk", "Parfumefri", "Unisex"],
    description:
      "Renser skÃ¥nsomt og hjÃ¦lper krÃ¸ller med at bevare fugt, lethed og spÃ¦ndstighed.",
    sizes: [
      { label: "100 ml", price: "110 kr.", image: "img/produktbilleder/MIXLY-Low-Refresh-Shampoo-100.png" },
      { label: "1000 ml", price: "379 kr.", image: "img/produktbilleder/MIXLY-Low-Refresh-Shampoo-1000.png" },
    ],
    detailsImage: "img/ingredienser/ingredienser-MIXLY-Low-Refresh-Shampoo-100.png",
    fullLink: "products/shampoo/low-refresh-cleansing-shampoo.html",
    guide: [
      ["Brug", "MassÃ©r i vÃ¥dt hÃ¥r og skyl grundigt."],
      ["God til", "Fint hÃ¥r, bÃ¸lger og krÃ¸ller der let tynges."],
      ["Effekt", "Renser let og bevarer bevÃ¦gelse."],
    ],
  },
  "low conditioner": {
    tags: ["Ã˜kologisk", "Vegansk", "Parfumefri", "Unisex"],
    description:
      "Let conditioner, der hjÃ¦lper krÃ¸ller med styrke og bevÃ¦gelse uden at tynge.",
    sizes: [
      { label: "200 ml", price: "159 kr.", image: "img/produktbilleder/Low-Conditioner-1.png", link: "products/conditioner/mixly-low-conditioner.html" },
      { label: "1000 ml", price: "399 kr.", image: "img/produktbilleder/MIXLY-Low-Conditioner-1000.png", link: "products/conditioner/mixly-low-conditioner.html" },
    ],
    detailsImage: "img/ingredienser/Ingrediens-Low-Conditioner-1000.png",
    fullLink: "products/conditioner/mixly-low-conditioner.html",
    guide: [
      ["Brug", "Fordel i nyvasket, vÃ¥dt hÃ¥r og skyl grundigt."],
      ["God til", "Fine krÃ¸ller, bÃ¸lger eller hÃ¥r der let bliver tynget."],
      ["Effekt", "Fugt, styrke og naturlig lethed."],
    ],
  },
  "rich deep drink conditioner": {
    tags: ["Ã˜kologisk", "Vegansk", "Parfumefri", "Unisex"],
    description:
      "Conditioner med intens fugt, der hjÃ¦lper tÃ¸rre krÃ¸ller med mere blÃ¸dhed og ro.",
    sizes: [
      { label: "200 ml", price: "159 kr.", image: "img/produktbilleder/MIXLY-Rich-Deep-Drink-Conditioner-200.png" },
      { label: "1000 ml", price: "399 kr.", image: "img/produktbilleder/MIXLY-Rich-Deep-Drink-Conditioner-1000.png" },
    ],
    detailsImage: "img/ingredienser/ingredienser-Rich-Deep-Drink-Conditioner-1000.png",
    fullLink: "products/conditioner/rich-deep-drink-conditioner.html",
    guide: [
      ["Brug", "Fordel i lÃ¦ngderne efter shampoo og skyl."],
      ["God til", "TÃ¸rre krÃ¸ller der mangler fugt og ro."],
      ["Effekt", "BlÃ¸dhed, glans og mindre frizz."],
    ],
  },
  "low curly jojoba quench oil 30 ml": {
    tags: ["Ã˜kologisk", "Vegansk", "Parfumefri", "Unisex"],
    description:
      "Let olie, der giver glans, blÃ¸dhed og beskyttelse uden at tynge fine krÃ¸ller og bÃ¸lger.",
    sizes: [
      { label: "30 ml", price: "159 kr.", link: "products/styling/low-curly-jojoba-quench-oil.html" },
    ],
    fullLink: "products/styling/low-curly-jojoba-quench-oil.html",
    guide: [
      ["Brug", "Fordel fÃ¥ drÃ¥ber i lÃ¦ngder og spidser."],
      ["God til", "Fine krÃ¸ller og bÃ¸lger, der Ã¸nsker en lettere olieoplevelse."],
      ["Effekt", "Glans, blÃ¸dhed, beskyttelse og mindre frizz."],
    ],
  },
};

function parsePrice(priceText) {
  const match = String(priceText || "").replace(/\./g, "").match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function formatPrice(amount) {
  return `${amount.toLocaleString("da-DK")} kr.`;
}

function formatDisplayPrice(priceText) {
  return String(priceText || "")
    .replace(/(\d[\d.]*)\s*,00\s*kr\.?/gi, "$1 kr.")
    .replace(/(\d[\d.]*)\s*kr(?![.\w])/gi, "$1 kr.");
}

function normalizeDisplayedPrices(scope = document) {
  scope.querySelectorAll(".produkt-skabelon-price, [data-product-page-price], .product-meta span:first-child").forEach((item) => {
    item.textContent = formatDisplayPrice(item.textContent);
  });
}

function getAbsoluteAssetUrl(src) {
  if (!src) {
    return "";
  }

  return new URL(src, window.location.href).href;
}

function loadCartItems() {
  try {
    const storedItems = JSON.parse(localStorage.getItem(cartStorageKey));
    return Array.isArray(storedItems) ? storedItems : [];
  } catch (error) {
    return [];
  }
}

function saveCartItems() {
  try {
    localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
  } catch (error) {
    // Kurven virker stadig pÃ¥ siden, selv hvis localStorage er blokeret.
  }

  document.dispatchEvent(new CustomEvent("hildebrandt-cart-updated"));
}

function getCartCount() {
  return cartItems.reduce((count, item) => count + item.quantity, 0);
}

function getCartTotal() {
  return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
}

function getCartItemId(product) {
  return `${normalizeProductTitle(product.name)}::${normalizeProductTitle(product.size || "standard")}`;
}

function updateCartBadges() {
  const count = getCartCount();

  document.querySelectorAll(".top-nav-link-cart").forEach((cartLink) => {
    let badge = cartLink.querySelector(".cart-badge");

    if (!badge && count > 0) {
      badge = document.createElement("span");
      badge.className = "cart-badge";
      badge.setAttribute("aria-live", "polite");
      cartLink.appendChild(badge);
    }

    if (!badge) {
      return;
    }

    badge.textContent = String(count);
    badge.hidden = count === 0;
    cartLink.setAttribute("aria-label", count > 0 ? `Kurv, ${count} produkter` : "Kurv");
  });
}

function addToCart(product, options = {}) {
  const id = getCartItemId(product);
  const existingItemIndex = cartItems.findIndex((item) => item.id === id);
  const existingItem = cartItems[existingItemIndex];

  if (existingItem) {
    existingItem.quantity += 1;
    cartItems.splice(existingItemIndex, 1);
    cartItems.unshift(existingItem);
  } else {
    cartItems.unshift({
      id,
      name: product.name,
      size: product.size || "",
      price: product.price,
      image: product.image || "",
      quantity: 1,
    });
  }

  lastAddedCartItem = {
    name: product.name,
    size: product.size || "",
    price: product.price,
  };

  saveCartItems();
  updateCartBadges();
  renderCartDrawer();

  if (options.openDrawer !== false) {
    openCartDrawer();
  }
}

function updateCartItemQuantity(id, quantity) {
  if (quantity <= 0) {
    cartItems = cartItems.filter((item) => item.id !== id);
  } else {
    cartItems = cartItems.map((item) => (item.id === id ? { ...item, quantity } : item));
  }

  saveCartItems();
  updateCartBadges();
  renderCartDrawer();
}

function escapeCartText(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function getProductFromCard(card) {
  const title = getCardTitle(card);
  const catalogData = quickAddCatalog[normalizeProductTitle(title)];
  const defaultSizeIndex = catalogData?.sizes ? Math.max(getDefaultProductSizeIndex(catalogData.sizes), 0) : 0;
  const defaultSize = catalogData?.sizes?.[defaultSizeIndex];
  const meta = Array.from(card.querySelectorAll(".product-meta span")).map((item) => item.textContent.trim());
  const relatedPrice = card.classList.contains("produkt-skabelon-related-card") ? card.querySelector("p")?.textContent.trim() : "";
  const image = defaultSize?.image || getCardImage(card)?.getAttribute("src") || "";

  return {
    name: title,
    size: defaultSize?.label || meta[1] || "",
    price: parsePrice(defaultSize?.price || meta[0] || relatedPrice),
    image: getAbsoluteAssetUrl(image),
  };
}

function cardMayHaveMultipleSizes(card, sizes = []) {
  const meta = Array.from(card.querySelectorAll(".product-meta span")).map((item) => item.textContent.trim());
  return sizes.length > 1 || /^fra\b/i.test(meta[0] || "") || (meta[1] || "").includes("/");
}

function getProductFromCardVariant(card, variant) {
  const title = getCardTitle(card);
  const image = variant?.image || getCardImage(card)?.getAttribute("src") || "";

  return {
    name: title,
    size: variant?.label || "",
    price: parsePrice(variant?.price),
    image: getAbsoluteAssetUrl(image),
  };
}

function getProductFromPage() {
  const title = document.querySelector("#produkt-skabelon-title")?.textContent.trim() || document.title.replace(" - Hildebrandt Copenhagen", "").trim();
  const checkedSize = document.querySelector(".produkt-skabelon-size input:checked");
  const activeSize = document.querySelector(".produkt-skabelon-size-active") || document.querySelector(".produkt-skabelon-size[aria-pressed='true']") || checkedSize?.closest(".produkt-skabelon-size");
  const fallbackSize = Array.from(document.querySelectorAll(".produkt-skabelon-spec-row")).find((row) => row.querySelector("dt")?.textContent.trim().toLowerCase() === "stÃ¸rrelse")?.querySelector("dd")?.textContent.trim();
  const price = document.querySelector("[data-product-page-price]") || document.querySelector(".produkt-skabelon-price");
  const image = document.querySelector(".produkt-skabelon-image-hero img")?.getAttribute("src") || "";

  return {
    name: title,
    size: activeSize?.textContent.trim() || activeSize?.querySelector("input")?.value || fallbackSize || "",
    price: parsePrice(price?.textContent),
    image: getAbsoluteAssetUrl(image),
  };
}

function createCartDrawer() {
  const drawer = document.createElement("div");
  drawer.className = "side-cart";
  drawer.setAttribute("aria-hidden", "true");
  drawer.innerHTML = `
    <div class="side-cart-backdrop" data-cart-close></div>
    <aside class="side-cart-panel" role="dialog" aria-modal="true" aria-labelledby="side-cart-title" tabindex="-1">
      <header class="side-cart-header">
        <h2 id="side-cart-title">Din kurv</h2>
        <button class="side-cart-close" type="button" aria-label="Luk kurv" data-cart-close>Ã—</button>
      </header>
      <div class="side-cart-body" data-cart-body></div>
      <div class="side-cart-footer" data-cart-footer></div>
    </aside>
  `;

  drawer.addEventListener("click", (event) => {
    if (event.target.closest("[data-cart-close]")) {
      closeCartDrawer();
      return;
    }

    const actionButton = event.target.closest("[data-cart-action]");

    if (!actionButton) {
      return;
    }

    const id = actionButton.dataset.cartItemId;
    const item = cartItems.find((cartItem) => cartItem.id === id);

    if (!item && actionButton.dataset.cartAction !== "remove") {
      return;
    }

    if (actionButton.dataset.cartAction === "increase") {
      updateCartItemQuantity(id, item.quantity + 1);
    }

    if (actionButton.dataset.cartAction === "decrease") {
      updateCartItemQuantity(id, item.quantity - 1);
    }

    if (actionButton.dataset.cartAction === "remove") {
      updateCartItemQuantity(id, 0);
    }
  });

  drawer.addEventListener("submit", (event) => {
    if (event.target.closest(".side-cart-discount")) {
      event.preventDefault();
      // TODO: Tilslut rabatkode-validering, nÃ¥r checkout/betalingssystemet findes.
    }
  });

  document.body.appendChild(drawer);
  return drawer;
}

function renderCartDrawer() {
  const drawer = cartDrawer || createCartDrawer();
  cartDrawer = drawer;

  const body = drawer.querySelector("[data-cart-body]");
  const footer = drawer.querySelector("[data-cart-footer]");

  if (cartItems.length === 0) {
    body.innerHTML = `
      <div class="side-cart-empty">
        <h3>Din kurv er tom</h3>
        <p>TilfÃ¸j nogle Mixly produkter!</p>
      </div>
    `;
    footer.replaceChildren();
    footer.hidden = true;
    return;
  }

  footer.hidden = false;
  body.innerHTML = `
    ${lastAddedCartItem ? `
      <div class="side-cart-added" role="status" aria-live="polite">
        <p class="side-cart-added-title">✓ Produkt tilføjet til kurven</p>
        <p>${escapeCartText(lastAddedCartItem.name)}</p>
        ${lastAddedCartItem.size ? `<p>${escapeCartText(lastAddedCartItem.size)}</p>` : ""}
        <p>${formatPrice(lastAddedCartItem.price)}</p>
      </div>
    ` : ""}
    <ul class="side-cart-list">
      ${cartItems.map((item) => {
        const name = escapeCartText(item.name);
        const size = escapeCartText(item.size);
        const id = escapeCartText(item.id);
        const image = escapeCartText(item.image);

        return `
          <li class="side-cart-item">
            <div class="side-cart-item-image">${image ? `<img src="${image}" alt="${name}">` : ""}</div>
            <div class="side-cart-item-content">
              <div class="side-cart-item-heading">
                <h3>${name}</h3>
                <button class="side-cart-remove" type="button" aria-label="Fjern ${name} fra kurv" data-cart-action="remove" data-cart-item-id="${id}">Ã—</button>
              </div>
              <p class="side-cart-item-size">${size}</p>
              <p class="side-cart-item-price">${formatPrice(item.price)}/stk</p>
              <div class="side-cart-quantity">
                <button type="button" aria-label="Reducer antal af ${name}" data-cart-action="decrease" data-cart-item-id="${id}">âˆ’</button>
                <span aria-label="Antal">${item.quantity}</span>
                <button type="button" aria-label="Ã˜g antal af ${name}" data-cart-action="increase" data-cart-item-id="${id}">+</button>
              </div>
            </div>
          </li>
        `;
      }).join("")}
    </ul>
  `;

  footer.innerHTML = `
    <form class="side-cart-discount" aria-label="Rabatkupon">
      <label for="side-cart-discount-code">Rabatkupon</label>
      <div class="side-cart-discount-row">
        <input id="side-cart-discount-code" type="text" name="discount-code" autocomplete="off" placeholder="Indtast kode">
        <button type="submit" aria-label="Anvend rabatkupon">Anvend</button>
      </div>
    </form>
    <div class="side-cart-total">
      <span>I alt</span>
      <strong>${formatPrice(getCartTotal())}</strong>
    </div>
    <a class="side-cart-checkout" href="checkout.html" aria-label="GÃ¥ til kassen">GÃ¥ til kassen</a>
    <p>Fri fragt over 1000 kr. Â· 1-2 hverdages levering</p>
  `;
}

function openCartDrawer() {
  const drawer = cartDrawer || createCartDrawer();
  cartDrawer = drawer;
  lastCartTrigger = document.activeElement;
  renderCartDrawer();
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-cart-open");

  window.setTimeout(() => {
    drawer.querySelector(".side-cart-panel")?.focus();
  }, 0);
}

function closeCartDrawer() {
  if (!cartDrawer || !cartDrawer.classList.contains("is-open")) {
    return;
  }

  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-cart-open");
  lastAddedCartItem = null;

  if (lastCartTrigger && typeof lastCartTrigger.focus === "function") {
    lastCartTrigger.focus();
  }
}

document.addEventListener("keydown", (event) => {
  if (!cartDrawer || !cartDrawer.classList.contains("is-open")) {
    return;
  }

  if (event.key === "Escape") {
    closeCartDrawer();
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusable = Array.from(
    cartDrawer.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])")
  ).filter((item) => item.offsetParent !== null);

  if (!focusable.length) {
    event.preventDefault();
    cartDrawer.querySelector(".side-cart-panel")?.focus();
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

const productDetailsImageBySize = {
  "rich repair cleansing shampoo": {
    "1000 ml": "../../img/ingredienser/ingredienser-Rich-Repair-Shampoo-1000ml.png",
  },
  "low refresh cleansing shampoo": {
    "100 ml": "../../img/ingredienser/ingredienser-MIXLY-Low-Refresh-Shampoo-100.png",
  },
  "low conditioner": {
    "1000 ml": "../../img/ingredienser/Ingrediens-Low-Conditioner-1000.png",
  },
  "rich deep drink conditioner": {
    "1000 ml": "../../img/ingredienser/ingredienser-Rich-Deep-Drink-Conditioner-1000.png",
  },
  "curly charcoal calm shampoo": {
    "200 ml": "../../img/ingredienser/ingredienser-Mixly-Curly-Charcoal-Calm-200-ml.-2.png",
  },
  "rich + low shampoo": {
    "2 x 100 ml": "../../img/ingredienser/sets/ingredienser-Rich-Repair-Low-Refresh-Shampoo-100-Saet.png",
    "2 x 1000 ml": "../../img/ingredienser/sets/ingredienser-Low-Rich-Shampoo-1000.png",
  },
  "low refresh + rich repair cleansing shampoo": {
    "2 x 100 ml": "../../img/ingredienser/sets/ingredienser-Rich-Repair-Low-Refresh-Shampoo-100-Saet.png",
    "2 x 1000 ml": "../../img/ingredienser/sets/ingredienser-Low-Rich-Shampoo-1000.png",
  },
  "low + rich conditioner": {
    "2 x 200 ml": "../../img/ingredienser/sets/ingredienser-Low-Rich-Deep-Drink-Conditioner-200-Saet-a.png",
    "2 x 1000 ml": "../../img/ingredienser/sets/ingredienser-Low-Rich-Conditioner-1000-Set.png",
  },
  "low + rich deep drink conditioner": {
    "2 x 200 ml": "../../img/ingredienser/sets/ingredienser-Low-Rich-Deep-Drink-Conditioner-200-Saet-a.png",
    "2 x 1000 ml": "../../img/ingredienser/sets/ingredienser-Low-Rich-Conditioner-1000-Set.png",
  },
};

const productInfoBySize = {
  "curly charcoal calm shampoo": {
    "50 ml": { weight: "0,050 kg", dimensions: "11 cm", amount: "50 ml", shelfLife: "12 mÃ¥neder efter Ã¥bning", sku: "MCCC50" },
    "200 ml": { weight: "0,200 kg", dimensions: "18 cm", amount: "200 ml", shelfLife: "12 mÃ¥neder efter Ã¥bning", sku: "MCCC200" },
  },
  "low refresh cleansing shampoo": {
    "100 ml": { weight: "0,1 kg", amount: "100 ml", shelfLife: "12 mÃ¥neder efter Ã¥bning", sku: "Afventer varenummer" },
    "1000 ml": { weight: "1 kg", amount: "1000 ml", shelfLife: "12 mÃ¥neder efter Ã¥bning", sku: "Afventer varenummer" },
  },
  "rich repair cleansing shampoo": {
    "100 ml": { weight: "0,1 kg", amount: "100 ml", shelfLife: "12 mÃ¥neder efter Ã¥bning", sku: "RRCS100" },
    "1000 ml": { weight: "6 kg", amount: "1000 ml", shelfLife: "12 mÃ¥neder efter Ã¥bning", sku: "RRCS1000" },
  },
  "mixly low conditioner": {
    "200 ml": { weight: "0,2 kg", amount: "200 ml", shelfLife: "6 mÃ¥neder efter Ã¥bning", sku: "LC200" },
    "1000 ml": { weight: "1 kg", amount: "1000 ml", shelfLife: "12 mÃ¥neder efter Ã¥bning", sku: "LC1000" },
  },
  "rich deep drink conditioner": {
    "200 ml": { weight: "0,2 kg", amount: "200 ml", shelfLife: "12 mÃ¥neder efter Ã¥bning", sku: "RDDC200" },
    "1000 ml": { weight: "1 kg", amount: "1000 ml", shelfLife: "12 mÃ¥neder efter Ã¥bning", sku: "RDDC1000" },
  },
  "low refresh + rich repair cleansing shampoo": {
    "2 x 100 ml": { weight: "0,2 kg", amount: "2 Ã— 100 ml", shelfLife: "12 mÃ¥neder", sku: "LRCS-RRCS-200" },
    "2 x 1000 ml": { weight: "2 kg", amount: "2 Ã— 1000 ml", shelfLife: "12 mÃ¥neder", sku: "LRCS-RRCS-2000" },
  },
  "low + rich deep drink conditioner": {
    "2 x 200 ml": { weight: "0,4 kg", amount: "2 Ã— 200 ml", shelfLife: "12 mÃ¥neder", sku: "LC-RDDC-400" },
    "2 x 1000 ml": { weight: "2 kg", amount: "2 Ã— 1000 ml", shelfLife: "12 mÃ¥neder", sku: "LC-RDDC-2000" },
  },
};

function getProductPageTitle() {
  return document.querySelector("#produkt-skabelon-title")?.textContent.trim() || "";
}

function normalizeProductSizeLabel(label) {
  return String(label || "").trim().replace(/\s*[Ã—x]\s*/gi, " x ").replace(/\s+/g, " ").toLowerCase();
}

function getProductSizeVolume(label) {
  const matches = String(label || "").matchAll(/(?:(\d+)\s*x\s*)?(\d+(?:[.,]\d+)?)\s*(ml|g|gr)\b/gi);
  let volume = 0;

  for (const match of matches) {
    const count = match[1] ? Number(match[1]) : 1;
    const amount = Number(match[2].replace(",", "."));
    const unit = match[3].toLowerCase();
    const normalizedAmount = unit === "ml" ? amount : amount / 1000;
    volume = Math.max(volume, count * normalizedAmount);
  }

  return volume;
}

function getDefaultProductSizeButton(buttons) {
  return Array.from(buttons).reduce((bestButton, button) => {
    if (!bestButton) {
      return button;
    }

    const bestVolume = getProductSizeVolume(bestButton.textContent);
    const buttonVolume = getProductSizeVolume(button.textContent);

    return buttonVolume >= bestVolume ? button : bestButton;
  }, null);
}

function getProductDetailsImageForSize(title, label) {
  const productMap = productDetailsImageBySize[normalizeProductTitle(title)] || {};
  const normalizedLabel = normalizeProductSizeLabel(label);
  const matchingKey = Object.keys(productMap).find((key) => normalizeProductSizeLabel(key) === normalizedLabel);
  return productMap[matchingKey] || "";
}

function getProductInfoForSize(title, label) {
  const productMap = productInfoBySize[normalizeProductTitle(title)] || {};
  return productMap[normalizeProductSizeLabel(label)] || null;
}

function setProductInfoRowValue(labelMatchers, value) {
  if (!value) {
    return;
  }

  const rows = Array.from(document.querySelectorAll(".produkt-skabelon-product-info .produkt-skabelon-info-row"));
  const row = rows.find((item) => {
    const label = item.querySelector(".produkt-skabelon-info-label")?.textContent.trim().toUpperCase() || "";
    return labelMatchers.some((matcher) => label.includes(matcher));
  });

  const valueElement = row?.querySelector(".produkt-skabelon-info-value");
  if (valueElement) {
    valueElement.textContent = value;
  }
}

function updateProductInfoForSize(title, label) {
  const info = getProductInfoForSize(title, label);

  if (!info) {
    return;
  }

  setProductInfoRowValue(["VARENUMMER"], info.sku);
  setProductInfoRowValue(["SAMLET MÃ†NGDE", "MÃ†NGDE"], info.amount);
  setProductInfoRowValue(["VÃ†GT"], info.weight);
  setProductInfoRowValue(["HOLDBARHED"], info.shelfLife);
  setProductInfoRowValue(["STÃ˜RRELSE"], info.dimensions);
}

function getSetVariantForSize(title, label) {
  const normalizedTitle = normalizeProductTitle(title);
  const normalizedLabel = normalizeProductSizeLabel(label);
  const exactKey = `${normalizedTitle} - ${normalizedLabel}`;

  if (mixlySetPageUpgrades[exactKey]) {
    return mixlySetPageUpgrades[exactKey];
  }

  if (normalizedTitle === "low refresh + rich repair cleansing shampoo" && normalizedLabel === "2 x 100 ml") {
    return mixlySetPageUpgrades[normalizedTitle];
  }

  return null;
}

function getDefaultProductSizeIndex(sizes) {
  return sizes.reduce((bestIndex, size, index) => {
    if (bestIndex < 0) {
      return index;
    }

    const bestVolume = getProductSizeVolume(sizes[bestIndex]?.label);
    const sizeVolume = getProductSizeVolume(size.label);

    return sizeVolume >= bestVolume ? index : bestIndex;
  }, -1);
}

function getProductPageAmountLabel() {
  const rows = Array.from(document.querySelectorAll(".produkt-skabelon-info-row"));
  const amountRow = rows.find((row) => {
    const label = row.querySelector(".produkt-skabelon-info-label")?.textContent.trim().toUpperCase() || "";
    return label.includes("MÃ†NGDE") || label.includes("STÃ˜RRELSE");
  });
  const amountText = amountRow?.querySelector(".produkt-skabelon-info-value")?.textContent.trim() || "";

  return /\d+(?:[.,]\d+)?\s*(?:ml|g|gr)\b/i.test(amountText)
    ? amountText.replace(/\bgr\b/gi, "g")
    : "";
}

function ensureSingleProductSizeButton() {
  const summary = document.querySelector(".produkt-skabelon-summary");
  const price = document.querySelector("[data-product-page-price]");
  const heroImage = document.querySelector(".produkt-skabelon-image-hero img");
  const detailsImage = document.querySelector(".produkt-skabelon-ingredient-image");

  if (!summary || summary.querySelector(".produkt-skabelon-size-group")) {
    return;
  }

  const amountLabel = getProductPageAmountLabel();

  if (!amountLabel) {
    return;
  }

  const fieldset = document.createElement("fieldset");
  fieldset.className = "produkt-skabelon-size-group";
  fieldset.innerHTML = `
    <legend class="produkt-skabelon-size-label">StÃ¸rrelse</legend>
    <div class="produkt-skabelon-size-options"></div>
  `;

  const button = document.createElement("button");
  button.className = "produkt-skabelon-size";
  button.type = "button";
  button.textContent = amountLabel;
    button.dataset.productPrice = price?.textContent.trim() || "";
  button.dataset.productImage = heroImage?.getAttribute("src") || "";
  button.dataset.productDetailsImage = detailsImage?.getAttribute("src") || "";
  fieldset.querySelector(".produkt-skabelon-size-options")?.append(button);
  price?.after(fieldset);
  prepareButtonUnderlines();
}

ensureSingleProductSizeButton();

const mixlySetPageUpgrades = {
  "low refresh + rich repair cleansing shampoo - 2 x 1000 ml": {
    price: "758 kr.",
    intro: "Et fleksibelt shampoosÃ¦t til dig, der vil kunne tilpasse vasken efter hÃ¥rets behov. LOW giver en lettere rens, mens RICH tilfÃ¸rer mere pleje og nÃ¦ring.",
    containsTitle: "SÃ¦ttet indeholder",
    containsLabel: "Produkter i Low Refresh + Rich Repair Cleansing Shampoo 2 x 1000 ml",
    use: [
      "Brug shampooen i vÃ¥dt hÃ¥r og massÃ©r produktet ind i hovedbund og lÃ¦ngder. Skyl grundigt ud.",
      "Brug LOW, nÃ¥r hÃ¥ret har brug for en let rens og mere bevÃ¦gelse. Brug RICH, nÃ¥r hÃ¥ret fÃ¸les tÃ¸rt eller har brug for ekstra pleje.",
    ],
    learn: [
      "LOW og RICH giver dig mulighed for at justere din hÃ¥rvask efter hÃ¥rets behov. LOW hjÃ¦lper med at rense uden at tynge, mens RICH tilfÃ¸rer mere fugt og pleje til hÃ¥r, der fÃ¸les tÃ¸rt eller krÃ¦ver ekstra nÃ¦ring.",
    ],
    infoIntro: "Klik pÃ¥ et produkt under 'SÃ¦ttet indeholder' for at lÃ¦se mere om anvendelse og produktdetaljer for det enkelte produkt.",
    productInfo: { sku: "LRCS-RRCS-2000", amount: "2 Ã— 1000 ml", weight: "2 kg", shelfLife: "12 mÃ¥neder" },
    cards: [
      { title: "LOW Refresh Cleansing Shampoo", description: "Let rens til hovedbund og hÃ¥r med fokus pÃ¥ friskhed, fugt og balance.", price: "379 kr.", size: "1000 ml", image: "../../img/produktbilleder/MIXLY-Low-Refresh-Shampoo-1000.png", href: "../../products/shampoo/low-refresh-cleansing-shampoo.html" },
      { title: "RICH Repair Cleansing Shampoo", description: "Plejende shampoo til hÃ¥r, der fÃ¸les tÃ¸rt eller krÃ¦ver ekstra nÃ¦ring.", price: "379 kr.", size: "1000 ml", image: "../../img/produktbilleder/MIXLY-Rich-Repair-Shampoo-1000ml.png", href: "../../products/shampoo/rich-repair-cleansing-shampoo.html" },
    ],
  },
  "low + rich deep drink conditioner - 2 x 1000 ml": {
    price: "798 kr.",
    intro: "Et conditioner-sÃ¦t til dig, der Ã¸nsker fleksibel pleje og fugt til krÃ¸ller og bÃ¸lger. LOW giver let balance, mens RICH tilfÃ¸rer ekstra fugt og nÃ¦ring.",
    containsTitle: "SÃ¦ttet indeholder",
    containsLabel: "Produkter i Low + Rich Deep Drink Conditioner 2 x 1000 ml",
    use: [
      "PÃ¥fÃ¸r conditioner i vÃ¥dt hÃ¥r efter vask. Fordel produktet i lÃ¦ngderne, lad hÃ¥ret absorbere fugten og skyl derefter ud.",
      "Brug LOW, nÃ¥r hÃ¥ret har brug for let pleje. Brug RICH, nÃ¥r hÃ¥ret fÃ¸les tÃ¸rt eller mangler blÃ¸dhed.",
    ],
    learn: [
      "Conditioner hjÃ¦lper med at gÃ¸re hÃ¥ret blÃ¸dere, lettere at rede ud og mere modtageligt for styling. Kombinationen af LOW og RICH gÃ¸r det muligt at tilpasse plejen efter hÃ¥rets aktuelle behov.",
    ],
    infoIntro: "Klik pÃ¥ et produkt under 'SÃ¦ttet indeholder' for at lÃ¦se mere om anvendelse og produktdetaljer for det enkelte produkt.",
    productInfo: { sku: "LC-RDDC-2000", amount: "2 Ã— 1000 ml", weight: "2 kg", shelfLife: "12 mÃ¥neder" },
    cards: [
      { title: "LOW Conditioner", description: "Let conditioner, der giver fugt og balance uden at tynge hÃ¥ret.", price: "399 kr.", size: "1000 ml", image: "../../img/produktbilleder/MIXLY-Low-Conditioner-1000.png", href: "../../products/conditioner/mixly-low-conditioner.html" },
      { title: "RICH Deep Drink Conditioner", description: "Ekstra fugt og nÃ¦ring til hÃ¥r, der fÃ¸les tÃ¸rt eller mangler blÃ¸dhed.", price: "399 kr.", size: "1000 ml", image: "../../img/produktbilleder/MIXLY-Rich-Deep-Drink-Conditioner-1000.png", href: "../../products/conditioner/rich-deep-drink-conditioner.html" },
    ],
  },
  "low refiner curl gel + rich curl cream - 2 x 150 ml": {
    price: "338 kr.",
    intro: "Et stylingsÃ¦t til dig, der Ã¸nsker definition, fugt og hold. LOW Refiner Curl Gel giver struktur, mens RICH Curl Cream tilfÃ¸rer blÃ¸dhed og pleje.",
    containsTitle: "SÃ¦ttet indeholder",
    containsLabel: "Produkter i Low Refiner Curl Gel + Rich Curl Cream",
    use: [
      "Fordel produktet i fugtigt hÃ¥r efter vask og pleje.",
      "Brug gel for mere hold og definition. Brug curl cream for mere fugt, blÃ¸dhed og pleje. Produkterne kan bruges hver for sig eller sammen.",
    ],
    learn: [
      "Gel og curl cream arbejder forskelligt i hÃ¥ret. Gel hjÃ¦lper med at give struktur og holde formen pÃ¥ krÃ¸llerne, mens curl cream tilfÃ¸rer fugt og gÃ¸r hÃ¥ret blÃ¸dere. Sammen giver de en fleksibel stylingrutine.",
    ],
    infoIntro: "Klik pÃ¥ et produkt under 'SÃ¦ttet indeholder' for at lÃ¦se mere om anvendelse og produktdetaljer for det enkelte produkt.",
    productInfo: { sku: "LRGC-RCC-300", amount: "2 Ã— 150 ml", weight: "0,3 kg", shelfLife: "6-12 mÃ¥neder" },
    cards: [
      { title: "LOW Refiner Curl Gel", description: "Giver struktur, hold og definition uden at gÃ¸re hÃ¥ret stift.", price: "169 kr.", size: "150 ml", image: "../../img/produktbilleder/MIXLY-Curl-Gel.png", href: "../../products/styling/low-refiner-curl-gel.html" },
      { title: "RICH Curl Cream", description: "TilfÃ¸rer fugt, blÃ¸dhed og pleje til krÃ¸ller og bÃ¸lger.", price: "169 kr.", size: "150 ml", image: "../../img/produktbilleder/Mixly-Curl-Cream.png", href: "../../products/styling/rich-curl-cream.html" },
    ],
  },
  "low + rich leave-in conditioner - 2 x 150 ml": {
    price: "338 kr.",
    intro: "Et leave-in sÃ¦t til dig, der Ã¸nsker fugt, blÃ¸dhed og let pleje efter vask. LOW giver let balance, mens RICH tilfÃ¸rer ekstra fugt og nÃ¦ring.",
    containsTitle: "SÃ¦ttet indeholder",
    containsLabel: "Produkter i Low + Rich Leave-In Conditioner",
    use: ["Fordel leave-in i fugtigt hÃ¥r efter vask. Produktet skal ikke skylles ud."],
    learn: [
      "Leave-in conditioner hjÃ¦lper med at bevare fugten i hÃ¥ret og gÃ¸re krÃ¸ller og bÃ¸lger lettere at style. Kombinationen af LOW og RICH gÃ¸r det muligt at tilpasse plejen efter hÃ¥rets behov.",
    ],
    infoIntro: "Klik pÃ¥ et produkt under 'SÃ¦ttet indeholder' for at lÃ¦se mere om anvendelse og produktdetaljer for det enkelte produkt.",
    productInfo: { sku: "RLIC-LLIC-300", amount: "2 Ã— 150 ml", weight: "0,3 kg", shelfLife: "6 mÃ¥neder" },
    cards: [
      { title: "LOW Leave-In Conditioner", description: "Let fugt, beskyttelse og balance efter vask.", price: "169 kr.", size: "150 ml", image: "../../img/produktbilleder/Low-Leave-In-Conditioner (1).png", href: "../../products/conditioner/low-leave-in-conditioner.html" },
      { title: "RICH Leave-In Conditioner", description: "Ekstra fugt, nÃ¦ring og blÃ¸dhed til krÃ¸ller og bÃ¸lger.", price: "169 kr.", size: "150 ml", image: "../../img/produktbilleder/Mixly-Rich-Leave-In-Conditioner (1).png", href: "../../products/conditioner/rich-leave-in-conditioner.html" },
    ],
  },
  "low + rich deep drink conditioner - 2 x 200 ml": {
    price: "318 kr.",
    intro: "Et conditioner-sÃ¦t i mindre stÃ¸rrelse til dig, der vil kunne skifte mellem let pleje og dybere fugt efter hÃ¥rets behov.",
    containsTitle: "SÃ¦ttet indeholder",
    containsLabel: "Produkter i Low Conditioner + Rich Deep Drink Conditioner 2 x 200 ml",
    use: ["PÃ¥fÃ¸r conditioner i vÃ¥dt hÃ¥r efter vask. Fordel produktet i lÃ¦ngderne, lad hÃ¥ret absorbere fugten og skyl derefter ud."],
    learn: [
      "LOW Conditioner giver let pleje uden at tynge hÃ¥ret. RICH Deep Drink Conditioner tilfÃ¸rer mere fugt og nÃ¦ring til hÃ¥r, der fÃ¸les tÃ¸rt eller mangler smidighed.",
    ],
    infoIntro: "Klik pÃ¥ et produkt under 'SÃ¦ttet indeholder' for at lÃ¦se mere om anvendelse og produktdetaljer for det enkelte produkt.",
    productInfo: { sku: "LC-RDDC-400", amount: "2 Ã— 200 ml", weight: "0,4 kg", shelfLife: "12 mÃ¥neder" },
    cards: [
      { title: "LOW Conditioner", description: "Let conditioner, der giver fugt og balance uden at tynge hÃ¥ret.", price: "159 kr.", size: "200 ml", image: "../../img/produktbilleder/Low-Conditioner-1.png", href: "../../products/conditioner/mixly-low-conditioner.html" },
      { title: "RICH Deep Drink Conditioner", description: "Mere fugt og nÃ¦ring til hÃ¥r, der fÃ¸les tÃ¸rt eller mangler smidighed.", price: "159 kr.", size: "200 ml", image: "../../img/produktbilleder/MIXLY-Rich-Deep-Drink-Conditioner-200.png", href: "../../products/conditioner/rich-deep-drink-conditioner.html" },
    ],
  },
  "low refresh + rich repair cleansing shampoo": {
    title: "Low Refresh + Rich Repair Cleansing Shampoo",
    price: "220 kr.",
    intro: "Et mindre shampoosÃ¦t til dig, der vil prÃ¸ve LOW og RICH eller have en fleksibel rutine med pÃ¥ farten.",
    containsTitle: "SÃ¦ttet indeholder",
    containsLabel: "Produkter i Low Refresh + Rich Repair Cleansing Shampoo 2 x 100 ml",
    use: ["MassÃ©r shampooen ind i vÃ¥dt hÃ¥r og hovedbund. Skyl grundigt ud."],
    learn: [
      "SÃ¦ttet gÃ¸r det nemt at mÃ¦rke forskellen pÃ¥ LOW og RICH. LOW renser let og hjÃ¦lper hÃ¥ret med at bevare bevÃ¦gelse, mens RICH giver en mere plejende vask.",
    ],
    infoIntro: "Klik pÃ¥ et produkt under 'SÃ¦ttet indeholder' for at lÃ¦se mere om anvendelse og produktdetaljer for det enkelte produkt.",
    productInfo: { sku: "LRCS-RRCS-200", amount: "2 Ã— 100 ml", weight: "0,2 kg", shelfLife: "12 mÃ¥neder" },
    cards: [
      { title: "LOW Refresh Cleansing Shampoo", description: "Let rens til hovedbund og hÃ¥r med fokus pÃ¥ friskhed og bevÃ¦gelse.", price: "110 kr.", size: "100 ml", image: "../../img/produktbilleder/MIXLY-Low-Refresh-Shampoo-100.png", href: "../../products/shampoo/low-refresh-cleansing-shampoo.html" },
      { title: "RICH Repair Cleansing Shampoo", description: "En mere plejende vask til hÃ¥r, der fÃ¸les tÃ¸rt eller krÃ¦ver ekstra nÃ¦ring.", price: "110 kr.", size: "100 ml", image: "../../img/produktbilleder/MIXLY-Rich-Repair-Shampoo-100.png", href: "../../products/shampoo/rich-repair-cleansing-shampoo.html" },
    ],
  },
  "low + rich shampoo": {
    title: "Low + Rich Shampoo",
    price: "298 kr.",
    intro: "Et shampoosÃ¦t til dig, der vil kunne tilpasse hÃ¥rvasken efter dagsform, fugtbehov og hÃ¥rets balance.",
    containsTitle: "SÃ¦ttet indeholder",
    containsLabel: "Produkter i Low + Rich Shampoo",
    use: ["MassÃ©r shampooen ind i vÃ¥dt hÃ¥r og hovedbund. Skyl grundigt ud."],
    learn: [
      "LOW og RICH kan bruges hver for sig eller kombineres. LOW hjÃ¦lper med at give en lettere fornemmelse i hÃ¥ret, mens RICH tilfÃ¸rer mere pleje.",
    ],
    infoIntro: "Klik pÃ¥ et produkt under 'SÃ¦ttet indeholder' for at lÃ¦se mere om anvendelse og produktdetaljer for det enkelte produkt.",
    productInfo: { sku: "LS-RS-200", amount: "2 Ã— 250 ml", weight: "0,5 kg", shelfLife: "6 mÃ¥neder" },
    cards: [
      { title: "LOW Shampoo", description: "Let shampoo til en balanceret vask med bevÃ¦gelse og fugt.", price: "149 kr.", size: "250 ml", image: "../../img/produktbilleder/Low-Shampoo-1.png", href: "../../products/shampoo/low-shampoo.html" },
      { title: "RICH Shampoo", description: "Plejende shampoo, der tilfÃ¸rer mere fugt og nÃ¦ring.", price: "149 kr.", size: "250 ml", image: "../../img/produktbilleder/Rich-Shampoo-1.png", href: "../../products/shampoo/rich-shampoo.html" },
    ],
  },
  "low + rich curly shampoo bar sensitive": {
    title: "Low + Rich Curly Shampoo Bar Sensitive",
    price: "198 kr.",
    intro: "Et shampoobar-sÃ¦t til dig, der Ã¸nsker en mild og fleksibel vask af krÃ¸ller og bÃ¸lger. LOW giver let rens, mens RICH tilfÃ¸rer mere pleje.",
    containsTitle: "SÃ¦ttet indeholder",
    containsLabel: "Produkter i Low + Rich Curly Shampoo Bar Sensitive",
    use: ["Fugt hÃ¥ret og arbejd shampoobaren op mellem hÃ¦nderne eller direkte i hÃ¥ret. MassÃ©r produktet ind i hovedbund og lÃ¦ngder. Skyl grundigt ud."],
    learn: [
      "Shampoobarer er et alternativ til flydende shampoo og kan bruges som en del af en fleksibel krÃ¸llerutine. LOW hjÃ¦lper med let rens og balance, mens RICH tilfÃ¸rer mere fugt og pleje.",
    ],
    infoIntro: "Klik pÃ¥ et produkt under 'SÃ¦ttet indeholder' for at lÃ¦se mere om anvendelse og produktdetaljer for det enkelte produkt.",
    productInfo: { sku: "LRSB-170", amount: "170 g", weight: "0,170 kg", shelfLife: "6-12 mÃ¥neder" },
    cards: [
      { title: "LOW Curly Shampoo Bar Sensitive", description: "Mild shampoobar med let rens og balance til krÃ¸ller og bÃ¸lger.", price: "99 kr.", size: "85 g", image: "../../img/produktbilleder/Low-Curly-Shampoo-Bar-Sensitive-1.png", href: "../../products/shampoo/low-curly-shampoo-bar-sensitive.html" },
      { title: "RICH Curly Shampoo Bar Sensitive", description: "Mild shampoobar med mere fugt og pleje til krÃ¸ller og bÃ¸lger.", price: "99 kr.", size: "85 g", image: "../../img/produktbilleder/Rich-Curly-Shampoo-Bar-Sensitive-1.png", href: "../../products/shampoo/rich-curly-shampoo-bar-sensitive.html" },
    ],
  },
};

function createProductPageParagraphs(items) {
  return items.map((text) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    return paragraph;
  });
}

function createProductPageOrderedList(items) {
  const list = document.createElement("ol");
  list.className = "produkt-skabelon-panel-list";

  items.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    list.append(item);
  });

  return list;
}

function createSetPackageCards(config) {
  const row = document.createElement("div");
  row.className = "produkt-skabelon-package-products";
  row.dataset.packageProductsRow = "";
  row.setAttribute("aria-label", config.containsLabel || "Produkter i sÃ¦ttet");

  config.cards.forEach((product) => {
    const card = document.createElement("a");
    card.className = "produkt-skabelon-package-card";
    card.href = product.href;
    card.innerHTML = `
      <span class="produkt-skabelon-package-image"><img src="${product.image}" alt="${product.title}"></span>
      <span class="produkt-skabelon-package-content"><strong>${product.title}</strong><span class="produkt-skabelon-package-description">${product.description}</span><span class="produkt-skabelon-package-meta"><span>${product.price}</span><span>${product.size}</span></span></span>
    `;
    row.append(card);
  });

  return row;
}

function createSetAccordion(title, children) {
  const details = document.createElement("details");
  details.className = "produkt-skabelon-accordion";
  const panel = document.createElement("div");
  panel.className = "produkt-skabelon-accordion-panel";
  panel.append(...children);
  details.innerHTML = `
    <summary class="produkt-skabelon-accordion-button">
      <span>${title}</span>
      <span aria-hidden="true">âŒ„</span>
    </summary>
  `;
  details.append(panel);
  return details;
}

function extractExistingIngredientInfo(productInfo) {
  const ingredientRow = Array.from(productInfo?.querySelectorAll(".produkt-skabelon-info-row") || []).find((row) => {
    const label = row.querySelector(".produkt-skabelon-info-label")?.textContent.trim().toUpperCase() || "";
    return label.includes("INGREDIENSER");
  });

  return ingredientRow?.querySelector(".produkt-skabelon-info-value") || null;
}

function createSetProductInfo(config, existingIngredientInfo) {
  const wrapper = document.createElement("div");
  wrapper.className = "produkt-skabelon-product-info";

  [
    ["VARENUMMER", config.productInfo.sku],
    ["MÃ†NGDE", config.productInfo.amount],
    ["VÃ†GT", config.productInfo.weight],
    ["HOLDBARHED", config.productInfo.shelfLife],
  ].forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "produkt-skabelon-info-row";
    row.innerHTML = `<div class="produkt-skabelon-info-label">${label}</div><div class="produkt-skabelon-info-value">${value}</div>`;
    wrapper.append(row);
  });

  if (existingIngredientInfo) {
    const ingredientRow = document.createElement("div");
    ingredientRow.className = "produkt-skabelon-info-row";
    ingredientRow.innerHTML = '<div class="produkt-skabelon-info-label">INGREDIENSER</div>';
    const value = document.createElement("div");
    value.className = "produkt-skabelon-info-value";
    value.append(...Array.from(existingIngredientInfo.childNodes));
    ingredientRow.append(value);
    wrapper.append(ingredientRow);
  }

  return wrapper;
}

function upgradeMixlySetPage() {
  const summary = document.querySelector(".produkt-skabelon-summary");
  const title = getProductPageTitle();
  const config = mixlySetPageUpgrades[normalizeProductTitle(title)];

  if (!summary || !config) {
    return;
  }

  const heading = summary.querySelector("#produkt-skabelon-title");
  const price = summary.querySelector("[data-product-page-price]");
  const description = summary.querySelector(".produkt-skabelon-description");
  const accordions = summary.querySelector(".produkt-skabelon-accordions");
  const existingProductInfo = summary.querySelector(".produkt-skabelon-product-info");
  const existingIngredientInfo = extractExistingIngredientInfo(existingProductInfo);

  if (config.title && heading) {
    heading.textContent = config.title;
  }

  if (config.price && price) {
    price.textContent = config.price;
  }

  if (description) {
    description.textContent = config.intro;
  }

  const packagePanel = [createSetPackageCards(config)];
  const indicators = document.createElement("div");
  indicators.className = "slider-indicators produkt-skabelon-package-indicators";
  indicators.setAttribute("aria-label", `Navigation mellem ${config.containsLabel || "produkter"}`);
  packagePanel.push(indicators);

  const infoPanel = [
    ...createProductPageParagraphs([config.infoIntro]),
    createSetProductInfo(config, existingIngredientInfo),
  ];

  accordions?.replaceChildren(
    createSetAccordion(config.containsTitle, packagePanel),
    createSetAccordion("SÃ¥dan bruges produktet", [createProductPageOrderedList(config.use)]),
    createSetAccordion("LÃ¦r mere om produktet", createProductPageParagraphs(config.learn)),
    createSetAccordion("Ingredienser & produktinfo", infoPanel)
  );

  accordions?.querySelectorAll("[data-package-products-row]").forEach((row) => {
    setupSliderIndicators(row, {
      itemSelector: ".produkt-skabelon-package-card",
      label: "produkt i sÃ¦ttet",
    });
  });
}

upgradeMixlySetPage();

const standaloneProductPageUpgrades = {
  "low curly protein treatment tea": {
    intro: "En intensiv proteinbehandling til krÃ¸ller og bÃ¸lger, der mangler styrke, spÃ¦ndstighed eller struktur. HjÃ¦lper hÃ¥ret med at genopbygge sig efter belastning fra styling, farvning eller miljÃ¸pÃ¥virkninger.",
    use: [
      "Bland en lille mÃ¦ngde pulver med varmt vand til en ensartet creme.",
      "Fordel i nyvasket hÃ¥r fra lÃ¦ngder til spidser.",
      "Lad virke 15-20 minutter.",
      "Skyl grundigt.",
      "Afslut gerne med conditioner eller fugtgivende behandling.",
    ],
    learn: [
      "Protein og fugt arbejder sammen, men har forskellige opgaver. Hvor fugt gÃ¸r hÃ¥ret blÃ¸dt og smidigt, hjÃ¦lper protein med at styrke hÃ¥rstrÃ¥ets struktur.",
      "Low Curly Protein Treatment Tea er udviklet til krÃ¸ller og bÃ¸lger, der fÃ¸les slappe, mister definition hurtigt eller har svÃ¦rt ved at holde formen.",
      "Behandlingen tilfÃ¸rer proteiner, som hjÃ¦lper hÃ¥ret med at genopbygge sin naturlige spÃ¦ndstighed.",
      "Produktet er sÃ¦rligt relevant efter perioder med varme, sol, kemiske behandlinger eller hvis hÃ¥ret generelt virker trÃ¦t og livlÃ¸st.",
      "Resultatet er krÃ¸ller, der fÃ¸les mere elastiske, definerede og modstandsdygtige uden at blive tunge.",
    ],
  },
  "rich curly moisturizing treatment mask": {
    intro: "En intensiv fugtmaske til krÃ¸ller og bÃ¸lger med behov for ekstra nÃ¦ring, blÃ¸dhed og pleje. HjÃ¦lper hÃ¥ret med at fÃ¸les mere smidigt, stÃ¦rkt og velplejet.",
    use: ["PÃ¥fÃ¸r i nyvasket hÃ¥r.", "Fordel jÃ¦vnt fra lÃ¦ngder til spidser.", "Lad virke 15-30 minutter.", "Skyl grundigt.", "Brug efter behov som ekstra fugtpleje."],
    learn: [
      "Rich Curly Moisturizing Treatment Mask er udviklet til krÃ¸ller, der har brug for mere fugt end den daglige rutine kan tilfÃ¸re.",
      "Masken arbejder i dybden og hjÃ¦lper med at genoprette hÃ¥rets fugtbalance. Det gÃ¸r krÃ¸llerne mere smidige, lettere at rede ud og mere modstandsdygtige overfor tÃ¸rhed.",
      "Den er sÃ¦rligt velegnet til tykkere krÃ¸ller, tÃ¸rre lÃ¦ngder eller hÃ¥r, der udsÃ¦ttes for varme, vejr og mekanisk belastning.",
      "Ved regelmÃ¦ssig brug opleves hÃ¥ret mere elastisk, blÃ¸dt og lettere at forme.",
    ],
  },
  "rich intensive care for curly ends": {
    intro: "En nÃ¦rende spidsbehandling til tÃ¸rre eller slidte lÃ¦ngder, som har brug for ekstra pleje og beskyttelse. HjÃ¦lper med at gÃ¸re spidserne blÃ¸dere, mere glansfulde og mindre krusede.",
    use: ["Fordel fÃ¥ drÃ¥ber i lÃ¦ngder og spidser.", "Brug i fugtigt eller tÃ¸rt hÃ¥r.", "FokusÃ©r pÃ¥ de omrÃ¥der, der fÃ¸les tÃ¸rre eller slidte.", "Gentag efter behov.", "Kan bruges som afsluttende pleje i din rutine."],
    learn: [
      "KrÃ¸ller udsÃ¦ttes ofte for mest slid i lÃ¦ngder og spidser, fordi hÃ¥rets naturlige olier har svÃ¦rere ved at bevÃ¦ge sig hele vejen ned gennem hÃ¥rstrÃ¥et.",
      "Rich Intensive Care for Curly Ends hjÃ¦lper med at forsegle fugt og reducere synlig tÃ¸rhed.",
      "Produktet giver ekstra pleje til omrÃ¥der, der let bliver ru, matte eller filtrede.",
      "Det er sÃ¦rligt velegnet til dig, der Ã¸nsker mere nÃ¦ring og beskyttelse uden at tynge hÃ¥ret unÃ¸digt.",
      "Resultatet er blÃ¸dere, mere velplejede lÃ¦ngder med mindre frizz.",
    ],
  },
  "low intensive care for curly ends": {
    intro: "En let plejende olie til spidser og lÃ¦ngder, der giver blÃ¸dhed, glans og beskyttelse uden at tynge hÃ¥ret. Velegnet til fine krÃ¸ller og bÃ¸lger.",
    use: ["Fordel 1-2 drÃ¥ber i lÃ¦ngder og spidser.", "Brug i fugtigt eller tÃ¸rt hÃ¥r.", "Start med en lille mÃ¦ngde.", "TilfÃ¸j mere efter behov.", "Kan bruges som daglig finish eller ekstra pleje mellem vaske."],
    learn: [
      "Low Intensive Care for Curly Ends er udviklet til finere krÃ¸ller og bÃ¸lger, der har brug for let pleje.",
      "Produktet hjÃ¦lper med at reducere tÃ¸rhed i lÃ¦ngderne og gÃ¸r hÃ¥ret mere medgÃ¸rligt uden at skabe en tung eller fedtet fÃ¸lelse.",
      "Det fungerer som et dagligt plejeprodukt, der understÃ¸tter hÃ¥rets naturlige bevÃ¦gelse og glans.",
      "Velegnet til dig, der Ã¸nsker let beskyttelse og blÃ¸dhed mellem hÃ¥rvaskene.",
      "Resultatet er et mere glansfuldt, blÃ¸dt og velplejet hÃ¥r uden tung finish.",
    ],
  },
  "rich leave-in conditioner": {
    intro: "En plejende leave-in conditioner til krÃ¸ller og bÃ¸lger, der har brug for fugt, blÃ¸dhed og mere kontrol. HjÃ¦lper med at reducere frizz og gÃ¸re hÃ¥ret mere medgÃ¸rligt.",
    use: ["Fordel en lille mÃ¦ngde i fugtigt hÃ¥r.", "Arbejd produktet ind i lÃ¦ngder og spidser.", "Lad produktet blive i hÃ¥ret.", "Brug mere efter behov pÃ¥ tÃ¸rre omrÃ¥der.", "Kan anvendes alene eller sammen med stylingprodukter."],
    learn: [
      "Rich Leave-In Conditioner er udviklet til krÃ¸ller og bÃ¸lger, der har brug for mere fugt og pleje i hverdagen.",
      "Produktet hjÃ¦lper med at samle krÃ¸llerne, reducere frizz og gÃ¸re hÃ¥ret mere medgÃ¸rligt uden at fÃ¸les fedtet.",
      "Den passer sÃ¦rligt godt til hÃ¥r, der fÃ¸les tÃ¸rt, groft eller har brug for ekstra stÃ¸tte mellem hÃ¥rvaskene.",
      "Leave-in conditioner bliver i hÃ¥ret og fungerer derfor som en plejende base under styling.",
      "Resultatet er blÃ¸dere, mere kontrollerede krÃ¸ller med naturligt fald og mindre frizz.",
    ],
  },
  "low leave-in conditioner": {
    intro: "En let leave-in conditioner til fine krÃ¸ller og bÃ¸lger, der giver fugt, bevÃ¦gelse og beskyttelse uden at tynge hÃ¥ret.",
    use: ["Fordel en lille mÃ¦ngde i fugtigt hÃ¥r.", "Kram produktet forsigtigt ind i lÃ¦ngderne.", "Lad produktet blive i hÃ¥ret.", "TilfÃ¸j ekstra efter behov.", "Kan bruges alene eller som base under styling."],
    learn: [
      "Low Leave-In Conditioner er udviklet til hÃ¥r, der let bliver tungt eller mister volumen.",
      "Produktet hjÃ¦lper med at bevare hÃ¥rets naturlige bevÃ¦gelse, samtidig med at krÃ¸llerne fÃ¥r fugt og beskyttelse.",
      "Den lette formel gÃ¸r den velegnet til fine krÃ¸ller og bÃ¸lger, hvor for meget produkt hurtigt kan fÃ¥ hÃ¥ret til at falde sammen.",
      "Leave-in conditioner fungerer som et plejende mellemtrin mellem vask og styling.",
      "Resultatet er blÃ¸de, lette og mere veldefinerede krÃ¸ller uden tung fornemmelse.",
    ],
  },
  "rich curl cream": {
    intro: "En plejende curl cream til krÃ¸ller og bÃ¸lger, der Ã¸nsker fugt, blÃ¸dhed og mere samlet form. HjÃ¦lper med at reducere frizz og give et roligt, naturligt udtryk.",
    use: ["Fordel produktet i fugtigt hÃ¥r.", "Arbejd det ind i lÃ¦ngder og spidser.", "Kram krÃ¸llerne op med hÃ¦nderne.", "Lad hÃ¥ret lufttÃ¸rre eller brug diffuser.", "Kan bruges alene eller sammen med gel."],
    learn: [
      "Rich Curl Cream er udviklet til krÃ¸ller, der har brug for mere fugt og blÃ¸dhed i stylingrutinen.",
      "Produktet hjÃ¦lper med at samle krÃ¸llerne og give en mere rolig form uden at gÃ¸re hÃ¥ret stift.",
      "Curl cream er isÃ¦r velegnet til hÃ¥r, der bliver tÃ¸rt, kruset eller har brug for ekstra pleje i lÃ¦ngderne.",
      "Den kan bruges alene for et blÃ¸dt og naturligt resultat eller kombineres med gel for mere hold.",
      "Resultatet er blÃ¸de, smidige krÃ¸ller med naturlig bevÃ¦gelse og et mere samlet udtryk.",
    ],
  },
  "low refiner curl gel": {
    intro: "En let curl gel til krÃ¸ller og bÃ¸lger, der Ã¸nsker definition, fleksibelt hold og naturlig bevÃ¦gelse uden at hÃ¥ret fÃ¸les stift.",
    use: ["Fordel produktet i fugtigt eller nÃ¦sten tÃ¸rt hÃ¥r.", "Kram produktet ind i krÃ¸ller eller bÃ¸lger.", "Lad hÃ¥ret lufttÃ¸rre eller brug diffuser.", "NÃ¥r hÃ¥ret er tÃ¸rt, kan du kramme det let for en blÃ¸dere finish.", "Kan bruges alene eller sammen med curl cream."],
    learn: [
      "Low Refiner Curl Gel er udviklet til krÃ¸ller og bÃ¸lger, der har brug for definition og let hold uden tung styling.",
      "Gelen hjÃ¦lper med at fremhÃ¦ve hÃ¥rets naturlige form og reducere frizz, samtidig med at hÃ¥ret stadig kan bevÃ¦ge sig.",
      "Den er sÃ¦rligt velegnet til fine krÃ¸ller og bÃ¸lger, hvor tunge stylingprodukter hurtigt kan fÃ¥ hÃ¥ret til at miste volumen.",
      "Produktet kan bruges alene for et let og naturligt resultat eller sammen med curl cream for ekstra pleje og hold.",
      "Resultatet er mere definerede krÃ¸ller med fleksibelt hold og en naturlig finish.",
    ],
  },
  "low curly sea mist barrier": {
    intro: "En let stylingmist, der giver struktur, fylde og naturlig definition til fine krÃ¸ller og bÃ¸lger. Perfekt til dig, der Ã¸nsker et mere levende og tekstureret udtryk.",
    use: ["Spray i fugtigt eller tÃ¸rt hÃ¥r.", "Fordel produktet i lÃ¦ngderne.", "Kram krÃ¸ller eller bÃ¸lger op med hÃ¦nderne.", "Lad hÃ¥ret lufttÃ¸rre eller brug diffuser.", "Genopfrisk i lÃ¸bet af dagen efter behov."],
    learn: [
      "Low Curly Sea Mist Barrier er udviklet til dig, der Ã¸nsker mere struktur og tekstur i hÃ¥ret uden klassiske stylingprodukters tyngde.",
      "Misten hjÃ¦lper med at fremhÃ¦ve hÃ¥rets naturlige form og giver en mere levende overflade med let hold.",
      "Den er sÃ¦rligt velegnet til fine krÃ¸ller og bÃ¸lger, som hurtigt mister volumen eller definition i lÃ¸bet af dagen.",
      "Produktet kan bruges bÃ¥de efter vask og som opfriskning mellem vaske.",
      "Resultatet er et mere naturligt beach-look med fleksibel bevÃ¦gelse og let definition.",
    ],
  },
  "rich curly morning mist barrier": {
    intro: "En opfriskende mist til krÃ¸ller og bÃ¸lger, der har brug for fugt, definition og mindre frizz mellem hÃ¥rvaskene.",
    use: ["Spray i tÃ¸rt eller let fugtigt hÃ¥r.", "Fordel produktet i lÃ¦ngderne.", "Kram krÃ¸llerne op igen.", "Lad hÃ¥ret lufttÃ¸rre eller brug diffuser.", "Brug efter behov mellem hÃ¥rvaskene."],
    learn: [
      "KrÃ¸ller Ã¦ndrer sig fra dag til dag. Rich Curly Morning Mist Barrier er udviklet til at genaktivere hÃ¥rets form uden at skulle starte hele rutinen forfra.",
      "Produktet tilfÃ¸rer let fugt og hjÃ¦lper hÃ¥ret med at finde tilbage til sin naturlige struktur.",
      "Det er sÃ¦rligt velegnet til morgener, hvor krÃ¸llerne virker flade, tÃ¸rre eller urolige.",
      "Misten kan bruges alene eller sammen med andre stylingprodukter, nÃ¥r hÃ¥ret har brug for en hurtig opfriskning.",
      "Resultatet er mere samlede krÃ¸ller med mindre frizz, mere blÃ¸dhed og mere bevÃ¦gelse.",
    ],
  },
  "low curly botanic whipped mousse": {
    intro: "En let mousse, der giver volumen, hold og definition uden at gÃ¸re hÃ¥ret stift. Velegnet til fine krÃ¸ller og bÃ¸lger, der har brug for mere fylde.",
    use: ["Ryst flasken grundigt.", "Fordel produktet i fugtigt hÃ¥r.", "Kram moussen ind i krÃ¸ller eller bÃ¸lger.", "Lad hÃ¥ret lufttÃ¸rre eller brug diffuser.", "Genopfrisk efter behov."],
    learn: [
      "Low Curly Botanic Whipped Mousse er udviklet til krÃ¸ller og bÃ¸lger, der Ã¸nsker mere fylde og struktur uden tung styling.",
      "Den lette konsistens fordeler sig nemt gennem hÃ¥ret og hjÃ¦lper krÃ¸llerne med at holde formen lÃ¦ngere.",
      "Mousse er sÃ¦rligt velegnet til fint hÃ¥r, hvor cremer og tunge stylingprodukter hurtigt kan fÃ¸les for meget.",
      "Produktet kan bruges alene for et luftigt resultat eller kombineres med andre produkter for mere hold.",
      "Resultatet er mere volumen, bedre definition og naturlig bevÃ¦gelse.",
    ],
  },
  "rich curly rice infusion oil": {
    intro: "En nÃ¦rende olie til krÃ¸ller og bÃ¸lger med behov for ekstra beskyttelse, blÃ¸dhed og fugt. HjÃ¦lper med at forsegle hÃ¥ret og reducere frizz.",
    use: ["PÃ¥fÃ¸r fÃ¥ drÃ¥ber i lÃ¦ngder og spidser.", "Brug i fugtigt eller tÃ¸rt hÃ¥r.", "Start med en lille mÃ¦ngde.", "TilfÃ¸j mere efter behov.", "Kan bruges alene eller som afsluttende finish."],
    learn: [
      "Rich Curly Rice Infusion Oil er udviklet til hÃ¥r, der har brug for mere nÃ¦ring og beskyttelse end en let olie kan give.",
      "Olien hjÃ¦lper med at forsegle fugt i hÃ¥ret og beskytte mod udtÃ¸rring fra vejr, varme og daglig belastning.",
      "Den er sÃ¦rligt velegnet til tykkere krÃ¸ller, tÃ¸rre lÃ¦ngder eller hÃ¥r med tendens til frizz.",
      "Produktet kan bruges som sidste trin i rutinen for at give glans, blÃ¸dhed og beskyttelse.",
      "Resultatet er blÃ¸dere, mere smidige krÃ¸ller med naturlig glans og bedre fugtbalance.",
    ],
  },
};

function upgradeStandaloneProductPage() {
  const summary = document.querySelector(".produkt-skabelon-summary");
  const config = standaloneProductPageUpgrades[normalizeProductTitle(getProductPageTitle())];

  if (!summary || !config) {
    return;
  }

  const description = summary.querySelector(".produkt-skabelon-description");
  const accordions = summary.querySelector(".produkt-skabelon-accordions");
  const existingProductInfo = summary.querySelector(".produkt-skabelon-product-info");

  if (description) {
    description.textContent = config.intro;
  }

  if (!accordions || !existingProductInfo) {
    return;
  }

  accordions.replaceChildren(
    createSetAccordion("SÃ¥dan bruges produktet", [createProductPageOrderedList(config.use)]),
    createSetAccordion("LÃ¦r mere om produktet", createProductPageParagraphs(config.learn)),
    createSetAccordion("Ingredienser & produktinfo", [existingProductInfo])
  );
}

upgradeStandaloneProductPage();

function updateSetContentForSize(title, label) {
  const config = getSetVariantForSize(title, label);
  const summary = document.querySelector(".produkt-skabelon-summary");
  const accordions = summary?.querySelector(".produkt-skabelon-accordions");
  const description = summary?.querySelector(".produkt-skabelon-description");
  const existingProductInfo = summary?.querySelector(".produkt-skabelon-product-info");
  const existingIngredientInfo = extractExistingIngredientInfo(existingProductInfo);

  if (!config || !accordions) {
    return;
  }

  if (description) {
    description.textContent = config.intro;
  }

  const packagePanel = [createSetPackageCards(config)];
  const indicators = document.createElement("div");
  indicators.className = "slider-indicators produkt-skabelon-package-indicators";
  indicators.setAttribute("aria-label", `Navigation mellem ${config.containsLabel || "produkter"}`);
  packagePanel.push(indicators);

  const infoPanel = [
    ...createProductPageParagraphs([config.infoIntro]),
    createSetProductInfo(config, existingIngredientInfo),
  ];

  accordions.replaceChildren(
    createSetAccordion(config.containsTitle, packagePanel),
    createSetAccordion("SÃ¥dan bruges produktet", [createProductPageOrderedList(config.use)]),
    createSetAccordion("LÃ¦r mere om produktet", createProductPageParagraphs(config.learn)),
    createSetAccordion("Ingredienser & produktinfo", infoPanel)
  );

  accordions.querySelectorAll("[data-package-products-row]").forEach((row) => {
    setupSliderIndicators(row, {
      itemSelector: ".produkt-skabelon-package-card",
      label: "produkt i sÃ¦ttet",
    });
  });
}

const productPageTags = ["Ã˜kologisk", "Vegansk", "Parfumefri", "Unisex"];
const jojobaQuenchProductPageTags = ["Ã˜kologisk", "Vegansk", "Unisex", "Parfumefri"];

function ensureProductPageTags() {
  const summary = document.querySelector(".produkt-skabelon-summary");
  const title = getProductPageTitle();

  if (!summary || !title) {
    return;
  }

  const heading = summary.querySelector("#produkt-skabelon-title");
  let tagList = summary.querySelector(".produkt-skabelon-tags");

  if (!tagList) {
    tagList = document.createElement("ul");
    tagList.className = "produkt-skabelon-tags";
    tagList.setAttribute("aria-label", "Produkt-tags");
    heading?.before(tagList);
  }

  const tags = normalizeProductTitle(title) === "low curly jojoba quench oil 30 ml" ? jojobaQuenchProductPageTags : productPageTags;
  tagList.classList.toggle("produkt-skabelon-tags-all", tags.length > 4);
  tagList.replaceChildren(...tags.map((tag) => {
    const item = document.createElement("li");
    item.textContent = tag;
    return item;
  }));
}

ensureProductPageTags();

const productBreadcrumbLabels = {
  shampoo: "Shampoo",
  conditioner: "Conditioner",
  haarmasker: "HÃ¥rmaske",
  styling: "Styling",
  saet: "SÃ¦t",
  startpakker: "Startpakker",
};

const productBreadcrumbLinks = {
  shampoo: "../../produkter-shampoo.html",
  conditioner: "../../produkter-conditioner.html",
  haarmasker: "../../produkter-haarmasker.html",
  styling: "../../produkter-styling.html",
  saet: "../../produkter-saet.html",
  startpakker: "../../produkter-startpakker.html",
};

function ensureProductBreadcrumbs() {
  const main = document.querySelector(".produkt-skabelon-main");
  const hero = document.querySelector(".produkt-skabelon-hero");
  const title = getProductPageTitle();

  if (!main || !hero || main.querySelector(".produkt-breadcrumbs") || !title) {
    return;
  }

  const categoryKey = window.location.pathname.split("/products/")[1]?.split("/")[0] || "";
  const categoryLabel = productBreadcrumbLabels[categoryKey] || "Produkter";
  const categoryHref = productBreadcrumbLinks[categoryKey] || "../../produkter.html";
  const breadcrumbs = document.createElement("nav");
  breadcrumbs.className = "produkt-breadcrumbs";
  breadcrumbs.setAttribute("aria-label", "BrÃ¸dkrummesti");
  breadcrumbs.innerHTML = `
    <a href="../../index.html">Forside</a>
    <span aria-hidden="true">/</span>
    <a href="../../produkter.html">Produkter</a>
    <span aria-hidden="true">/</span>
    <a href="${categoryHref}">${categoryLabel}</a>
    <span aria-hidden="true">/</span>
    <span aria-current="page">${title}</span>
  `;

  main.insertBefore(breadcrumbs, hero);
}

ensureProductBreadcrumbs();

const productPageSizeButtons = document.querySelectorAll(".produkt-skabelon-size[data-product-price]");

if (productPageSizeButtons.length) {
  const productPagePrice = document.querySelector("[data-product-page-price]");
  const productPageImage = document.querySelector(".produkt-skabelon-image-hero img");
  const productPageDetailsImage = document.querySelector(".produkt-skabelon-ingredient-image");
  const productPageTitle = getProductPageTitle();
  const defaultSizeButton = getDefaultProductSizeButton(productPageSizeButtons);

  productPageSizeButtons.forEach((button) => {
    const detailsImage = getProductDetailsImageForSize(productPageTitle, button.textContent);

    if (detailsImage && !button.dataset.productDetailsImage) {
      button.dataset.productDetailsImage = detailsImage;
    }

    const isActive = button === defaultSizeButton;
    button.classList.toggle("produkt-skabelon-size-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));

    if (isActive && productPagePrice) {
      productPagePrice.textContent = formatDisplayPrice(button.dataset.productPrice);
    }

    if (isActive && productPageImage && button.dataset.productImage) {
      productPageImage.src = button.dataset.productImage;
    }

    if (isActive && productPageDetailsImage && button.dataset.productDetailsImage) {
      productPageDetailsImage.src = button.dataset.productDetailsImage;
    }

    if (isActive) {
      updateSetContentForSize(productPageTitle, button.textContent);
      updateProductInfoForSize(productPageTitle, button.textContent);
    }

    button.addEventListener("click", () => {
      productPageSizeButtons.forEach((sizeButton) => {
        sizeButton.classList.remove("produkt-skabelon-size-active");
        sizeButton.setAttribute("aria-pressed", "false");
      });

      button.classList.add("produkt-skabelon-size-active");
      button.setAttribute("aria-pressed", "true");

      if (productPagePrice) {
        productPagePrice.textContent = formatDisplayPrice(button.dataset.productPrice);
      }

      if (productPageImage && button.dataset.productImage) {
        productPageImage.src = button.dataset.productImage;
      }

      if (productPageDetailsImage && button.dataset.productDetailsImage) {
        productPageDetailsImage.src = button.dataset.productDetailsImage;
      }

      updateSetContentForSize(productPageTitle, button.textContent);
      updateProductInfoForSize(productPageTitle, button.textContent);
    });
  });
}

normalizeDisplayedPrices();

let openQuickAddDropdown = null;
let quickAddSheet = null;

function getSelectedQuickAddVariant(control) {
  const selectedLabel = control.dataset.selectedSize || "";
  return control.quickAddData?.sizes?.find((size) => size.label === selectedLabel) || null;
}

function updateQuickAddSelectedLabel(control) {
  const label = control.querySelector(".quick-add-size-label");
  const selectedVariant = getSelectedQuickAddVariant(control);

  if (label) {
    label.textContent = selectedVariant ? `✓ ${selectedVariant.label}` : "Vælg str. ▼";
  }
}

function closeQuickAddDropdown(control = openQuickAddDropdown) {
  if (!control) {
    return;
  }

  control.classList.remove("is-open");
  control.querySelector(".quick-add-size-toggle")?.setAttribute("aria-expanded", "false");

  const dropdown = control.querySelector(".quick-add-dropdown");

  if (dropdown) {
    dropdown.hidden = true;
  }

  if (openQuickAddDropdown === control) {
    openQuickAddDropdown = null;
  }
}

function openQuickAddDropdownFor(control, showHelp = false) {
  if (openQuickAddDropdown && openQuickAddDropdown !== control) {
    closeQuickAddDropdown(openQuickAddDropdown);
  }

  const dropdown = control.querySelector(".quick-add-dropdown");
  const help = control.querySelector(".quick-add-help");

  control.classList.add("is-open");
  control.querySelector(".quick-add-size-toggle")?.setAttribute("aria-expanded", "true");

  if (dropdown) {
    dropdown.hidden = false;
  }

  if (help) {
    help.hidden = !showHelp;
  }

  openQuickAddDropdown = control;
}

function renderQuickAddOptions(control, data) {
  const options = control.querySelector(".quick-add-options");

  if (!options) {
    return;
  }

  options.replaceChildren(...data.sizes.filter((size) => size.label).map((size) => {
    const button = document.createElement("button");
    button.className = "quick-add-option";
    button.type = "button";
    button.textContent = size.label;
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      control.dataset.selectedSize = size.label;
      updateQuickAddSelectedLabel(control);
      closeQuickAddDropdown(control);
    });
    return button;
  }));
}

function replaceCardAddButtonWithQuickAdd(card, data) {
  const addButton = card.querySelector(".product-add-button");
  const sizes = data.sizes.filter((size) => size.label);

  if (!window.matchMedia("(min-width: 1181px)").matches || !addButton || !cardMayHaveMultipleSizes(card, sizes)) {
    return;
  }

  if (addButton.classList.contains("quick-add-control")) {
    addButton.quickAddData = data;
    renderQuickAddOptions(addButton, data);
    updateQuickAddSelectedLabel(addButton);
    return;
  }

  const control = document.createElement("div");
  control.className = addButton.className;
  control.classList.add("quick-add-control");
  control.setAttribute("role", "group");
  control.setAttribute("aria-label", "Vælg størrelse og tilføj til kurv");
  control.quickAddData = data;
  control.innerHTML = `
    <div class="quick-add-menu">
      <div class="quick-add-dropdown" hidden>
        <p class="quick-add-help" hidden>Vælg en størrelse for at tilføje til kurv.</p>
        <div class="quick-add-options"></div>
      </div>
      <button class="quick-add-size-toggle" type="button" aria-expanded="false">
        <span class="quick-add-size-label">Vælg str. ▼</span>
      </button>
    </div>
    <button class="quick-add-submit" type="button">Tilføj til kurv</button>
  `;

  renderQuickAddOptions(control, data);
  control.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleProductCardAdd(card, event);
  });
  addButton.replaceWith(control);
}

async function enhanceCardQuickAdd(card) {
  const data = getQuickAddData(card);
  const sizes = data.sizes.filter((size) => size.label);

  if (cardMayHaveMultipleSizes(card, sizes)) {
    replaceCardAddButtonWithQuickAdd(card, data);
  }

  const details = await fetchQuickAddDetails(data.fullLink);
  const enrichedData = mergeQuickAddData(data, details);

  if (!card.isConnected) {
    return;
  }

  replaceCardAddButtonWithQuickAdd(card, enrichedData);
}

function createQuickAddSheet() {
  const sheet = document.createElement("div");
  sheet.className = "quick-add-sheet";
  sheet.hidden = true;
  sheet.innerHTML = `
    <div class="quick-add-sheet-backdrop" data-quick-add-close></div>
    <section class="quick-add-sheet-panel" role="dialog" aria-modal="true" aria-labelledby="quick-add-sheet-title">
      <button class="quick-add-sheet-close" type="button" aria-label="Luk" data-quick-add-close>×</button>
      <h2 id="quick-add-sheet-title">Vælg størrelse</h2>
      <div class="quick-add-sheet-options"></div>
      <button class="button button-primary quick-add-sheet-submit" type="button">Tilføj til kurv</button>
    </section>
  `;

  sheet.addEventListener("click", (event) => {
    if (event.target.closest("[data-quick-add-close]")) {
      closeQuickAddSheet();
      return;
    }

    const option = event.target.closest(".quick-add-sheet-option");

    if (option) {
      sheet.dataset.selectedSize = option.dataset.size || "";
      sheet.querySelectorAll(".quick-add-sheet-option").forEach((button) => {
        const isActive = button === option;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
    }
  });

  sheet.querySelector(".quick-add-sheet-submit").addEventListener("click", () => {
    const selectedVariant = sheet.quickAddData?.sizes?.find((size) => size.label === sheet.dataset.selectedSize);

    if (!selectedVariant) {
      sheet.classList.add("show-help");
      return;
    }

    closeQuickAddSheet();
    addToCart(getProductFromCardVariant(sheet.quickAddCard, selectedVariant));
  });

  document.body.append(sheet);
  return sheet;
}

function openQuickAddSheet(card, data) {
  const sheet = quickAddSheet || createQuickAddSheet();
  quickAddSheet = sheet;
  sheet.quickAddCard = card;
  sheet.quickAddData = data;
  sheet.dataset.selectedSize = "";
  sheet.classList.remove("show-help");

  sheet.querySelector(".quick-add-sheet-options").replaceChildren(...data.sizes.filter((size) => size.label).map((size) => {
    const button = document.createElement("button");
    button.className = "quick-add-sheet-option";
    button.type = "button";
    button.dataset.size = size.label;
    button.setAttribute("aria-pressed", "false");
    button.textContent = size.label;
    return button;
  }));

  sheet.hidden = false;
  document.body.classList.add("is-quick-add-sheet-open");
}

function closeQuickAddSheet() {
  if (!quickAddSheet || quickAddSheet.hidden) {
    return;
  }

  quickAddSheet.hidden = true;
  document.body.classList.remove("is-quick-add-sheet-open");
}

async function handleProductCardAdd(card, event) {
  const control = event.target.closest(".quick-add-control");

  if (control) {
    if (event.target.closest(".quick-add-size-toggle")) {
      openQuickAddDropdownFor(control, false);
      return;
    }

    if (event.target.closest(".quick-add-submit")) {
      const selectedVariant = getSelectedQuickAddVariant(control);

      if (!selectedVariant) {
        openQuickAddDropdownFor(control, true);
        return;
      }

      closeQuickAddDropdown(control);
      addToCart(getProductFromCardVariant(card, selectedVariant));
    }

    return;
  }

  const data = getQuickAddData(card);
  const sizes = data.sizes.filter((size) => size.label);

  if (cardMayHaveMultipleSizes(card, sizes)) {
    const details = await fetchQuickAddDetails(data.fullLink);
    const enrichedData = mergeQuickAddData(data, details);

    if (window.matchMedia("(min-width: 1181px)").matches) {
      replaceCardAddButtonWithQuickAdd(card, enrichedData);
      const control = card.querySelector(".quick-add-control");

      if (control) {
        openQuickAddDropdownFor(control, true);
      }

      return;
    }

    openQuickAddSheet(card, enrichedData);
    return;
  }

  addToCart(getProductFromCard(card));
}

document.addEventListener("click", (event) => {
  if (openQuickAddDropdown && !event.target.closest(".quick-add-control")) {
    closeQuickAddDropdown();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeQuickAddDropdown();
    closeQuickAddSheet();
  }
});

document.querySelectorAll(".top-nav-link-cart").forEach((cartLink) => {
  cartLink.addEventListener("click", (event) => {
    event.preventDefault();
    openCartDrawer();
  });
});

document.querySelectorAll(".product-card, .produkt-skabelon-related-card").forEach((card) => {
  const addButton = card.querySelector(".product-add-button");

  if (!addButton) {
    return;
  }

  addButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleProductCardAdd(card, event);
  });
});

document.querySelectorAll(".produkt-skabelon-buy").forEach((button) => {
  button.addEventListener("click", () => {
    addToCart(getProductFromPage());
  });
});

document.addEventListener("hildebrandt-cart-updated", () => {
  cartItems = loadCartItems();
  updateCartBadges();

  if (cartDrawer) {
    renderCartDrawer();
  }
});

updateCartBadges();

const quickAddDetailCache = new Map();

function normalizeProductTitle(title) {
  return title.trim().toLowerCase();
}

function getQuickAddData(card) {
  const title = getCardTitle(card);
  const key = normalizeProductTitle(title);
  const catalogData = quickAddCatalog[key] || {};
  const image = getCardImage(card);
  const price = card.querySelector(".product-meta span:first-child")?.textContent.trim() ||
    (card.classList.contains("produkt-skabelon-related-card") ? card.querySelector("p")?.textContent.trim() : "") ||
    "";
  const description = getCardDescription(card);
  const fullLink = getCardLink(card) || catalogData.fullLink || "#";
  const fallbackImage = image?.getAttribute("src") || "";

  return {
    title,
    description: catalogData.description || description,
    tags: catalogData.tags || ["Ã˜kologisk", "Vegansk", "Parfumefri", "Unisex"],
    sizes: catalogData.sizes || [{ label: "", price, image: fallbackImage, link: fullLink }],
    detailsImage: catalogData.detailsImage || "",
    fullLink,
    guide: catalogData.guide || [],
  };
}

function getQuickAddUrl(value, baseUrl = window.location.href) {
  if (!value || value === "#") {
    return "";
  }

  try {
    return new URL(value, baseUrl).href;
  } catch (error) {
    return value;
  }
}

function getQuickAddGuideLabel(label) {
  const normalizedLabel = normalizeProductTitle(label);

  if (normalizedLabel === "anvendelse" || normalizedLabel.includes("brug")) {
    return "Brug";
  }

  return label;
}

function getQuickAddFallbackGuide(data) {
  if (data.guide.length) {
    return data.guide;
  }

  return [
    ["Brug", "Se produktets anvendelse pÃ¥ produktsiden."],
    ["God til", data.description || "KrÃ¸ller og bÃ¸lger med behov for pleje."],
    ["Effekt", "Pleje tilpasset hÃ¥rets behov."],
  ];
}

async function fetchQuickAddDetails(fullLink) {
  const url = getQuickAddUrl(fullLink);

  if (!url) {
    return null;
  }

  if (quickAddDetailCache.has(url)) {
    return quickAddDetailCache.get(url);
  }

  const detailsPromise = fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Produktdata kunne ikke hentes.");
      }

      return response.text();
    })
    .then((html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const heroImage = doc.querySelector(".produkt-skabelon-image-hero img")?.getAttribute("src") || "";
      const detailsImage = doc.querySelector(".produkt-skabelon-ingredient-image")?.getAttribute("src") || "";
      let sizes = Array.from(doc.querySelectorAll(".produkt-skabelon-size[data-product-price]")).map((button) => ({
        label: button.textContent.trim(),
        price: button.dataset.productPrice || "",
        image: getQuickAddUrl(button.dataset.productImage || heroImage, url),
        detailsImage: getQuickAddUrl(
          button.dataset.productDetailsImage ||
            getProductDetailsImageForSize(doc.querySelector("#produkt-skabelon-title")?.textContent.trim() || "", button.textContent.trim()) ||
            "",
          url
        ),
        link: url,
      }));
      const amountRow = Array.from(doc.querySelectorAll(".produkt-skabelon-info-row"))
        .find((row) => row.querySelector(".produkt-skabelon-info-label")?.textContent.trim().toUpperCase().includes("NGDE"));
      const amountText = amountRow?.querySelector(".produkt-skabelon-info-value")?.textContent.trim() || "";
      const singleSizeLabel = /\d+\s*(ml|g)\b/i.test(amountText) ? amountText.split("/")[0].trim() : "";

      if (!sizes.length && singleSizeLabel) {
        sizes = [{
          label: singleSizeLabel,
          price: doc.querySelector("[data-product-page-price]")?.textContent.trim() || "",
          image: getQuickAddUrl(heroImage, url),
          detailsImage: getQuickAddUrl(detailsImage, url),
          link: url,
        }];
      }
      const guide = Array.from(doc.querySelectorAll(".produkt-skabelon-spec-row"))
        .map((row) => {
          const title = row.querySelector("dt")?.textContent.trim() || "";
          const text = row.querySelector("dd")?.textContent.trim() || "";
          return title && text ? [getQuickAddGuideLabel(title), text] : null;
        })
        .filter(Boolean);

      return {
        sizes,
        detailsImage: getQuickAddUrl(detailsImage, url),
        productImage: getQuickAddUrl(heroImage, url),
        guide,
      };
    })
    .catch(() => null);

  quickAddDetailCache.set(url, detailsPromise);
  return detailsPromise;
}

function mergeQuickAddData(data, details) {
  if (!details) {
    return data;
  }

  return {
    ...data,
    sizes: details.sizes.length ? details.sizes : data.sizes,
    productImage: details.productImage || data.productImage,
  };
}

document.querySelectorAll(".product-card, .produkt-skabelon-related-card").forEach(enhanceCardQuickAdd);

const relatedPostsContainer = document.querySelector("[data-related-posts]");

if (relatedPostsContainer) {
  const blogPosts = [
    {
      category: "KrÃ¸lleviden",
      title: "Hvorfor krÃ¸llet og bÃ¸lget hÃ¥r krÃ¦ver en anden tilgang end glat hÃ¥r",
      href: "hvorfor-kroellet-og-bolget-har-kraever-en-anden-tilgang.html",
    },
    {
      category: "Guides",
      title: "5 gode rÃ¥d til at fÃ¥ det bedste ud af dine krÃ¸ller og bÃ¸lger",
      href: "5-gode-rad-til-dine-kroller-og-bolger.html",
    },
    {
      category: "Mixly",
      title: "Derfor virker dine krÃ¸lleprodukter ikke og hvad du skal gÃ¸re i stedet",
      href: "derfor-virker-dine-krolleprodukter-ikke.html",
    },
    {
      category: "KrÃ¸lleviden",
      title: "SÃ¥dan fÃ¥r du dine naturlige krÃ¸ller frem",
      href: "sadan-far-du-dine-naturlige-kroller-frem.html",
    },
    {
      category: "Guides",
      title: "SÃ¥dan fÃ¥r du dine skandinaviske krÃ¸ller frem - uden spildte penge",
      href: "sadan-far-du-dine-skandinaviske-kroller-frem.html",
    },
    {
      category: "KrÃ¸lleviden",
      title: "5 vaner du bÃ¸r undgÃ¥, hvis du har fint krÃ¸llet eller bÃ¸lget hÃ¥r",
      href: "5-vaner-du-bor-undga.html",
    },
    {
      category: "Guides",
      title: "SÃ¥dan vÃ¦lger du din Mixly startpakke - kom godt i gang",
      href: "sadan-vaelger-du-din-mixly-startpakke.html",
    },
    {
      category: "Mixly",
      title: "SÃ¥dan vil Mixlys ingredienser virke i dit fine krÃ¸llede eller bÃ¸lgede hÃ¥r",
      href: "sadan-virker-mixlys-ingredienser.html",
    },
  ];

  const currentFile = window.location.pathname.split("/").pop();
  const isBlogFolderPage = window.location.pathname.includes("/blog/");
  const currentPostIndex = blogPosts.findIndex((post) => post.href === currentFile);
  const orderedPosts = currentPostIndex === -1
    ? blogPosts
    : blogPosts.slice(currentPostIndex + 1).concat(blogPosts.slice(0, currentPostIndex));
  const relatedPosts = orderedPosts
    .filter((post) => post.href !== currentFile)
    .slice(0, 3);

  relatedPostsContainer.replaceChildren(...relatedPosts.map((post) => {
    const card = document.createElement("article");
    card.className = "blog-card";

    const image = document.createElement("figure");
    image.className = "blog-card-image";
    image.setAttribute("aria-label", "Placeholder billede");
    image.append("IMG");

    const imageSize = document.createElement("span");
    imageSize.textContent = "360 x 215";
    image.append(imageSize);

    const category = document.createElement("p");
    category.className = "blog-card-category";
    category.textContent = post.category;

    const title = document.createElement("h3");
    title.className = "blog-card-title";
    title.textContent = post.title;

    const link = document.createElement("a");
    link.className = "blog-card-link";
    link.href = `${isBlogFolderPage ? "" : "blog/"}${post.href}`;
    link.textContent = "LÃ¦s indlÃ¦g â†’";

    card.append(image, category, title, link);
    return card;
  }));
}



