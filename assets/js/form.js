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
    if (window.ScrollSmoother) {
      smoother = ScrollSmoother.get();
      console.log("ScrollSmoother detected:", smoother);
    }
  }, 500);

  // ✅ Open popup WITHOUT scroll jump
  portfolioBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Store current scroll position
      if (smoother) {
        scrollPosition = smoother.scrollTop();
        console.log("Stored ScrollSmoother position:", scrollPosition);
        smoother.paused(true);
      } else {
        scrollPosition = window.scrollY;
        console.log("Stored window scroll position:", scrollPosition);
      }

      // Show modal
      popupForm.classList.remove("hidden");
      document.body.classList.add("modal-open");

      // Prevent scroll
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
      document.body.style.position = "fixed";
      // lock at the current scroll position
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    });
  });

  function closeModal(shouldRefresh = false) {
    popupForm.classList.add("hidden");
    document.body.classList.remove("modal-open");

    // Remove fixed styles first
    const topPx = document.body.style.top;
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.height = "";
    document.body.style.position = "";
    document.body.style.width = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    // also clear any html overflow just in case
    document.documentElement.style.overflow = "";

    // Delay restoring scroll to allow layout to settle
    setTimeout(() => {
      if (!smoother) {
        const lockedOffset = topPx
          ? Math.abs(parseInt(topPx, 10))
          : scrollPosition;
        window.scrollTo(0, lockedOffset || 0);
      } else {
        smoother.paused(false);
        smoother.scrollTo(scrollPosition, false);
      }
    }, 50);

    if (shouldRefresh) {
      setTimeout(() => {
        location.reload();
      }, 1000);
    }
  }

  // Manual close events (refresh after close)
  closeBtn.addEventListener("click", () => closeModal(true));

  window.addEventListener("click", (e) => {
    if (e.target === popupForm) {
      closeModal();
    }
  });

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
      closeModal(true); // Triggers page refresh after closing

      setTimeout(() => {
        window.open("assets/diwizon-work.pdf", "_blank");
      }, 300);

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

  // 🔒 Prevent scroll while modal is open on mobile
  let touchStartY = 0;

  document.addEventListener(
    "touchstart",
    (e) => {
      if (!popupForm.classList.contains("hidden")) {
        touchStartY = e.touches[0].clientY;
      }
    },
    { passive: false }
  );

  document.addEventListener(
    "touchmove",
    (e) => {
      if (!popupForm.classList.contains("hidden")) {
        const modalContent = document.querySelector(".popup-content");
        if (!modalContent.contains(e.target)) {
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
        if (!modalContent.contains(e.target)) {
          e.preventDefault();
        }
      }
    },
    { passive: false }
  );
});
