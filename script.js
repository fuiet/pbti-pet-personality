document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  const form = document.querySelector(".quote-form");

  const updateHeader = () => {
    if (window.scrollY > 30) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.textContent = isOpen ? "×" : "☰";
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      nav?.classList.remove("open");
      menuToggle?.setAttribute("aria-expanded", "false");
      if (menuToggle) menuToggle.textContent = "☰";
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.querySelectorAll(".faq-item").forEach((item) => {
    item.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach((faq) => faq.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });

  const revealElements = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealElements.forEach((el) => observer.observe(el));

  document.querySelectorAll(".btn, .quote-form button, .nav-cta").forEach((button) => {
    button.addEventListener("pointerdown", () => button.style.transform = "scale(.97)");
    button.addEventListener("pointerup", () => button.style.transform = "");
    button.addEventListener("pointerleave", () => button.style.transform = "");
  });

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const submit = form.querySelector("button");
      const originalText = submit.textContent;
      submit.textContent = "Demo request captured ✓";
      submit.disabled = true;
      setTimeout(() => {
        alert("This is a private website demo. In a real project, this form would send quote requests to the business owner.");
        submit.textContent = originalText;
        submit.disabled = false;
      }, 350);
    });
  }
});
