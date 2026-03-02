document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
  
    if (hamburger) {
      hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
  
        // Toggle icon between menu and close
        const icon = hamburger.querySelector('i');
        if (navLinks.classList.contains('active')) {
          icon.classList.remove('ri-menu-3-line');
          icon.classList.add('ri-close-line');
        } else {
          icon.classList.remove('ri-close-line');
          icon.classList.add('ri-menu-3-line');
        }
      });
    }
  
    // Swiper initialization
    var swiper = new Swiper(".blogSwiper", {
      slidesPerView: 3,
      spaceBetween: 10,
      loop: true,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      breakpoints: {
        0: { slidesPerView: 1, spaceBetween: 10 },
        600: { slidesPerView: 1, spaceBetween: 10 },
        900: { slidesPerView: 2, spaceBetween: 10 },
        1200: { slidesPerView: 3, spaceBetween: 10 },
      },
    });
  });
  

  // ===================
  const modal = document.getElementById("blogModal");
  const modalImage = document.getElementById("modalImage");
  const modalTitle = document.getElementById("modalTitle");
  const modalAuthor = document.getElementById("modalAuthor");
  const modalDate = document.getElementById("modalDate");
  const modalDescription = document.getElementById("modalDescription");

  document.querySelectorAll(".details-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const card = link.closest(".blog-card");

      modalImage.src = card.querySelector("img").src;
      modalTitle.textContent = card.querySelector(".blog-title").textContent;
      modalDescription.textContent =
        card.querySelector(".blog-desc").textContent;

      modalAuthor.textContent =
        card.querySelector(".meta span:first-child").textContent;
      modalDate.textContent =
        card.querySelector(".meta span:last-child").textContent;

      modal.classList.add("active");
    });
  });

  document.querySelector(".modal-close").addEventListener("click", closeModal);
  document.querySelector(".modal-overlay").addEventListener("click", closeModal);

  function closeModal() {
    modal.classList.remove("active");
  }


  // ===============================
  /* =========================================================
   PATIENT VIDEO TESTIMONIALS LOGIC
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initVideoSwiper();
  initVideoModal();
});

/* =========================
   VIDEO SWIPER
========================= */

function initVideoSwiper() {
  const swiperEl = document.querySelector(".videoReviewSwiper");
  if (!swiperEl) return;

  new Swiper(".videoReviewSwiper", {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".videoReviewSwiper .swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
  });
}

/* =========================
   VIDEO MODAL
========================= */

function initVideoModal() {
  const modal = document.getElementById("videoModal");
  if (!modal) return;

  const frame = document.getElementById("videoFrame");
  const title = document.getElementById("videoTitle");
  const desc = document.getElementById("videoDescription");

  const closeBtn = modal.querySelector(".video-close");
  const overlay = modal.querySelector(".video-overlay");

  const openModal = (card) => {
    frame.src = card.dataset.video + "?autoplay=1";
    title.textContent = card.dataset.title || "";
    desc.textContent = card.dataset.desc || "";

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.classList.remove("active");
    frame.src = "";
    document.body.style.overflow = "auto";
  };

  /* ===== Event Delegation (Swiper loop safe) ===== */
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".video-card");
    if (!card) return;

    openModal(card);
  });

  closeBtn?.addEventListener("click", closeModal);
  overlay?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

// =============================ANNOUNCEMENT JS=============================
document.addEventListener("DOMContentLoaded", () => {
  initAnnouncements();
});

function initAnnouncements() {

  const announcements = [
    "Clinic will remain closed on Sunday.",
    "Free Health Checkup Camp on 10th December.",
    "Special Discount on Physiotherapy this week."
  ];

  const modal = document.querySelector("#announcementModal");
  const overlay = document.querySelector(".announcement-overlay");
  const closeBtn = document.querySelector(".announcement-close");

  const floatBtn = document.querySelector("#announcementFloat");
  const chatPanel = document.querySelector("#announcementChat");
  const chatClose = document.querySelector("#chatClose");

  const listContainer = document.querySelector("#announcementList");
  const chatBody = document.querySelector("#chatBody");

  if (!modal) return;

  /* ================= RENDER ANNOUNCEMENTS ================= */

  function renderAnnouncements() {
    if (!announcements.length) return;

    announcements.forEach(text => {
      const item = document.createElement("div");
      item.className = "announcement-item";
      item.textContent = text;

      listContainer?.appendChild(item);
      chatBody?.appendChild(item.cloneNode(true));
    });
  }

  /* ================= MODAL CONTROL ================= */

  function openModal() {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  /* ================= AUTO OPEN IF ANNOUNCEMENT EXISTS ================= */

  if (announcements.length > 0) {
    renderAnnouncements();
    openModal();
  }

  /* ================= EVENT LISTENERS ================= */

  closeBtn?.addEventListener("click", closeModal);
  overlay?.addEventListener("click", closeModal);

  floatBtn?.addEventListener("click", () => {
    chatPanel?.classList.toggle("active");
  });

  chatClose?.addEventListener("click", () => {
    chatPanel?.classList.remove("active");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}