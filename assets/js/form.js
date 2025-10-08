document.addEventListener("DOMContentLoaded", () => {
  const portfolioBtns = document.querySelectorAll(".portfolioBtn");
  const popupForm = document.getElementById("popupForm");
  const closeBtn = document.getElementById("closeBtn");
  const userForm = document.getElementById("userForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn.querySelector(".btn-text");
  const loader = submitBtn.querySelector(".loader");

  let scrollPosition = 0;

  // ✅ Open popup without scroll or jump
  portfolioBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault(); // stops anchor jump
      e.stopPropagation();

      // store current scroll position
      scrollPosition = window.scrollY;

      // lock scroll
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.width = "100%";

      popupForm.classList.remove("hidden");
      document.body.classList.add("modal-open");
    });
  });

  // ✅ Close popup
  function closeModal() {
    popupForm.classList.add("hidden");
    document.body.classList.remove("modal-open");

    // unlock scroll
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";

    window.scrollTo(0, scrollPosition);
  }

  closeBtn.addEventListener("click", closeModal);

  window.addEventListener("click", (e) => {
    if (e.target === popupForm) {
      closeModal();
    }
  });

  // ✅ Form submit
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
      emails: ["aadil18122001@gmail.com"],
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
      alert("Something went wrong. Please try again.");
      console.error(error);
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
