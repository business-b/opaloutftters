// ============================================================
// OPAL OUTFITTERS - Main JavaScript
// ============================================================

'use strict';

// ──────────────────────────────────────────────
// CART (localStorage)
// ──────────────────────────────────────────────
const Cart = {
  get() {
    try { return JSON.parse(localStorage.getItem('oo_cart') || '[]'); } catch { return []; }
  },
  save(items) { localStorage.setItem('oo_cart', JSON.stringify(items)); },
  add(product) {
    const items = this.get();
    const key = `${product.id}-${product.size || ''}-${product.color || ''}`;
    const existing = items.find(i => i.key === key);
    if (existing) { existing.qty += (product.qty || 1); }
    else { items.push({ ...product, key, qty: product.qty || 1 }); }
    this.save(items);
    this.updateUI();
    showToast(`${product.name} added to cart`, 'success');
  },
  remove(key) {
    const items = this.get().filter(i => i.key !== key);
    this.save(items);
    this.updateUI();
    renderCart();
  },
  updateQty(key, qty) {
    const items = this.get();
    const item = items.find(i => i.key === key);
    if (item) { item.qty = Math.max(1, qty); }
    this.save(items);
    this.updateUI();
    renderCart();
  },
  total() {
    return this.get().reduce((sum, i) => sum + (parseFloat(i.price) * i.qty), 0);
  },
  count() { return this.get().reduce((sum, i) => sum + i.qty, 0); },
  updateUI() {
    const count = this.count();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }
};

// ──────────────────────────────────────────────
// WISHLIST (localStorage)
// ──────────────────────────────────────────────
const Wishlist = {
  get() {
    try { return JSON.parse(localStorage.getItem('oo_wishlist') || '[]'); } catch { return []; }
  },
  save(items) { localStorage.setItem('oo_wishlist', JSON.stringify(items)); },
  toggle(product) {
    const items = this.get();
    const idx = items.findIndex(i => i.id === product.id);
    let msg;
    if (idx === -1) {
      items.push(product);
      msg = `${product.name} added to wishlist`;
    } else {
      items.splice(idx, 1);
      msg = `${product.name} removed from wishlist`;
    }
    this.save(items);
    this.updateUI();
    showToast(msg, 'success');
    return idx === -1;
  },
  has(id) { return this.get().some(i => i.id == id); },
  updateUI() {
    const count = this.get().length;
    document.querySelectorAll('.wishlist-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
    // Update wishlist buttons
    document.querySelectorAll('[data-product-id]').forEach(btn => {
      const id = btn.dataset.productId;
      if (btn.classList.contains('wishlist-btn')) {
        const icon = btn.querySelector('i');
        if (icon) {
          if (Wishlist.has(id)) {
            icon.className = 'fas fa-heart';
            btn.classList.add('wishlisted');
          } else {
            icon.className = 'far fa-heart';
            btn.classList.remove('wishlisted');
          }
        }
      }
    });
  }
};

// ──────────────────────────────────────────────
// TOAST
// ──────────────────────────────────────────────
function showToast(message, type = 'default') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', default: 'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.default}"></i><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ──────────────────────────────────────────────
// HERO SLIDER
// ──────────────────────────────────────────────
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;

  let current = 0;
  let timer;

  function goTo(n) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }
  function startAuto() { timer = setInterval(next, 5500); }
  function resetAuto() { clearInterval(timer); startAuto(); }

  document.querySelector('.hero-next')?.addEventListener('click', () => { next(); resetAuto(); });
  document.querySelector('.hero-prev')?.addEventListener('click', () => { prev(); resetAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); resetAuto(); }));

  goTo(0);
  startAuto();
}

// ──────────────────────────────────────────────
// PRODUCT IMAGE SLIDERS (on cards)
// ──────────────────────────────────────────────
function initProductImageSliders() {
  document.querySelectorAll('.product-card').forEach(card => {
    const imgs = card.querySelectorAll('.product-img');
    if (imgs.length <= 1) {
      card.querySelector('.product-img-arrows')?.remove();
      return;
    }
    let idx = 0;
    imgs.forEach((img, i) => {
      img.classList.toggle('visible', i === 0);
      img.classList.toggle('hidden', i !== 0);
    });

    function show(n) {
      imgs[idx].classList.remove('visible'); imgs[idx].classList.add('hidden');
      idx = (n + imgs.length) % imgs.length;
      imgs[idx].classList.remove('hidden'); imgs[idx].classList.add('visible');
    }

    card.querySelector('.img-arrow-next')?.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); show(idx + 1); });
    card.querySelector('.img-arrow-prev')?.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); show(idx - 1); });
  });
}

