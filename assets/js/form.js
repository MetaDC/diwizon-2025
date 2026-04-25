document.addEventListener("DOMContentLoaded", () => {
  let scrollPosition = 0;
  let smoother = null;
  let stickyHeader = null;
  let hideHeaderTemporarily = false;

  // CAPTCHA Variables
  let portfolioCaptchaCode = "";
  let quoteCaptchaCode = "";

  const GOOGLE_SHEETS_URL =
    "https://script.google.com/macros/s/AKfycbwdbyWQWs8jYenLyma990c92gZ0QPuQEph8bOUeyLi4-s3Zd367kKBKC4syKbPUAcYB/exec";

  // === ADVANCED CAPTCHA GENERATION WITH CANVAS ===
  function generateCaptchaCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  function drawCaptcha(canvasId, code) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(1, "#764ba2");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add noise lines for security
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Add random dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Draw text with random positioning and rotation
    ctx.font = "bold 28px Arial";
    ctx.textBaseline = "middle";

    const charSpacing = width / (code.length + 1);

    for (let i = 0; i < code.length; i++) {
      ctx.save();

      // Random positioning
      const x = charSpacing * (i + 1) + (Math.random() - 0.5) * 10;
      const y = height / 2 + (Math.random() - 0.5) * 10;

      // Random rotation
      const angle = (Math.random() - 0.5) * 0.4;
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Random color (white shades)
      ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + Math.random() * 0.2})`;
      ctx.strokeStyle = `rgba(0, 0, 0, 0.3)`;
      ctx.lineWidth = 1;

      // Draw character with shadow
      ctx.strokeText(code[i], 0, 0);
      ctx.fillText(code[i], 0, 0);

      ctx.restore();
    }

    // Add more noise lines on top
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height
      );
      ctx.stroke();
    }
  }

  function initPortfolioCaptcha() {
    portfolioCaptchaCode = generateCaptchaCode();
    drawCaptcha("portfolioCaptchaCanvas", portfolioCaptchaCode);
  }

  function initQuoteCaptcha() {
    quoteCaptchaCode = generateCaptchaCode();
    drawCaptcha("quoteCaptchaCanvas", quoteCaptchaCode);
  }

  function validateCaptcha(userInput, actualCode) {
    return userInput.trim().toLowerCase() === actualCode.toLowerCase();
  }

  // Initialize ScrollSmoother and Sticky Header
  setTimeout(() => {
    if (window.ScrollSmoother && window.ScrollSmoother.get) {
      smoother = window.ScrollSmoother.get();
    }

    stickyHeader =
      document.querySelector(".sticky-header") ||
      document.querySelector("header.sticky") ||
      document.querySelector("nav.sticky") ||
      document.querySelector('[class*="sticky"]');
  }, 1000);

  // === SCROLL LISTENER TO SHOW HEADER AGAIN ===
  let lastScrollPosition = 0;

  function handleScroll() {
    if (!hideHeaderTemporarily || !stickyHeader) return;

    const currentScroll = smoother ? smoother.scrollTop() : window.pageYOffset;

    if (Math.abs(currentScroll - lastScrollPosition) > 50) {
      stickyHeader.style.transform = "";
      stickyHeader.style.opacity = "";
      stickyHeader.style.transition = "transform 0.3s ease, opacity 0.3s ease";
      hideHeaderTemporarily = false;
    }

    lastScrollPosition = currentScroll;
  }

  if (smoother) {
    window.addEventListener("scroll", handleScroll);
  } else {
    window.addEventListener("scroll", handleScroll, { passive: true });
  }

  // === SHARED FUNCTIONS ===
  function openModal(modalElement) {
    if (smoother) {
      scrollPosition = smoother.scrollTop();
    } else {
      scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    }

    if (smoother) {
      smoother.paused(true);
    }

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      modalElement.classList.remove("hidden");
      document.body.classList.add("modal-open");
    });
  }

  function closeModal(modalElement) {
    const savedPosition = scrollPosition;

    if (stickyHeader) {
      stickyHeader.style.transition = "none";
      stickyHeader.style.transform = "translateY(-100%)";
      stickyHeader.style.opacity = "0";
      hideHeaderTemporarily = true;
      lastScrollPosition = savedPosition;
    }

    modalElement.classList.add("hidden");
    document.body.classList.remove("modal-open");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.overflow = "";

        if (smoother) {
          smoother.paused(false);
          smoother.scrollTo(savedPosition, false);
        } else {
          window.scrollTo({
            top: savedPosition,
            left: 0,
            behavior: "instant",
          });
        }

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
        }, 50);
      });
    });
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
  const portfolioRefreshBtn = document.getElementById(
    "portfolioRefreshCaptcha"
  );
  const portfolioCaptchaCanvas = document.getElementById(
    "portfolioCaptchaCanvas"
  );

  if (portfolioBtns.length > 0 && popupForm) {
    portfolioBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal(popupForm);
        initPortfolioCaptcha();
      });
    });
  }

  if (portfolioRefreshBtn) {
    portfolioRefreshBtn.addEventListener("click", (e) => {
      e.preventDefault();
      initPortfolioCaptcha();
      document.getElementById("portfolioCaptchaInput").value = "";
    });
  }

  // Click canvas to refresh
  if (portfolioCaptchaCanvas) {
    portfolioCaptchaCanvas.addEventListener("click", () => {
      initPortfolioCaptcha();
      document.getElementById("portfolioCaptchaInput").value = "";
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

  // Replace the Portfolio form submission section in your existing code

  if (userForm && portfolioSubmitBtn) {
    userForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const btnText = portfolioSubmitBtn.querySelector(".btn-text");
      const loader = portfolioSubmitBtn.querySelector(".loader");
      const errorDiv = document.getElementById("portfolioCaptchaError");

      // Hide error message initially
      if (errorDiv) {
        errorDiv.style.display = "none";
      }

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
      const captchaInput = document
        .getElementById("portfolioCaptchaInput")
        .value.trim()
        .toLowerCase();

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phonePattern = /^\d{10,15}$/;

      // Validate CAPTCHA first
      if (!validateCaptcha(captchaInput, portfolioCaptchaCode)) {
        // Show error message within the dialog
        if (errorDiv) {
          errorDiv.style.display = "block";
          // Add shake animation
          errorDiv.style.animation = "shake 0.5s";
          setTimeout(() => {
            errorDiv.style.animation = "";
          }, 500);
        }

        // Refresh CAPTCHA and clear input
        initPortfolioCaptcha();
        document.getElementById("portfolioCaptchaInput").value = "";

        // Focus on the input field
        document.getElementById("portfolioCaptchaInput").focus();
        return;
      }

      if (!name || !emailPattern.test(email) || !phonePattern.test(phone)) {
        alert("Please fill all fields correctly.");
        return;
      }

      loader.classList.remove("hidden");
      btnText.style.display = "none";
      portfolioSubmitBtn.disabled = true;

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

  // Optional: Add CSS for shake animation (add this to your stylesheet or in a <style> tag)
  const style = document.createElement("style");
  style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;
  document.head.appendChild(style);

  // === GET QUOTE FORM ===
  const quoteBtns = document.querySelectorAll(".getQuoteBtn");
  const getQuotePopupForm = document.getElementById("getQuotepopupForm");
  const quoteCloseBtn = document.querySelector(".quote-close");
  const getQuoteUserForm = document.getElementById("getQuoteuserForm");
  const quoteSubmitBtn = document.getElementById("quoteSubmitBtn");
  const quoteRefreshBtn = document.getElementById("quoteRefreshCaptcha");
  const quoteCaptchaCanvas = document.getElementById("quoteCaptchaCanvas");

  if (quoteBtns.length > 0 && getQuotePopupForm) {
    quoteBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal(getQuotePopupForm);
        initQuoteCaptcha();
      });
    });
  }

  if (quoteRefreshBtn) {
    quoteRefreshBtn.addEventListener("click", (e) => {
      e.preventDefault();
      initQuoteCaptcha();
      document.getElementById("quoteCaptchaInput").value = "";
    });
  }

  // Click canvas to refresh
  if (quoteCaptchaCanvas) {
    quoteCaptchaCanvas.addEventListener("click", () => {
      initQuoteCaptcha();
      document.getElementById("quoteCaptchaInput").value = "";
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

  // Replace the Get Quote form submission section in your existing code

  if (getQuoteUserForm && quoteSubmitBtn) {
    getQuoteUserForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const btnText = quoteSubmitBtn.querySelector(".btn-text");
      const loader = quoteSubmitBtn.querySelector(".loader");
      const errorDiv = document.getElementById("quoteCaptchaError");

      // Hide error message initially
      if (errorDiv) {
        errorDiv.style.display = "none";
      }

      const name = getQuoteUserForm
        .querySelector('input[placeholder="Your Name"]')
        .value.trim();
      const email = getQuoteUserForm
        .querySelector('input[placeholder="Email ID"]')
        .value.trim();
      const phone = document.getElementById("quotePhoneNumber").value.trim();
      const countryCode = document.getElementById("quoteCountryCode").value;
      const fullPhone = countryCode + phone;
      const captchaInput = document
        .getElementById("quoteCaptchaInput")
        .value.trim()
        .toLowerCase();

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phonePattern = /^\d{10,15}$/;

      // Validate CAPTCHA first
      if (!validateCaptcha(captchaInput, quoteCaptchaCode)) {
        // Show error message within the dialog
        if (errorDiv) {
          errorDiv.style.display = "block";
          // Add shake animation
          errorDiv.style.animation = "shake 0.5s";
          setTimeout(() => {
            errorDiv.style.animation = "";
          }, 500);
        }

        // Refresh CAPTCHA and clear input
        initQuoteCaptcha();
        document.getElementById("quoteCaptchaInput").value = "";

        // Focus on the input field
        document.getElementById("quoteCaptchaInput").focus();
        return;
      }

      if (!name || !emailPattern.test(email) || !phonePattern.test(phone)) {
        alert("Please fill all fields correctly.");
        return;
      }

      loader.classList.remove("hidden");
      btnText.style.display = "none";
      quoteSubmitBtn.disabled = true;

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

// document.addEventListener("DOMContentLoaded", () => {
//   let scrollPosition = 0;
//   let smoother = null;
//   let stickyHeader = null;
//   let hideHeaderTemporarily = false;

//   const GOOGLE_SHEETS_URL =
//     "https://script.google.com/macros/s/AKfycbwdbyWQWs8jYenLyma990c92gZ0QPuQEph8bOUeyLi4-s3Zd367kKBKC4syKbPUAcYB/exec";

//   setTimeout(() => {
//     if (window.ScrollSmoother && window.ScrollSmoother.get) {
//       smoother = window.ScrollSmoother.get();
//       // console.log("✅ ScrollSmoother detected:", smoother);
//     } else {
//       // console.log("⚠️ ScrollSmoother not found");
//     }

//     // Find sticky header (adjust selector to match your header)
//     stickyHeader =
//       document.querySelector(".sticky-header") ||
//       document.querySelector("header.sticky") ||
//       document.querySelector("nav.sticky") ||
//       document.querySelector('[class*="sticky"]');

//     if (stickyHeader) {
//       // console.log("✅ Sticky header found:", stickyHeader);
//     }
//   }, 1000);

//   // === SCROLL LISTENER TO SHOW HEADER AGAIN ===
//   let lastScrollPosition = 0;

//   function handleScroll() {
//     if (!hideHeaderTemporarily || !stickyHeader) return;

//     const currentScroll = smoother ? smoother.scrollTop() : window.pageYOffset;

//     // If user scrolls (in any direction), show header again
//     if (Math.abs(currentScroll - lastScrollPosition) > 50) {
//       console.log("🔄 User scrolled, showing header again");
//       stickyHeader.style.transform = "";
//       stickyHeader.style.opacity = "";
//       stickyHeader.style.transition = "transform 0.3s ease, opacity 0.3s ease";
//       hideHeaderTemporarily = false;
//     }

//     lastScrollPosition = currentScroll;
//   }

//   // Add scroll listener
//   if (smoother) {
//     // For ScrollSmoother
//     window.addEventListener("scroll", handleScroll);
//   } else {
//     window.addEventListener("scroll", handleScroll, { passive: true });
//   }

//   // === IMPROVED SHARED FUNCTIONS ===
//   function openModal(modalElement) {
//     // Store scroll position
//     if (smoother) {
//       scrollPosition = smoother.scrollTop();
//     } else {
//       scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
//     }

//     // console.log("🔓 Opening modal, saving position:", scrollPosition);

//     // Pause smoother first
//     if (smoother) {
//       smoother.paused(true);
//     }

//     // Lock body scroll BEFORE showing modal
//     document.body.style.position = "fixed";
//     document.body.style.top = `-${scrollPosition}px`;
//     document.body.style.left = "0";
//     document.body.style.right = "0";
//     document.body.style.width = "100%";
//     document.body.style.overflow = "hidden";

//     // Then show modal
//     requestAnimationFrame(() => {
//       modalElement.classList.remove("hidden");
//       document.body.classList.add("modal-open");
//     });
//   }

//   function closeModal(modalElement) {
//     // console.log("🔒 Closing modal, will restore to:", scrollPosition);

//     const savedPosition = scrollPosition;

//     // Hide sticky header temporarily when modal closes
//     if (stickyHeader) {
//       // console.log("👻 Hiding sticky header temporarily");
//       stickyHeader.style.transition = "none";
//       stickyHeader.style.transform = "translateY(-100%)";
//       stickyHeader.style.opacity = "0";
//       hideHeaderTemporarily = true;
//       lastScrollPosition = savedPosition;
//     }

//     // Step 1: Hide modal immediately but keep body locked
//     modalElement.classList.add("hidden");
//     document.body.classList.remove("modal-open");

//     // Step 2: Use double rAF for smooth transition
//     requestAnimationFrame(() => {
//       requestAnimationFrame(() => {
//         // Remove body lock
//         document.body.style.position = "";
//         document.body.style.top = "";
//         document.body.style.left = "";
//         document.body.style.right = "";
//         document.body.style.width = "";
//         document.body.style.overflow = "";

//         // Step 3: Restore scroll
//         if (smoother) {
//           // console.log("📍 Using ScrollSmoother restore");
//           smoother.paused(false);
//           smoother.scrollTo(savedPosition, false);
//         } else {
//           // console.log("📍 Using window scroll restore");
//           window.scrollTo({
//             top: savedPosition,
//             left: 0,
//             behavior: "instant",
//           });
//         }

//         // Verification after a tick
//         setTimeout(() => {
//           if (smoother) {
//             const current = smoother.scrollTop();
//             if (Math.abs(current - savedPosition) > 5) {
//               smoother.scrollTo(savedPosition, false);
//             }
//           } else {
//             const current =
//               window.pageYOffset || document.documentElement.scrollTop;
//             if (Math.abs(current - savedPosition) > 5) {
//               window.scrollTo({
//                 top: savedPosition,
//                 left: 0,
//                 behavior: "instant",
//               });
//             }
//           }
//           // console.log("✅ Scroll position verified");
//         }, 50);
//       });
//     });

//     // console.log("✅ Modal closed, scroll restored to:", savedPosition);
//   }

//   async function submitToGoogleSheets(formData, sheetType) {
//     try {
//       const response = await fetch(GOOGLE_SHEETS_URL, {
//         method: "POST",
//         mode: "no-cors",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           ...formData,
//           sheetType: sheetType,
//         }),
//       });
//       // console.log("✅ Data sent to Google Sheets");
//       return true;
//     } catch (error) {
//       console.error("❌ Google Sheets submission error:", error);
//       return false;
//     }
//   }

//   async function sendEmail(name, email, phone, subject, type) {
//     const data = {
//       emails: ["info@diwizon.com"],
//       subject: subject,
//       message: `
//         <h2>${type}</h2>
//         <p><strong>Name:</strong> ${name}</p>
//         <p><strong>Phone Number:</strong> ${phone}</p>
//         <p><strong>Email:</strong> ${email}</p>
//         <hr>
//         <p><small>Submitted on: ${new Date().toLocaleString()}</small></p>
//       `,
//     };

//     try {
//       const response = await fetch("https://mailer-5x4h33dpla-uc.a.run.app/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       // console.log("✅ Email sent successfully");
//       return true;
//     } catch (error) {
//       console.error(" Email sending error:", error);
//       return false;
//     }
//   }

//   // === PORTFOLIO FORM ===
//   const portfolioBtns = document.querySelectorAll(".portfolioBtn");
//   const popupForm = document.getElementById("popupForm");
//   const portfolioCloseBtn = document.querySelector(".portfolio-close");
//   const userForm = document.getElementById("userForm");
//   const portfolioSubmitBtn = document.getElementById("portfolioSubmitBtn");

//   if (portfolioBtns.length > 0 && popupForm) {
//     portfolioBtns.forEach((btn) => {
//       btn.addEventListener("click", (e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         openModal(popupForm);
//       });
//     });
//   }

//   if (portfolioCloseBtn && popupForm) {
//     const handleClose = (e) => {
//       e.preventDefault();
//       e.stopPropagation();
//       e.stopImmediatePropagation();
//       closeModal(popupForm);
//       return false;
//     };

//     portfolioCloseBtn.addEventListener("click", handleClose);
//     portfolioCloseBtn.addEventListener("touchend", handleClose, {
//       passive: false,
//     });
//   }

//   if (popupForm) {
//     popupForm.addEventListener("click", (e) => {
//       if (e.target === popupForm) {
//         e.preventDefault();
//         closeModal(popupForm);
//       }
//     });
//   }

//   if (userForm && portfolioSubmitBtn) {
//     userForm.addEventListener("submit", async (e) => {
//       e.preventDefault();

//       const btnText = portfolioSubmitBtn.querySelector(".btn-text");
//       const loader = portfolioSubmitBtn.querySelector(".loader");

//       loader.classList.remove("hidden");
//       btnText.style.display = "none";
//       portfolioSubmitBtn.disabled = true;

//       const name = userForm
//         .querySelector('input[placeholder="Your Name"]')
//         .value.trim();
//       const email = userForm
//         .querySelector('input[placeholder="Email ID"]')
//         .value.trim();
//       const phone = document
//         .getElementById("portfolioPhoneNumber")
//         .value.trim();
//       const countryCode = document.getElementById("portfolioCountryCode").value;
//       const fullPhone = countryCode + phone;

//       const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       const phonePattern = /^\d{10,15}$/;

//       if (!name || !emailPattern.test(email) || !phonePattern.test(phone)) {
//         alert("Please fill all fields correctly.");
//         loader.classList.add("hidden");
//         btnText.style.display = "inline";
//         portfolioSubmitBtn.disabled = false;
//         return;
//       }

//       try {
//         const formData = {
//           name: name,
//           email: email,
//           phone: fullPhone,
//           timestamp: new Date().toLocaleString(),
//         };

//         await Promise.allSettled([
//           submitToGoogleSheets(formData, "portfolio"),
//           sendEmail(
//             name,
//             email,
//             fullPhone,
//             "New Portfolio Request - Diwizon",
//             "Portfolio Download Request"
//           ),
//         ]);

//         closeModal(popupForm);
//         sessionStorage.setItem("openPDF", "true");
//         window.open("thankyou.html", "_blank");
//         userForm.reset();
//       } catch (error) {
//         alert("Something went wrong. Please try again.");
//       } finally {
//         loader.classList.add("hidden");
//         btnText.style.display = "inline";
//         portfolioSubmitBtn.disabled = false;
//       }
//     });
//   }

//   // === GET QUOTE FORM ===
//   const quoteBtns = document.querySelectorAll(".getQuoteBtn");
//   const getQuotePopupForm = document.getElementById("getQuotepopupForm");
//   const quoteCloseBtn = document.querySelector(".quote-close");
//   const getQuoteUserForm = document.getElementById("getQuoteuserForm");
//   const quoteSubmitBtn = document.getElementById("quoteSubmitBtn");

//   if (quoteBtns.length > 0 && getQuotePopupForm) {
//     quoteBtns.forEach((btn) => {
//       btn.addEventListener("click", (e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         openModal(getQuotePopupForm);
//       });
//     });
//   }

//   if (quoteCloseBtn && getQuotePopupForm) {
//     const handleClose = (e) => {
//       e.preventDefault();
//       e.stopPropagation();
//       e.stopImmediatePropagation();
//       closeModal(getQuotePopupForm);
//       return false;
//     };

//     quoteCloseBtn.addEventListener("click", handleClose);
//     quoteCloseBtn.addEventListener("touchend", handleClose, { passive: false });
//   }

//   if (getQuotePopupForm) {
//     getQuotePopupForm.addEventListener("click", (e) => {
//       if (e.target === getQuotePopupForm) {
//         e.preventDefault();
//         closeModal(getQuotePopupForm);
//       }
//     });
//   }

//   if (getQuoteUserForm && quoteSubmitBtn) {
//     getQuoteUserForm.addEventListener("submit", async (e) => {
//       e.preventDefault();

//       const btnText = quoteSubmitBtn.querySelector(".btn-text");
//       const loader = quoteSubmitBtn.querySelector(".loader");

//       loader.classList.remove("hidden");
//       btnText.style.display = "none";
//       quoteSubmitBtn.disabled = true;

//       const name = getQuoteUserForm
//         .querySelector('input[placeholder="Your Name"]')
//         .value.trim();
//       const email = getQuoteUserForm
//         .querySelector('input[placeholder="Email ID"]')
//         .value.trim();
//       const phone = document.getElementById("quotePhoneNumber").value.trim();
//       const countryCode = document.getElementById("quoteCountryCode").value;
//       const fullPhone = countryCode + phone;

//       const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       const phonePattern = /^\d{10,15}$/;

//       if (!name || !emailPattern.test(email) || !phonePattern.test(phone)) {
//         alert("Please fill all fields correctly.");
//         loader.classList.add("hidden");
//         btnText.style.display = "inline";
//         quoteSubmitBtn.disabled = false;
//         return;
//       }

//       try {
//         const formData = {
//           name: name,
//           email: email,
//           phone: fullPhone,
//           timestamp: new Date().toLocaleString(),
//         };

//         await Promise.allSettled([
//           submitToGoogleSheets(formData, "quote"),
//           sendEmail(
//             name,
//             email,
//             fullPhone,
//             "New Get Quote Request - Diwizon",
//             "Get Quote Request"
//           ),
//         ]);

//         closeModal(getQuotePopupForm);

//         setTimeout(() => {
//           window.location.href = "getthankyou.html";
//         }, 300);

//         getQuoteUserForm.reset();
//       } catch (error) {
//         alert("Something went wrong. Please try again.");
//       } finally {
//         loader.classList.add("hidden");
//         btnText.style.display = "inline";
//         quoteSubmitBtn.disabled = false;
//       }
//     });
//   }

//   // === ESC KEY TO CLOSE ===
//   document.addEventListener("keydown", (e) => {
//     if (e.key === "Escape") {
//       if (popupForm && !popupForm.classList.contains("hidden")) {
//         e.preventDefault();
//         closeModal(popupForm);
//       }
//       if (
//         getQuotePopupForm &&
//         !getQuotePopupForm.classList.contains("hidden")
//       ) {
//         e.preventDefault();
//         closeModal(getQuotePopupForm);
//       }
//     }
//   });

//   // === PREVENT BACKGROUND SCROLL ===
//   document.addEventListener(
//     "touchmove",
//     (e) => {
//       const isPortfolioOpen =
//         popupForm && !popupForm.classList.contains("hidden");
//       const isQuoteOpen =
//         getQuotePopupForm && !getQuotePopupForm.classList.contains("hidden");

//       if (isPortfolioOpen || isQuoteOpen) {
//         const modalContent = document.querySelector(".popup-content");
//         if (modalContent && modalContent.contains(e.target)) {
//           return;
//         }
//         e.preventDefault();
//       }
//     },
//     { passive: false }
//   );

//   document.addEventListener(
//     "wheel",
//     (e) => {
//       const isPortfolioOpen =
//         popupForm && !popupForm.classList.contains("hidden");
//       const isQuoteOpen =
//         getQuotePopupForm && !getQuotePopupForm.classList.contains("hidden");

//       if (isPortfolioOpen || isQuoteOpen) {
//         const modalContent = document.querySelector(".popup-content");
//         if (modalContent && !modalContent.contains(e.target)) {
//           e.preventDefault();
//         }
//       }
//     },
//     { passive: false }
//   );
// });
