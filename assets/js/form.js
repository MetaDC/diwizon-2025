document.addEventListener("DOMContentLoaded", () => {
  let scrollPosition = 0;
  let smoother = null;
  let stickyHeader = null;
  let hideHeaderTemporarily = false;

  const GOOGLE_SHEETS_URL =
    "https://script.google.com/macros/s/AKfycbwdbyWQWs8jYenLyma990c92gZ0QPuQEph8bOUeyLi4-s3Zd367kKBKC4syKbPUAcYB/exec";

  setTimeout(() => {
    if (window.ScrollSmoother && window.ScrollSmoother.get) {
      smoother = window.ScrollSmoother.get();
      // console.log("✅ ScrollSmoother detected:", smoother);
    } else {
      // console.log("⚠️ ScrollSmoother not found");
    }

    // Find sticky header (adjust selector to match your header)
    stickyHeader =
      document.querySelector(".sticky-header") ||
      document.querySelector("header.sticky") ||
      document.querySelector("nav.sticky") ||
      document.querySelector('[class*="sticky"]');

    if (stickyHeader) {
      // console.log("✅ Sticky header found:", stickyHeader);
    }
  }, 1000);

  // === SCROLL LISTENER TO SHOW HEADER AGAIN ===
  let lastScrollPosition = 0;

  function handleScroll() {
    if (!hideHeaderTemporarily || !stickyHeader) return;

    const currentScroll = smoother ? smoother.scrollTop() : window.pageYOffset;

    // If user scrolls (in any direction), show header again
    if (Math.abs(currentScroll - lastScrollPosition) > 50) {
      console.log("🔄 User scrolled, showing header again");
      stickyHeader.style.transform = "";
      stickyHeader.style.opacity = "";
      stickyHeader.style.transition = "transform 0.3s ease, opacity 0.3s ease";
      hideHeaderTemporarily = false;
    }

    lastScrollPosition = currentScroll;
  }

  // Add scroll listener
  if (smoother) {
    // For ScrollSmoother
    window.addEventListener("scroll", handleScroll);
  } else {
    window.addEventListener("scroll", handleScroll, { passive: true });
  }

  // === IMPROVED SHARED FUNCTIONS ===
  function openModal(modalElement) {
    // Store scroll position
    if (smoother) {
      scrollPosition = smoother.scrollTop();
    } else {
      scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    }

    // console.log("🔓 Opening modal, saving position:", scrollPosition);

    // Pause smoother first
    if (smoother) {
      smoother.paused(true);
    }

    // Lock body scroll BEFORE showing modal
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    // Then show modal
    requestAnimationFrame(() => {
      modalElement.classList.remove("hidden");
      document.body.classList.add("modal-open");
    });
  }

  function closeModal(modalElement) {
    // console.log("🔒 Closing modal, will restore to:", scrollPosition);

    const savedPosition = scrollPosition;

    // Hide sticky header temporarily when modal closes
    if (stickyHeader) {
      // console.log("👻 Hiding sticky header temporarily");
      stickyHeader.style.transition = "none";
      stickyHeader.style.transform = "translateY(-100%)";
      stickyHeader.style.opacity = "0";
      hideHeaderTemporarily = true;
      lastScrollPosition = savedPosition;
    }

    // Step 1: Hide modal immediately but keep body locked
    modalElement.classList.add("hidden");
    document.body.classList.remove("modal-open");

    // Step 2: Use double rAF for smooth transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Remove body lock
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.overflow = "";

        // Step 3: Restore scroll
        if (smoother) {
          // console.log("📍 Using ScrollSmoother restore");
          smoother.paused(false);
          smoother.scrollTo(savedPosition, false);
        } else {
          // console.log("📍 Using window scroll restore");
          window.scrollTo({
            top: savedPosition,
            left: 0,
            behavior: "instant",
          });
        }

        // Verification after a tick
        setTimeout(() => {
          if (smoother) {
            const current = smoother.scrollTop();
            if (Math.abs(current - savedPosition) > 5) {
              smoother.scrollTo(savedPosition, false);
            }
          } else {
            const current =
              window.pageYOffset || document.documentElement.scrollTop;
            if (Math.abs(current - savedPosition) > 5) {
              window.scrollTo({
                top: savedPosition,
                left: 0,
                behavior: "instant",
              });
            }
          }
          // console.log("✅ Scroll position verified");
        }, 50);
      });
    });

    // console.log("✅ Modal closed, scroll restored to:", savedPosition);
  }

  async function submitToGoogleSheets(formData, sheetType) {
    try {
      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          sheetType: sheetType,
        }),
      });
      // console.log("✅ Data sent to Google Sheets");
      return true;
    } catch (error) {
      console.error("❌ Google Sheets submission error:", error);
      return false;
    }
  }

  async function sendEmail(name, email, phone, subject, type) {
    const data = {
      emails: ["info@diwizon.com"],
      subject: subject,
      message: `
        <h2>${type}</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone Number:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr>
        <p><small>Submitted on: ${new Date().toLocaleString()}</small></p>
      `,
    };

    try {
      const response = await fetch("https://mailer-5x4h33dpla-uc.a.run.app/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // console.log("✅ Email sent successfully");
      return true;
    } catch (error) {
      console.error(" Email sending error:", error);
      return false;
    }
  }

  // === PORTFOLIO FORM ===
  const portfolioBtns = document.querySelectorAll(".portfolioBtn");
  const popupForm = document.getElementById("popupForm");
  const portfolioCloseBtn = document.querySelector(".portfolio-close");
  const userForm = document.getElementById("userForm");
  const portfolioSubmitBtn = document.getElementById("portfolioSubmitBtn");

  if (portfolioBtns.length > 0 && popupForm) {
    portfolioBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal(popupForm);
      });
    });
  }

  if (portfolioCloseBtn && popupForm) {
    const handleClose = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      closeModal(popupForm);
      return false;
    };

    portfolioCloseBtn.addEventListener("click", handleClose);
    portfolioCloseBtn.addEventListener("touchend", handleClose, {
      passive: false,
    });
  }

  if (popupForm) {
    popupForm.addEventListener("click", (e) => {
      if (e.target === popupForm) {
        e.preventDefault();
        closeModal(popupForm);
      }
    });
  }

  if (userForm && portfolioSubmitBtn) {
    userForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const btnText = portfolioSubmitBtn.querySelector(".btn-text");
      const loader = portfolioSubmitBtn.querySelector(".loader");

      loader.classList.remove("hidden");
      btnText.style.display = "none";
      portfolioSubmitBtn.disabled = true;

      const name = userForm
        .querySelector('input[placeholder="Your Name"]')
        .value.trim();
      const email = userForm
        .querySelector('input[placeholder="Email ID"]')
        .value.trim();
      const phone = document
        .getElementById("portfolioPhoneNumber")
        .value.trim();
      const countryCode = document.getElementById("portfolioCountryCode").value;
      const fullPhone = countryCode + phone;

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phonePattern = /^\d{10,15}$/;

      if (!name || !emailPattern.test(email) || !phonePattern.test(phone)) {
        alert("Please fill all fields correctly.");
        loader.classList.add("hidden");
        btnText.style.display = "inline";
        portfolioSubmitBtn.disabled = false;
        return;
      }

      try {
        const formData = {
          name: name,
          email: email,
          phone: fullPhone,
          timestamp: new Date().toLocaleString(),
        };

        await Promise.allSettled([
          submitToGoogleSheets(formData, "portfolio"),
          sendEmail(
            name,
            email,
            fullPhone,
            "New Portfolio Request - Diwizon",
            "Portfolio Download Request"
          ),
        ]);

        closeModal(popupForm);
        sessionStorage.setItem("openPDF", "true");
        window.open("thankyou.html", "_blank");
        userForm.reset();
      } catch (error) {
        alert("Something went wrong. Please try again.");
      } finally {
        loader.classList.add("hidden");
        btnText.style.display = "inline";
        portfolioSubmitBtn.disabled = false;
      }
    });
  }

  // === GET QUOTE FORM ===
  const quoteBtns = document.querySelectorAll(".getQuoteBtn");
  const getQuotePopupForm = document.getElementById("getQuotepopupForm");
  const quoteCloseBtn = document.querySelector(".quote-close");
  const getQuoteUserForm = document.getElementById("getQuoteuserForm");
  const quoteSubmitBtn = document.getElementById("quoteSubmitBtn");

  if (quoteBtns.length > 0 && getQuotePopupForm) {
    quoteBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal(getQuotePopupForm);
      });
    });
  }

  if (quoteCloseBtn && getQuotePopupForm) {
    const handleClose = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      closeModal(getQuotePopupForm);
      return false;
    };

    quoteCloseBtn.addEventListener("click", handleClose);
    quoteCloseBtn.addEventListener("touchend", handleClose, { passive: false });
  }

  if (getQuotePopupForm) {
    getQuotePopupForm.addEventListener("click", (e) => {
      if (e.target === getQuotePopupForm) {
        e.preventDefault();
        closeModal(getQuotePopupForm);
      }
    });
  }

  if (getQuoteUserForm && quoteSubmitBtn) {
    getQuoteUserForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const btnText = quoteSubmitBtn.querySelector(".btn-text");
      const loader = quoteSubmitBtn.querySelector(".loader");

      loader.classList.remove("hidden");
      btnText.style.display = "none";
      quoteSubmitBtn.disabled = true;

      const name = getQuoteUserForm
        .querySelector('input[placeholder="Your Name"]')
        .value.trim();
      const email = getQuoteUserForm
        .querySelector('input[placeholder="Email ID"]')
        .value.trim();
      const phone = document.getElementById("quotePhoneNumber").value.trim();
      const countryCode = document.getElementById("quoteCountryCode").value;
      const fullPhone = countryCode + phone;

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phonePattern = /^\d{10,15}$/;

      if (!name || !emailPattern.test(email) || !phonePattern.test(phone)) {
        alert("Please fill all fields correctly.");
        loader.classList.add("hidden");
        btnText.style.display = "inline";
        quoteSubmitBtn.disabled = false;
        return;
      }

      try {
        const formData = {
          name: name,
          email: email,
          phone: fullPhone,
          timestamp: new Date().toLocaleString(),
        };

        await Promise.allSettled([
          submitToGoogleSheets(formData, "quote"),
          sendEmail(
            name,
            email,
            fullPhone,
            "New Get Quote Request - Diwizon",
            "Get Quote Request"
          ),
        ]);

        closeModal(getQuotePopupForm);

        setTimeout(() => {
          window.location.href = "getthankyou.html";
        }, 300);

        getQuoteUserForm.reset();
      } catch (error) {
        alert("Something went wrong. Please try again.");
      } finally {
        loader.classList.add("hidden");
        btnText.style.display = "inline";
        quoteSubmitBtn.disabled = false;
      }
    });
  }

  // === ESC KEY TO CLOSE ===
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (popupForm && !popupForm.classList.contains("hidden")) {
        e.preventDefault();
        closeModal(popupForm);
      }
      if (
        getQuotePopupForm &&
        !getQuotePopupForm.classList.contains("hidden")
      ) {
        e.preventDefault();
        closeModal(getQuotePopupForm);
      }
    }
  });

  // === PREVENT BACKGROUND SCROLL ===
  document.addEventListener(
    "touchmove",
    (e) => {
      const isPortfolioOpen =
        popupForm && !popupForm.classList.contains("hidden");
      const isQuoteOpen =
        getQuotePopupForm && !getQuotePopupForm.classList.contains("hidden");

      if (isPortfolioOpen || isQuoteOpen) {
        const modalContent = document.querySelector(".popup-content");
        if (modalContent && modalContent.contains(e.target)) {
          return;
        }
        e.preventDefault();
      }
    },
    { passive: false }
  );

  document.addEventListener(
    "wheel",
    (e) => {
      const isPortfolioOpen =
        popupForm && !popupForm.classList.contains("hidden");
      const isQuoteOpen =
        getQuotePopupForm && !getQuotePopupForm.classList.contains("hidden");

      if (isPortfolioOpen || isQuoteOpen) {
        const modalContent = document.querySelector(".popup-content");
        if (modalContent && !modalContent.contains(e.target)) {
          e.preventDefault();
        }
      }
    },
    { passive: false }
  );
});