// ──────────────────────────────────────────────
// HAMBURGER / NAV
// ──────────────────────────────────────────────
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const sideNav = document.getElementById('sideNav');
  const navOverlay = document.getElementById('navOverlay');

  function openNav() {
    hamburger?.classList.add('open');
    sideNav?.classList.add('open');
    navOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeNav() {
    hamburger?.classList.remove('open');
    sideNav?.classList.remove('open');
    navOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    sideNav?.classList.contains('open') ? closeNav() : openNav();
  });
  navOverlay?.addEventListener('click', closeNav);
  document.querySelectorAll('.side-nav-close').forEach(btn => btn.addEventListener('click', closeNav));

  // Active link
  const path = window.location.pathname.split('/').pop() || 'index.php';
  document.querySelectorAll('.side-nav a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}

// ──────────────────────────────────────────────
// SEARCH
// ──────────────────────────────────────────────
function initSearch() {
  const searchToggle = document.getElementById('searchToggle');
  const searchBar = document.getElementById('searchBar');
  const searchInput = document.getElementById('searchInput');
  const resultsDropdown = document.getElementById('searchResultsDropdown');

  searchToggle?.addEventListener('click', () => {
    searchBar?.classList.toggle('open');
    if (searchBar?.classList.contains('open')) {
      setTimeout(() => searchInput?.focus(), 200);
    }
  });

  let searchTimer;
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    const q = searchInput.value.trim();
    if (q.length < 2) { resultsDropdown?.classList.remove('show'); return; }
    searchTimer = setTimeout(() => {
      fetch(`php/search.php?q=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .then(data => {
          if (!resultsDropdown) return;
          if (!data.results || !data.results.length) {
            resultsDropdown.innerHTML = '<div class="search-result-item" style="color:#999;justify-content:center">No results found</div>';
          } else {
            resultsDropdown.innerHTML = data.results.map(p => `
              <div class="search-result-item" onclick="location.href='product.php?slug=${p.slug}'">
                <img src="${p.image || 'https://via.placeholder.com/44x44?text=OO'}" alt="${p.name}" loading="lazy">
                <div>
                  <div class="search-result-name">${p.name}</div>
                  <div class="search-result-price">${p.price_formatted}</div>
                </div>
              </div>
            `).join('');
          }
          resultsDropdown.classList.add('show');
        })
        .catch(() => {});
    }, 300);
  });

  document.addEventListener('click', e => {
    if (!searchBar?.contains(e.target) && e.target !== searchToggle) {
      searchBar?.classList.remove('open');
      resultsDropdown?.classList.remove('show');
    }
  });
}

// ──────────────────────────────────────────────
// HEADER SCROLL
// ──────────────────────────────────────────────
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

// ──────────────────────────────────────────────
// CART SIDEBAR
// ──────────────────────────────────────────────
function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const cartSubtotal = document.getElementById('cartSubtotal');
  if (!cartItems) return;

  const items = Cart.get();
  if (!items.length) {
    cartItems.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>Your cart is empty</p></div>`;
    if (cartSubtotal) cartSubtotal.textContent = '$0.00';
    return;
  }

  cartItems.innerHTML = items.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image || 'https://via.placeholder.com/70x80?text=OO'}" alt="${item.name}" loading="lazy">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">${[item.size ? 'Size: '+item.size : '', item.color ? 'Color: '+item.color : ''].filter(Boolean).join(' · ')}</div>
        <div class="cart-item-price">$${(parseFloat(item.price) * item.qty).toFixed(2)}</div>
        <div class="cart-qty">
          <button class="qty-btn" onclick="Cart.updateQty('${item.key}', ${item.qty - 1})"><i class="fas fa-minus"></i></button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" onclick="Cart.updateQty('${item.key}', ${item.qty + 1})"><i class="fas fa-plus"></i></button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="Cart.remove('${item.key}')"><i class="fas fa-times"></i></button>
    </div>
  `).join('');

  if (cartSubtotal) cartSubtotal.textContent = `$${Cart.total().toFixed(2)}`;
}

function initCart() {
  const cartToggle = document.getElementById('cartToggle');
  const cartSidebar = document.getElementById('cartSidebar');
  const cartClose = document.getElementById('cartClose');

  cartToggle?.addEventListener('click', () => {
    cartSidebar?.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCart();
  });
  cartClose?.addEventListener('click', () => {
    cartSidebar?.classList.remove('open');
    document.body.style.overflow = '';
  });
  cartSidebar?.addEventListener('click', e => {
    if (e.target === cartSidebar) {
      cartSidebar.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// ──────────────────────────────────────────────
// WISHLIST BUTTONS
// ──────────────────────────────────────────────
function initWishlistButtons() {
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    const id = btn.dataset.productId;
    const name = btn.dataset.productName;
    const price = btn.dataset.productPrice;
    const image = btn.dataset.productImage;

    // Set initial state
    if (Wishlist.has(id)) {
      btn.querySelector('i')?.setAttribute('class', 'fas fa-heart');
      btn.classList.add('wishlisted');
    }

    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const added = Wishlist.toggle({ id, name, price, image });
      const icon = btn.querySelector('i');
      if (icon) icon.className = added ? 'fas fa-heart' : 'far fa-heart';
      btn.classList.toggle('wishlisted', added);
    });
  });
}

// ──────────────────────────────────────────────
// BUY NOW / ADD TO CART BUTTONS
// ──────────────────────────────────────────────
function initBuyButtons() {
  document.querySelectorAll('.buy-now-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const slug = btn.dataset.productSlug;
      if (slug) window.location.href = `order.php?slug=${slug}`;
    });
  });

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      Cart.add({
        id: btn.dataset.productId,
        name: btn.dataset.productName,
        price: btn.dataset.productPrice,
        image: btn.dataset.productImage,
        size: btn.dataset.productSize || '',
        color: btn.dataset.productColor || ''
      });
    });
  });
}

// ──────────────────────────────────────────────
// QUANTITY SELECTOR (order page)
// ──────────────────────────────────────────────
function initQtySelectors() {
  document.querySelectorAll('.qty-selector').forEach(sel => {
    const input = sel.querySelector('.qty-value');
    const minus = sel.querySelector('.minus');
    const plus = sel.querySelector('.plus');
    if (!input) return;

    minus?.addEventListener('click', () => {
      const val = parseInt(input.textContent) || 1;
      if (val > 1) {
        input.textContent = val - 1;
        const hiddenInput = document.getElementById('quantityInput');
        if (hiddenInput) hiddenInput.value = val - 1;
        updateOrderTotal();
      }
    });
    plus?.addEventListener('click', () => {
      const val = parseInt(input.textContent) || 1;
      input.textContent = val + 1;
      const hiddenInput = document.getElementById('quantityInput');
      if (hiddenInput) hiddenInput.value = val + 1;
      updateOrderTotal();
    });
  });
}

function updateOrderTotal() {
  const priceEl = document.getElementById('basePrice');
  const qtyEl = document.getElementById('qtyDisplay');
  const totalEl = document.getElementById('orderTotal');
  if (!priceEl || !qtyEl || !totalEl) return;
  const price = parseFloat(priceEl.dataset.price) || 0;
  const qty = parseInt(qtyEl.textContent) || 1;
  totalEl.textContent = `$${(price * qty).toFixed(2)}`;
}

// ──────────────────────────────────────────────
// PRODUCT GALLERY (detail page)
// ──────────────────────────────────────────────
function initProductGallery() {
  const mainImg = document.getElementById('galleryMain');
  const thumbs = document.querySelectorAll('.gallery-thumb');
  if (!mainImg || !thumbs.length) return;

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      mainImg.src = thumb.querySelector('img').src.replace('w=80', 'w=600');
      mainImg.style.animation = 'none';
      requestAnimationFrame(() => { mainImg.style.animation = ''; });
    });
  });

  // Image zoom on hover (desktop)
  const galleryWrap = document.getElementById('galleryMainWrap');
  if (galleryWrap && window.innerWidth > 768) {
    galleryWrap.addEventListener('mousemove', e => {
      const { left, top, width, height } = galleryWrap.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      mainImg.style.transformOrigin = `${x}% ${y}%`;
      mainImg.style.transform = 'scale(1.6)';
    });
    galleryWrap.addEventListener('mouseleave', () => {
      mainImg.style.transform = 'scale(1)';
    });
  }
}

// ──────────────────────────────────────────────
// SIZE & COLOR SELECTORS (detail page)
// ──────────────────────────────────────────────
function initSizeColorSelectors() {
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const hiddenInput = document.getElementById('selectedSize');
      if (hiddenInput) hiddenInput.value = btn.dataset.size;
    });
  });

  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const hiddenInput = document.getElementById('selectedColor');
      if (hiddenInput) hiddenInput.value = btn.dataset.color;
    });
  });
}

// ──────────────────────────────────────────────
// REVIEW FORM
// ──────────────────────────────────────────────
function initReviewForm() {
  const form = document.getElementById('reviewForm');
  if (!form) return;

  const stars = form.querySelectorAll('.review-star-input');
  let selectedRating = 0;

  stars.forEach(star => {
    star.addEventListener('mouseover', () => {
      stars.forEach(s => s.classList.toggle('active', s.dataset.value <= star.dataset.value));
    });
    star.addEventListener('mouseout', () => {
      stars.forEach(s => s.classList.toggle('active', s.dataset.value <= selectedRating));
    });
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.value);
      const ratingInput = document.getElementById('ratingValue');
      if (ratingInput) ratingInput.value = selectedRating;
      stars.forEach(s => s.classList.toggle('active', s.dataset.value <= selectedRating));
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true; btn.textContent = 'Submitting...';

    const data = new FormData(form);
    try {
      const res = await fetch('php/submit_review.php', { method: 'POST', body: data });
      const json = await res.json();
      if (json.success) {
        showToast('Review submitted! It will appear after approval.', 'success');
        form.reset();
        selectedRating = 0;
        stars.forEach(s => s.classList.remove('active'));
      } else {
        showToast(json.error || 'Failed to submit review.', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    }
    btn.disabled = false; btn.textContent = 'Submit Review';
  });
}

// ──────────────────────────────────────────────
// ORDER FORM
// ──────────────────────────────────────────────
function initOrderForm() {
  const form = document.getElementById('orderForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');

    // Validate size/color
    const sizeInput = document.getElementById('selectedSize');
    const colorInput = document.getElementById('selectedColor');
    const sizesSection = document.getElementById('sizeSection');

    if (sizesSection && sizeInput && !sizeInput.value) {
      showToast('Please select a size', 'error');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Placing Order...';

    const data = new FormData(form);
    try {
      const res = await fetch('php/place_order.php', { method: 'POST', body: data });
      const json = await res.json();
      if (json.success) {
        window.location.href = `order_success.php?order=${json.order_number}`;
      } else {
        showToast(json.error || 'Failed to place order.', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm Order';
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm Order';
    }
  });
}

// ──────────────────────────────────────────────
// LAZY LOADING
// ──────────────────────────────────────────────
function initLazyLoad() {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '100px' });

    document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
  }
}

// ──────────────────────────────────────────────
// ANIMATIONS ON SCROLL
// ──────────────────────────────────────────────
function initScrollAnimations() {
  const elements = document.querySelectorAll('.product-card, .review-card, .category-card, .stat-card');
  if (!('IntersectionObserver' in window)) return;

  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '-50px', threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}

// ──────────────────────────────────────────────
// INIT ALL
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateUI();
  Wishlist.updateUI();
  initNav();
  initHeaderScroll();
  initSearch();
  initCart();
  initHeroSlider();
  initProductImageSliders();
  initWishlistButtons();
  initBuyButtons();
  initQtySelectors();
  initProductGallery();
  initSizeColorSelectors();
  initReviewForm();
  initOrderForm();
  initLazyLoad();
  initScrollAnimations();
});
