document.addEventListener("DOMContentLoaded", () => {
  const portfolioBtns = document.querySelectorAll(".portfolioBtn");
  const popupForm = document.getElementById("popupForm");
  const closeBtn = document.getElementById("closeBtn");
  const userForm = document.getElementById("userForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn.querySelector(".btn-text");
  const loader = submitBtn.querySelector(".loader");

  // ✅ FIX: Loop through all buttons
  portfolioBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      popupForm.classList.remove("hidden");
      document.body.classList.add("modal-open");
    });
  });

  function closeModal() {
    popupForm.classList.add("hidden");
    document.body.classList.remove("modal-open");
  }

  closeBtn.addEventListener("click", closeModal);

  window.addEventListener("click", (e) => {
    if (e.target === popupForm) {
      closeModal();
    }
  });

  userForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Show loader and disable button
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
    const phonePattern = /^\+?\d{10,15}$/;

    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      resetButton();
      return;
    }

    if (!phonePattern.test(fullPhone)) {
      alert("Please enter a valid phone number with country code.");
      resetButton();
      return;
    }

    const data = {
      emails: ["aadil18122001@gmail.com"], // your email
      subject: "New form submitted.",
      message: `
        <strong>Name:</strong> ${name}<br/>
        <strong>Phone Number:</strong> ${fullPhone}<br/>
        <strong>Email:</strong> ${email}<br/>
      `,
    };

    try {
      await fetch("https://mailer-5x4h33dpla-uc.a.run.app/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      closeModal();
      window.open("assets/diwizon-work.pdf", "_blank");
      userForm.reset();
    } catch (error) {
      console.error("Form submission failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      resetButton();
    }
  });

  function resetButton() {
    loader.classList.add("hidden");
    btnText.style.display = "inline";
    submitBtn.disabled = false;
  }
});
