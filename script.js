document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();

  initBlogSwiper();

  loadVideoReviews();

  initVideoModal();

   initBlogModal();   
  initAnnouncements();
});

/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function initMobileNav() {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  function closeMenu() {
    navLinks?.classList.remove("active");

    const icon = hamburger?.querySelector("i");

    if (icon) {
      icon.classList.remove("ri-close-line");
      icon.classList.add("ri-menu-3-line");
    }
  }

  hamburger?.addEventListener("click", () => {
    const isOpen = navLinks?.classList.toggle("active");

    const icon = hamburger.querySelector("i");

    if (icon) {
      icon.classList.toggle("ri-close-line", isOpen);
      icon.classList.toggle("ri-menu-3-line", !isOpen);
    }
  });

  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (e) => {
    if (
      navLinks?.classList.contains("active") &&
      !navLinks.contains(e.target) &&
      !hamburger?.contains(e.target)
    ) {
      closeMenu();
    }
  });
}

/* =========================================================
   BLOG SWIPER
========================================================= */

function initBlogSwiper() {
  if (!document.querySelector(".blogSwiper")) return;

  new Swiper(".blogSwiper", {
    slidesPerView: 3,
    spaceBetween: 10,
    loop: true,

    pagination: {
      el: ".blogSwiper .swiper-pagination",
      clickable: true,
    },

    breakpoints: {
      0: { slidesPerView: 1 },
      600: { slidesPerView: 1 },
      900: { slidesPerView: 2 },
      1200: { slidesPerView: 3 },
    },
  });
}

/* =========================================================
   VIDEO REVIEWS API
========================================================= */
async function loadVideoReviews() {
  try {
    const response = await fetch(
      "http://localhost:8080/api/Blog?pageNumber=1&pageSize=10",
    );

    const data = await response.json();

    console.log("API RAW RESPONSE:", data);

    const blogs = data.items || data.data || [];

    console.log("TOTAL BLOGS FROM API:", blogs.length);
    console.table(blogs);

    const wrapper = document.getElementById("videoReviewWrapper");
    if (!wrapper) return;

    wrapper.innerHTML = "";

    blogs.forEach((blog, index) => {
      console.log(`Video ${index + 1}`, {
        title: blog.title,
        youtube: blog.youTubeUrl,
      });

      if (!blog.youTubeUrl) return;

      const videoId = extractYoutubeId(blog.youTubeUrl);

      const slide = document.createElement("div");
      slide.className = "swiper-slide";

      slide.innerHTML = `
        <div
          class="video-card"
          data-video="https://www.youtube.com/embed/${videoId}"
          data-title="${blog.title || ""}"
          data-desc="${blog.description || ""}"
        >
          <div class="thumbnail">
            <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg"/>
            <div class="play-icon">
              <i class="ri-play-fill"></i>
            </div>
          </div>

          <div class="video-info">
            <h3>${blog.title || ""}</h3>
            <p>${blog.description || ""}</p>
          </div>
        </div>
      `;

      wrapper.appendChild(slide);
    });

    console.log("Slides added to DOM:", wrapper.children.length);

    initVideoSwiper();
  } catch (error) {
    console.error("Video API Error:", error);
  }
}

/* =========================================================
   YOUTUBE ID EXTRACTOR
========================================================= */

function extractYoutubeId(url) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;

  const match = url.match(regex);

  return match ? match[1] : "";
}

/* =========================================================
   VIDEO SWIPER
========================================================= */

function initVideoSwiper() {
  if (!document.querySelector(".videoReviewSwiper")) return;

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
      1024: { slidesPerView: 3 },
    },
  });
}

/* =========================================================
   VIDEO MODAL
========================================================= */

