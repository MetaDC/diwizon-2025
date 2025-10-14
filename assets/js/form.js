document.addEventListener("DOMContentLoaded", () => {
  let scrollPosition = 0;
  let smoother = null;

  const GOOGLE_SHEETS_URL =
    "https://script.google.com/macros/s/AKfycbwdbyWQWs8jYenLyma990c92gZ0QPuQEph8bOUeyLi4-s3Zd367kKBKC4syKbPUAcYB/exec";

  setTimeout(() => {
    if (window.ScrollSmoother && window.ScrollSmoother.get) {
      smoother = window.ScrollSmoother.get();
      console.log("✅ ScrollSmoother detected:", smoother);
    } else {
      console.log("⚠️ ScrollSmoother not found");
    }
  }, 1000);

  // === SHARED FUNCTIONS ===
  function openModal(modalElement) {
    // Store EXACT scroll position before ANY changes
    if (smoother) {
      scrollPosition = smoother.scrollTop();
    } else {
      scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    }

    console.log("🔓 Opening modal, saving position:", scrollPosition);

    // Pause smoother
    if (smoother) {
      smoother.paused(true);
    }

    // Show modal
    modalElement.classList.remove("hidden");
    document.body.classList.add("modal-open");

    // Lock body scroll - CRITICAL: Use the EXACT position
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
  }

  function closeModal(modalElement) {
    console.log("🔒 Closing modal, will restore to:", scrollPosition);

    // CRITICAL: Get the saved scroll position BEFORE any DOM changes
    const savedPosition = scrollPosition;

    console.log("💾 Restoring to position:", savedPosition);

    // Hide modal FIRST
    modalElement.classList.add("hidden");
    document.body.classList.remove("modal-open");

    // Remove body lock styles
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.overflow = "";

    // IMMEDIATELY restore scroll position
    if (smoother) {
      console.log("📍 Using ScrollSmoother restore");
      smoother.paused(false);

      // Use requestAnimationFrame for smooth restoration
      requestAnimationFrame(() => {
        smoother.scrollTo(savedPosition, false);
      });

      // Backup restoration
      setTimeout(() => smoother.scrollTo(savedPosition, false), 10);
      setTimeout(() => smoother.scrollTo(savedPosition, false), 50);
    } else {
      console.log("📍 Using window scroll restore");

      // MOBILE FIX: Force immediate scroll restoration
      requestAnimationFrame(() => {
        window.scrollTo(0, savedPosition);
        document.documentElement.scrollTop = savedPosition;
        document.body.scrollTop = savedPosition;
      });

      // Multiple attempts to ensure it sticks
      setTimeout(() => {
        window.scrollTo(0, savedPosition);
        document.documentElement.scrollTop = savedPosition;
        document.body.scrollTop = savedPosition;
      }, 0);

      setTimeout(() => {
        window.scrollTo(0, savedPosition);
        document.documentElement.scrollTop = savedPosition;
      }, 10);

      setTimeout(() => {
        window.scrollTo(0, savedPosition);
        document.documentElement.scrollTop = savedPosition;
      }, 50);

      // Final verification for mobile
      setTimeout(() => {
        const current =
          window.pageYOffset || document.documentElement.scrollTop;
        if (Math.abs(current - savedPosition) > 5) {
          console.warn("⚠️ FORCING final mobile restore:", savedPosition);
          window.scrollTo({ top: savedPosition, behavior: "instant" });
        }
      }, 100);
    }

    console.log("✅ Modal closed, scroll restored to:", savedPosition);
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
      console.log("✅ Data sent to Google Sheets");
      return true;
    } catch (error) {
      console.error("❌ Google Sheets submission error:", error);
      return false;
    }
  }

  async function sendEmail(name, email, phone, subject, type) {
    const data = {
      emails: ["aadil18122001@gmail.com"],
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
      console.log("✅ Email sent successfully");
      return true;
    } catch (error) {
      console.error("❌ Email sending error:", error);
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
    // Click event
    portfolioCloseBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      closeModal(popupForm);
      return false;
    });

    // Touch event - CRITICAL for mobile
    portfolioCloseBtn.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        closeModal(popupForm);
        return false;
      },
      { passive: false }
    );
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
    // Click event
    quoteCloseBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      closeModal(getQuotePopupForm);
      return false;
    });

    // Touch event - CRITICAL for mobile
    quoteCloseBtn.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        closeModal(getQuotePopupForm);
        return false;
      },
      { passive: false }
    );
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

        // Redirect to thank you page after successful submission
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
          return; // Allow scrolling inside modal
        }
        e.preventDefault(); // Prevent background scroll
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
