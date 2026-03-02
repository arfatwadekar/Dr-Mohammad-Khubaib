document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  // ── Helper: close the mobile menu ──
  function closeMenu() {
    navLinks.classList.remove('active');
    const icon = hamburger?.querySelector('i');
    if (icon) {
      icon.classList.remove('ri-close-line');
      icon.classList.add('ri-menu-3-line');
    }
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('active');
      const icon = hamburger.querySelector('i');
      if (icon) {
        icon.classList.toggle('ri-close-line', isOpen);
        icon.classList.toggle('ri-menu-3-line', !isOpen);
      }
    });
  }

  // ✅ Close menu when any nav link is clicked
  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // ✅ Close menu when clicking outside nav
  document.addEventListener('click', (e) => {
    if (
      navLinks?.classList.contains('active') &&
      !navLinks.contains(e.target) &&
      !hamburger?.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // ── Blog Swiper ──
  new Swiper(".blogSwiper", {
    slidesPerView: 3,
    spaceBetween: 10,
    loop: true,
    pagination: {
      el: ".blogSwiper .swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      0:    { slidesPerView: 1, spaceBetween: 10 },
      600:  { slidesPerView: 1, spaceBetween: 10 },
      900:  { slidesPerView: 2, spaceBetween: 10 },
      1200: { slidesPerView: 3, spaceBetween: 10 },
    },
  });

  // ── Video Swiper ──
  initVideoSwiper();
  initVideoModal();

  // ── Announcements ──
  initAnnouncements();
});


// ===================
// BLOG MODAL
// ===================
const modal        = document.getElementById("blogModal");
const modalImage   = document.getElementById("modalImage");
const modalTitle   = document.getElementById("modalTitle");
const modalAuthor  = document.getElementById("modalAuthor");
const modalDate    = document.getElementById("modalDate");
const modalDesc    = document.getElementById("modalDescription");

document.querySelectorAll(".details-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const card = link.closest(".blog-card");

    modalImage.src          = card.querySelector("img").src;
    modalTitle.textContent  = card.querySelector(".blog-title").textContent;
    modalDesc.textContent   = card.querySelector(".blog-desc").textContent;
    modalAuthor.textContent = card.querySelector(".meta span:first-child").textContent;
    modalDate.textContent   = card.querySelector(".meta span:last-child").textContent;

    modal.classList.add("active");
  });
});

document.querySelector(".modal-close")?.addEventListener("click", closeBlogModal);
document.querySelector(".modal-overlay")?.addEventListener("click", closeBlogModal);

function closeBlogModal() {
  modal?.classList.remove("active");
}


// ===================
// VIDEO SWIPER
// ===================
function initVideoSwiper() {
  if (!document.querySelector(".videoReviewSwiper")) return;

  new Swiper(".videoReviewSwiper", {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    autoplay: { delay: 3000, disableOnInteraction: false },
    pagination: {
      el: ".videoReviewSwiper .swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      768:  { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  });
}


// ===================
// VIDEO MODAL
// ===================
function initVideoModal() {
  const modal   = document.getElementById("videoModal");
  if (!modal) return;

  const frame   = document.getElementById("videoFrame");
  const title   = document.getElementById("videoTitle");
  const desc    = document.getElementById("videoDescription");
  const closeBtn = modal.querySelector(".video-close");
  const overlay  = modal.querySelector(".video-overlay");

  const openModal = (card) => {
    frame.src          = (card.dataset.video || "") + "?autoplay=1";
    title.textContent  = card.dataset.title || "";
    desc.textContent   = card.dataset.desc  || "";
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.classList.remove("active");
    frame.src = "";
    document.body.style.overflow = "auto";
  };

  // Event delegation (Swiper loop safe)
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".video-card");
    if (card) openModal(card);
  });

  closeBtn?.addEventListener("click", closeModal);
  overlay?.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}


// ===================
// ANNOUNCEMENTS
// ===================
function initAnnouncements() {
  const announcements = [
    "Clinic will remain closed on Sunday.",
    "Free Health Checkup Camp on 10th December.",
    "Special Discount on Physiotherapy this week.",
  ];

  const modal         = document.querySelector("#announcementModal");
  const overlay       = document.querySelector(".announcement-overlay");
  const closeBtn      = document.querySelector(".announcement-close");
  const floatBtn      = document.querySelector("#announcementFloat");
  const chatPanel     = document.querySelector("#announcementChat");
  const chatClose     = document.querySelector("#chatClose");
  const listContainer = document.querySelector("#announcementList");
  const chatBody      = document.querySelector("#chatBody");

  if (!modal) return;

  function renderAnnouncements() {
    announcements.forEach(text => {
      const item = document.createElement("div");
      item.className   = "announcement-item";
      item.textContent = text;
      listContainer?.appendChild(item);
      chatBody?.appendChild(item.cloneNode(true));
    });
  }

  function openModal()  { modal.classList.add("active");    document.body.style.overflow = "hidden"; }
  function closeModal() { modal.classList.remove("active"); document.body.style.overflow = "auto";   }

  if (announcements.length > 0) {
    renderAnnouncements();
    openModal();
  }

  closeBtn?.addEventListener("click", closeModal);
  overlay?.addEventListener("click", closeModal);

  floatBtn?.addEventListener("click", () => chatPanel?.classList.toggle("active"));
  chatClose?.addEventListener("click", () => chatPanel?.classList.remove("active"));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}