function initVideoModal() {
  const modal = document.getElementById("videoModal");
  if (!modal) return;

  const frame = document.getElementById("videoFrame");
  const title = document.getElementById("videoTitle");
  const desc = document.getElementById("videoDescription");

  const closeBtn = modal.querySelector(".video-close");
  const overlay = modal.querySelector(".video-overlay");

  const openModal = (card) => {
    frame.src = (card.dataset.video || "") + "?autoplay=1";

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

/* =========================================================
   ANNOUNCEMENTS  — Dynamic via API
========================================================= */

async function initAnnouncements() {
  const modal         = document.querySelector("#announcementModal");
  const overlay       = document.querySelector(".announcement-overlay");
  const closeBtn      = document.querySelector(".announcement-close");
  const floatBtn      = document.querySelector("#announcementFloat");
  const chatPanel     = document.querySelector("#announcementChat");
  const chatClose     = document.querySelector("#chatClose");
  const listContainer = document.querySelector("#announcementList");
  const chatBody      = document.querySelector("#chatBody");

  if (!modal) return;

  /* ---------- helpers ---------- */

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function renderItem(ann) {
    /* ---- modal list item ---- */
    const item = document.createElement("div");
    item.className = "announcement-item";

    item.innerHTML = `
      <div class="ann-text">${ann.title || ann.message || ann.description || ""}</div>
      ${ann.description && ann.title ? `<div class="ann-desc">${ann.description}</div>` : ""}
      ${ann.startDate ? `<div class="ann-date" style="margin-top:10px">📅 ${formatDate(ann.startDate)}</div>` : ""}
    `;

    listContainer?.appendChild(item);

    /* ---- chat panel clone ---- */
    const chatItem = document.createElement("div");
    chatItem.className = "announcement-item";
    chatItem.innerHTML = item.innerHTML;
    chatBody?.appendChild(chatItem);
  }

  function openModal() {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  /* ---------- fetch ---------- */

  let announcements = [];

  try {
    const res = await fetch("http://localhost:8080/api/Announcement/active");

    const text = await res.text();
    if (!text || !text.trim()) {
      console.warn("Announcement API: empty response — check your token or endpoint.");
      return;
    }

    const data = JSON.parse(text);

    /* support both array root and wrapped { items: [] } */
    announcements = Array.isArray(data)
      ? data
      : data.items || data.data || [];

    /* keep only Active announcements */
    announcements = announcements.filter(
      (a) => !a.status || a.status === "Active"
    );

    console.log("Announcements loaded:", announcements.length);
  } catch (err) {
    console.error("Announcement API Error:", err);

    /* graceful fallback — show nothing rather than crash */
    announcements = [];
  }

  /* ---------- render ---------- */

  if (announcements.length === 0) {
    /* No announcements — hide float button too */
    floatBtn?.style && (floatBtn.style.display = "none");
    return;
  }

  announcements.forEach(renderItem);

  openModal();

  /* ---------- event listeners ---------- */

  closeBtn?.addEventListener("click", closeModal);
  overlay?.addEventListener("click",  closeModal);

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


/* =========================================================
   BLOG MODAL
========================================================= */

function initBlogModal() {

  const modal = document.getElementById("blogModal");

  if (!modal) return;

  const modalImage = document.getElementById("modalImage");
  const modalAuthor = document.getElementById("modalAuthor");
  const modalDate = document.getElementById("modalDate");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDescription");

  const closeBtn = modal.querySelector(".modal-close");
  const overlay = modal.querySelector(".modal-overlay");

  const openModal = (card) => {

    const img = card.querySelector("img").src;
    const author = card.querySelector(".meta span:nth-child(1)").textContent;
    const date = card.querySelector(".meta span:nth-child(2)").textContent;
    const title = card.querySelector(".blog-title").textContent;
    const desc = card.querySelector(".blog-desc").textContent;

    modalImage.src = img;
    modalAuthor.textContent = author;
    modalDate.textContent = date;
    modalTitle.textContent = title;
    modalDesc.textContent = desc;

    modal.classList.add("active");

    document.body.style.overflow = "hidden";

  };

  const closeModal = () => {

    modal.classList.remove("active");

    document.body.style.overflow = "auto";

  };

  document.addEventListener("click", (e) => {

    const link = e.target.closest(".details-link");

    if (!link) return;

    e.preventDefault();

    const card = link.closest(".blog-card");

    openModal(card);

  });

  closeBtn?.addEventListener("click", closeModal);

  overlay?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") closeModal();

  });

}