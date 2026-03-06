document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initBlogSwiper();
  initVideoModal();
  initBlogModal();

  // Non-critical — defer after paint
  requestIdleCallback
    ? requestIdleCallback(() => {
        loadVideoReviews();
        initAnnouncements();
      })
    : setTimeout(() => {
        loadVideoReviews();
        initAnnouncements();
      }, 100);
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

  navLinks?.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", closeMenu)
  );

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
    pagination: { el: ".blogSwiper .swiper-pagination", clickable: true },
    breakpoints: {
      0:    { slidesPerView: 1 },
      600:  { slidesPerView: 1 },
      900:  { slidesPerView: 2 },
      1200: { slidesPerView: 3 },
    },
  });
}

/* =========================================================
   YOUTUBE ID EXTRACTOR
========================================================= */

function extractYoutubeId(url) {
  const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  return match ? match[1] : "";
}

/* =========================================================
   SKELETON LOADER  — shows while API fetches
========================================================= */

function showVideoSkeletons(wrapper, count = 3) {
  wrapper.innerHTML = Array.from({ length: count })
    .map(
      () => `
    <div class="swiper-slide">
      <div class="video-skeleton">
        <div class="skeleton-thumb skeleton-pulse"></div>
        <div class="skeleton-line skeleton-pulse" style="width:80%;margin-top:12px"></div>
        <div class="skeleton-line skeleton-pulse" style="width:55%;margin-top:8px"></div>
      </div>
    </div>`
    )
    .join("");
}

/* =========================================================
   VIDEO REVIEWS API   (with lazy / intersection-based load)
========================================================= */

