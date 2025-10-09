document.addEventListener("DOMContentLoaded", () => {
  const portfolioBtns = document.querySelectorAll(".portfolioBtn");
  const popupForm = document.getElementById("popupForm");
  const closeBtn = document.getElementById("closeBtn");
  const userForm = document.getElementById("userForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn.querySelector(".btn-text");
  const loader = submitBtn.querySelector(".loader");

  let scrollPosition = 0;
  let smoother = null;

  // 🎯 Get ScrollSmoother instance after it initializes
  setTimeout(() => {
    if (window.ScrollSmoother && window.ScrollSmoother.get) {
      smoother = window.ScrollSmoother.get();
      console.log("✅ ScrollSmoother detected:", smoother);
    } else {
      console.log("⚠️ ScrollSmoother not found");
    }
  }, 1000);

  // ✅ Open popup WITHOUT scroll jump
  portfolioBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Store current scroll position BEFORE any changes
      if (smoother) {
        // Get current scroll position from ScrollSmoother
        scrollPosition = smoother.scrollTop();
        console.log("📍 Stored ScrollSmoother position:", scrollPosition);

        // Pause ScrollSmoother
        smoother.paused(true);
      } else {
        // Fallback to regular scroll
        scrollPosition =
          window.pageYOffset || document.documentElement.scrollTop;
        console.log("📍 Stored window scroll position:", scrollPosition);
      }

      // Show modal
      popupForm.classList.remove("hidden");
      document.body.classList.add("modal-open");

      // Lock body scroll
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    });
  });

  // ✅ Close modal function - CRITICAL FIX FOR SCROLLSMOOTHER
  function closeModal() {
    console.log("🔄 Closing modal, will restore scroll to:", scrollPosition);

    // Hide modal
    popupForm.classList.add("hidden");
    document.body.classList.remove("modal-open");

    // Get the stored scroll value from body.style.top as backup
    const topValue = document.body.style.top;
    const savedScrollPosition = topValue
      ? Math.abs(parseInt(topValue, 10))
      : scrollPosition;

    console.log("💾 Saved scroll position:", savedScrollPosition);

    // Remove ALL fixed positioning styles
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";

    // CRITICAL FIX: Different approach for ScrollSmoother
    if (smoother) {
      console.log("🔧 Using ScrollSmoother restoration");

      // Resume smoother FIRST
      smoother.paused(false);

      // IMPORTANT: Use scrollTo() not scrollTop() for setting position
      // scrollTo() has different parameters than scrollTop()
      requestAnimationFrame(() => {
        // Method 1: Direct scrollTo with instant flag
        smoother.scrollTo(savedScrollPosition, false);

        console.log(
          "✅ ScrollSmoother scroll restored to:",
          savedScrollPosition
        );

        // Verify restoration
        setTimeout(() => {
          const currentPos = smoother.scrollTop();
          console.log("🔍 Current position after restore:", currentPos);

          // If position didn't restore correctly, force it
          if (Math.abs(currentPos - savedScrollPosition) > 10) {
            console.warn("⚠️ Position mismatch, forcing restore");
            smoother.scrollTo(savedScrollPosition, false);
          }
        }, 100);
      });
    } else {
      console.log("🔧 Using window scroll restoration");
      // For regular scroll, restore immediately
      requestAnimationFrame(() => {
        window.scrollTo(0, savedScrollPosition);
        console.log("✅ Window scroll restored to:", savedScrollPosition);
      });
    }
  }

  // ✅ Close button
  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  });

  // ✅ Click outside to close
  window.addEventListener("click", (e) => {
    if (e.target === popupForm) {
      closeModal();
    }
  });

  // ✅ ESC key to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !popupForm.classList.contains("hidden")) {
      closeModal();
    }
  });

  // ✅ Form submit with validation
  userForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    loader.classList.remove("hidden");
    btnText.style.display = "none";
    submitBtn.disabled = true;

    const name = userForm
      .querySelector('input[placeholder="Your Name"]')
      .value.trim();
    const email = userForm
      .querySelector('input[placeholder="Email ID"]')
      .value.trim();
    const phone = document.getElementById("phoneNumber").value.trim();
    const countryCode = document.getElementById("countryCode").value;
    const fullPhone = countryCode + phone;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\d{10,15}$/;

    if (!name) {
      alert("Please enter your name.");
      resetButton();
      return;
    }

    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      resetButton();
      return;
    }

    if (!phonePattern.test(phone)) {
      alert("Please enter a valid phone number (10-15 digits).");
      resetButton();
      return;
    }

    const data = {
      emails: ["aadil18122001@gmail.com"],
      subject: "New Portfolio Request - Diwizon",
      message: `
        <h2>New Portfolio Download Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone Number:</strong> ${fullPhone}</p>
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

      // ✅ Success: close modal and open PDF
      closeModal();

      // Open PDF in new tab after modal closes
      setTimeout(() => {
        window.open("assets/diwizon-work.pdf", "_blank");
      }, 400);

      // Reset form
      userForm.reset();
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Something went wrong. Please try again or contact us directly.");
    } finally {
      resetButton();
    }
  });

  function resetButton() {
    loader.classList.add("hidden");
    btnText.style.display = "inline";
    submitBtn.disabled = false;
  }

  // 🔒 Prevent background scroll while modal is open
  document.addEventListener(
    "touchmove",
    (e) => {
      if (!popupForm.classList.contains("hidden")) {
        const modalContent = document.querySelector(".popup-content");
        // Only prevent if touching outside modal content
        if (modalContent && !modalContent.contains(e.target)) {
          e.preventDefault();
        }
      }
    },
    { passive: false }
  );

  document.addEventListener(
    "wheel",
    (e) => {
      if (!popupForm.classList.contains("hidden")) {
        const modalContent = document.querySelector(".popup-content");
        // Only prevent if scrolling outside modal content
        if (modalContent && !modalContent.contains(e.target)) {
          e.preventDefault();
        }
      }
    },
    { passive: false }
  );
});