async function loadVideoReviews() {
  const wrapper = document.getElementById("videoReviewWrapper");
  if (!wrapper) return;

  /* Show skeletons immediately so the section isn't blank */
  showVideoSkeletons(wrapper);

  let blogs = [];

  try {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 8000); // 8 s timeout

    const response = await fetch(
      "http://localhost:8080/api/Blog?pageNumber=1&pageSize=10",
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    const data = await response.json();
    blogs = (data.items || data.data || []).filter((b) => b.youTubeUrl);
  } catch (err) {
    console.error("Video API Error:", err);
    wrapper.innerHTML = ""; // clear skeletons silently
    return;
  }

  if (!blogs.length) {
    wrapper.innerHTML = "";
    return;
  }

  /* Build slides — thumbnails load lazily via IntersectionObserver */
  wrapper.innerHTML = "";

  blogs.forEach((blog) => {
    const videoId = extractYoutubeId(blog.youTubeUrl);
    if (!videoId) return;

    const thumb = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`; // mqdefault = smaller, faster than maxresdefault

    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    slide.innerHTML = `
      <div
        class="video-card"
        data-video="https://www.youtube.com/embed/${videoId}"
        data-title="${escapeAttr(blog.title)}"
        data-desc="${escapeAttr(blog.description)}"
      >
        <div class="thumbnail">
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"
            data-src="${thumb}"
            alt="${escapeAttr(blog.title)}"
            loading="lazy"
            width="320"
            height="180"
            decoding="async"
          />
          <div class="play-icon"><i class="ri-play-fill"></i></div>
        </div>
        <div class="video-info">
          <h3>${escapeHtml(blog.title)}</h3>
          <p>${escapeHtml(blog.description)}</p>
        </div>
      </div>`;

    wrapper.appendChild(slide);
  });

  /* Lazy-load images with IntersectionObserver */
  lazyLoadImages(wrapper.querySelectorAll("img[data-src]"));

  initVideoSwiper();
}

/* =========================================================
   LAZY IMAGE LOADER
========================================================= */

function lazyLoadImages(imgs) {
  if (!imgs.length) return;

  if (!("IntersectionObserver" in window)) {
    /* Fallback for old browsers */
    imgs.forEach((img) => (img.src = img.dataset.src));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        observer.unobserve(img);
      });
    },
    { rootMargin: "200px" } // start loading 200 px before visible
  );

  imgs.forEach((img) => observer.observe(img));
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
    autoplay: { delay: 3000, disableOnInteraction: false },
    pagination: { el: ".videoReviewSwiper .swiper-pagination", clickable: true },
    breakpoints: {
      768:  { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
    /* Swiper will only render nearby slides — saves DOM nodes */
    watchSlidesProgress: true,
  });
}

/* =========================================================
   VIDEO MODAL
========================================================= */

function initVideoModal() {
  const modal = document.getElementById("videoModal");
  if (!modal) return;

  const frame   = document.getElementById("videoFrame");
  const title   = document.getElementById("videoTitle");
  const desc    = document.getElementById("videoDescription");
  const closeBtn = modal.querySelector(".video-close");
  const overlay  = modal.querySelector(".video-overlay");

  const openModal = (card) => {
    frame.src      = (card.dataset.video || "") + "?autoplay=1&rel=0";
    title.textContent = card.dataset.title || "";
    desc.textContent  = card.dataset.desc  || "";
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.classList.remove("active");
    frame.src = "";                       // stops video / frees memory
    document.body.style.overflow = "auto";
  };

  /* Single delegated listener — no per-card listeners */
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".video-card");
    if (card) openModal(card);
  });

  closeBtn?.addEventListener("click", closeModal);
  overlay?.addEventListener("click",  closeModal);
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

  function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  /* Build both modal + chat items in one pass using a fragment */
  function renderAll(announcements) {
    const modalFrag = document.createDocumentFragment();
    const chatFrag  = document.createDocumentFragment();

    announcements.forEach((ann) => {
      const text = ann.title || ann.message || ann.description || "";
      const inner = `
        <div class="ann-text">${escapeHtml(text)}</div>
        ${ann.description && ann.title ? `<div class="ann-desc">${escapeHtml(ann.description)}</div>` : ""}
        ${ann.startDate ? `<div class="ann-date" style="margin-top:10px">📅 ${formatDate(ann.startDate)}</div>` : ""}
      `;

      const mItem = document.createElement("div");
      mItem.className = "announcement-item";
      mItem.innerHTML = inner;
      modalFrag.appendChild(mItem);

      const cItem = document.createElement("div");
      cItem.className = "announcement-item";
      cItem.innerHTML = inner;
      chatFrag.appendChild(cItem);
    });

    listContainer?.appendChild(modalFrag);
    chatBody?.appendChild(chatFrag);
  }

  let announcements = [];

  try {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 8000);

    const res  = await fetch("http://localhost:8080/api/Announcement/active", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const text = await res.text();
    if (!text?.trim()) return;

    const data = JSON.parse(text);
    announcements = (Array.isArray(data) ? data : data.items || data.data || [])
      .filter((a) => !a.status || a.status === "Active");
  } catch (err) {
    console.error("Announcement API Error:", err);
    return;
  }

  if (!announcements.length) {
    if (floatBtn) floatBtn.style.display = "none";
    return;
  }

  renderAll(announcements);

  /* Open modal */
  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  const closeModal = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  };

  closeBtn?.addEventListener("click", closeModal);
  overlay?.addEventListener("click",  closeModal);

  floatBtn?.addEventListener("click", () => chatPanel?.classList.toggle("active"));
  chatClose?.addEventListener("click", () => chatPanel?.classList.remove("active"));

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

  const modalImage  = document.getElementById("modalImage");
  const modalAuthor = document.getElementById("modalAuthor");
  const modalDate   = document.getElementById("modalDate");
  const modalTitle  = document.getElementById("modalTitle");
  const modalDesc   = document.getElementById("modalDescription");
  const closeBtn    = modal.querySelector(".modal-close");
  const overlay     = modal.querySelector(".modal-overlay");

  const openModal = (card) => {
    const img    = card.querySelector("img")?.src || "";
    const author = card.querySelector(".meta span:nth-child(1)")?.textContent || "";
    const date   = card.querySelector(".meta span:nth-child(2)")?.textContent || "";
    const title  = card.querySelector(".blog-title")?.textContent || "";
    const desc   = card.querySelector(".blog-desc")?.textContent  || "";

    modalImage.src              = img;
    modalAuthor.textContent     = author;
    modalDate.textContent       = date;
    modalTitle.textContent      = title;
    modalDesc.textContent       = desc;

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
    openModal(link.closest(".blog-card"));
  });

  closeBtn?.addEventListener("click", closeModal);
  overlay?.addEventListener("click",  closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

/* =========================================================
   UTILITIES — XSS safe helpers
========================================================= */

const _escDiv = document.createElement("div");

function escapeHtml(str) {
  if (!str) return "";
  _escDiv.textContent = str;
  return _escDiv.innerHTML;
}

function escapeAttr(str) {
  return (str || "").replace(/[&"'<>]/g, (c) =>
    ({ "&": "&amp;", '"': "&quot;", "'": "&#39;", "<": "&lt;", ">": "&gt;" }[c])
  );
}

/* =========================================================
   SKELETON CSS  — injected once at runtime (no extra file)
========================================================= */

(function injectSkeletonStyles() {
  if (document.getElementById("skeleton-styles")) return;
  const style = document.createElement("style");
  style.id = "skeleton-styles";
  style.textContent = `
    .video-skeleton { border-radius: 10px; overflow: hidden; background: #f0f0f0; padding-bottom: 12px; }
    .skeleton-thumb { width: 100%; padding-top: 56.25%; border-radius: 6px; }
    .skeleton-line  { height: 14px; border-radius: 4px; margin: 0 12px; }
    .skeleton-pulse {
      background: linear-gradient(90deg, #e0e0e0 25%, #f5f5f5 50%, #e0e0e0 75%);
      background-size: 200% 100%;
      animation: skeletonShimmer 1.4s infinite;
    }
    @keyframes skeletonShimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
})();

// Page Loader
const pageLoader = document.getElementById("pageLoader");
window.addEventListener("load", () => {
  setTimeout(() => {
    pageLoader?.classList.add("hidden");
  }, 500); // thoda delay for smoothness
});