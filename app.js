/* ══════════════════════════════════════════════════════
   OPAL OUTFITTERS — app.js
   Full frontend with localStorage persistence
   Drop-in ready for PHP/MySQL backend integration
══════════════════════════════════════════════════════ */

/* ── State ── */
let state = {
  products: [],
  orders: [],
  reviews: [],
  categories: ['clothing','shoes','accessories'],
  cart: [],
  wishlist: [],
  currentProductId: null,
  orderProductId: null,
  orderQty: 1,
  selectedRating: 0,
  adminLoggedIn: false,
  adminPassword: 'opal01',
  heroIndex: 0,
  heroTimer: null,
  footerSettings: {},
  banners: [],
};

/* ── Seed Products ── */
const SEED_PRODUCTS = [
  {id:'p1',name:'Midnight Classic Shirt',category:'clothing',price:2800,shortDesc:'Slim-fit premium cotton shirt',desc:'Crafted from 100% Egyptian cotton with a modern slim fit. Perfect for formal and semi-formal occasions. Features mother-of-pearl buttons and a subtle textured weave.',stock:25,badge:'NEW',images:[],colors:['Black','White','Navy'],specs:{Material:'100% Egyptian Cotton',Fit:'Slim Fit',Sleeve:'Full Sleeve',Care:'Dry Clean Only'},rating:4.7,reviews:12,isNew:true},
  {id:'p2',name:'Noir Oxford Loafers',category:'shoes',price:5500,shortDesc:'Premium leather loafers',desc:'Hand-crafted genuine leather loafers with a cushioned insole and burnished finish. Pairs effortlessly with both casual and formal ensembles.',stock:10,badge:'BEST',images:[],colors:['Black','Dark Brown'],specs:{Material:'Genuine Leather',Sole:'Rubber',Closure:'Slip-on',Origin:'Handcrafted'},rating:4.9,reviews:28,isNew:false},
  {id:'p3',name:'Opal Gold Watch',category:'accessories',price:8900,shortDesc:'Minimalist gold-toned timepiece',desc:'A minimalist timepiece with a brushed gold case and sapphire-coated glass. Japanese quartz movement. Perfect as a gift or personal statement.',stock:5,badge:'LIMITED',images:[],colors:['Gold','Silver'],specs:{Movement:'Japanese Quartz',Case:'Stainless Steel',Glass:'Sapphire Coat',Water:'3ATM'},rating:4.8,reviews:44,isNew:false},
  {id:'p4',name:'Prestige Chino Trousers',category:'clothing',price:3200,shortDesc:'Tailored slim chinos in premium fabric',desc:'Slim-cut chinos woven from stretch-blend fabric for all-day comfort. Features a flat front and tapered leg.',stock:20,badge:'',images:[],colors:['Charcoal','Beige','Black'],specs:{Material:'Cotton Stretch Blend',Fit:'Slim Tapered',Waist:'Flat Front',Rise:'Mid Rise'},rating:4.5,reviews:19,isNew:false},
  {id:'p5',name:'Signature Leather Belt',category:'accessories',price:1800,shortDesc:'Full-grain leather dress belt',desc:'Full-grain leather with a polished gold-tone buckle. Width: 35mm. Available in matte black finish.',stock:30,badge:'',images:[],colors:['Black'],specs:{Material:'Full-Grain Leather',Width:'35mm',Buckle:'Gold-Tone',Length:'110-130cm'},rating:4.6,reviews:8,isNew:false},
  {id:'p6',name:'Urban Runner Sneakers',category:'shoes',price:4200,shortDesc:'Premium knit-upper everyday sneaker',desc:'Engineered knit upper with EVA sole for maximum comfort. Features an ortholite insole and breathable mesh lining.',stock:0,badge:'SOLD OUT',images:[],colors:['Black/Gold','White/Black'],specs:{Upper:'Engineered Knit',Sole:'EVA',Insole:'OrthoLite',Closure:'Lace-Up'},rating:4.4,reviews:33,isNew:false},
  {id:'p7',name:'Velvet Blazer',category:'clothing',price:7500,shortDesc:'Structured velvet blazer for evenings',desc:'A statement blazer in deep midnight velvet. Structured shoulders, single button closure, and satin lapels. Ideal for events and formal dinners.',stock:8,badge:'NEW',images:[],colors:['Midnight Black','Deep Burgundy'],specs:{Material:'Premium Velvet',Lining:'Satin',Fit:'Tailored',Buttons:'Single'},rating:4.9,reviews:7,isNew:true},
  {id:'p8',name:'Chain Bracelet',category:'accessories',price:1200,shortDesc:'18K gold-plated box chain',desc:'18K gold-plated box chain bracelet. 6mm width, available in two lengths. Lobster clasp closure. Hypoallergenic.',stock:40,badge:'',images:[],colors:['Gold','Silver'],specs:{Plating:'18K Gold',Width:'6mm',Length:'18cm / 20cm',Clasp:'Lobster'},rating:4.3,reviews:22,isNew:false},
];
const PRODUCT_EMOJIS = {clothing:'👔',shoes:'👟',accessories:'💍'};

/* ══════════════════
   INIT
══════════════════ */
function init() {
  loadState();
  if(!state.products.length) state.products = SEED_PRODUCTS;
  renderHeroDots();
  startHeroTimer();
  renderProducts('productsGrid', state.products);
  updateBadges();
}

/* ══════════════════
   PERSISTENCE
══════════════════ */
function saveState() {
  const s = {products:state.products,orders:state.orders,reviews:state.reviews,categories:state.categories,cart:state.cart,wishlist:state.wishlist,adminPassword:state.adminPassword,footerSettings:state.footerSettings,banners:state.banners};
  try { localStorage.setItem('opal_state', JSON.stringify(s)); } catch(e){}
}
function loadState() {
  try {
    const raw = localStorage.getItem('opal_state');
    if(raw) {
      const s = JSON.parse(raw);
      Object.assign(state, s);
    }
  } catch(e){}
}

/* ══════════════════
   NAVIGATION
══════════════════ */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-'+id);
  if(page) {
    page.classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
    onPageLoad(id);
  }
  closeNav();
}

function navGo(id) {
  showPage(id);
}

function onPageLoad(id) {
  if(id==='shop') renderProducts('shopGrid', state.products);
  if(id==='new-arrivals') renderProducts('newArrivalsGrid', state.products.filter(p=>p.isNew));
  if(id==='best-sellers') renderProducts('bestSellersGrid', [...state.products].sort((a,b)=>b.reviews-a.reviews).slice(0,8));
  if(id==='shoes') renderProducts('shoesGrid', state.products.filter(p=>p.category==='shoes'));
  if(id==='clothing') renderProducts('clothingGrid', state.products.filter(p=>p.category==='clothing'));
  if(id==='accessories') renderProducts('accessoriesGrid', state.products.filter(p=>p.category==='accessories'));
  if(id==='cart') renderCart();
  if(id==='wishlist') renderWishlist();
  if(id==='reviews-page') renderAllReviews();
  if(id==='account') renderAccount();
  if(id==='admin') { if(!state.adminLoggedIn){showPage('admin-login');return;} renderAdminDashboard(); }
}

/* ══════════════════
   HAMBURGER / NAV
══════════════════ */
document.getElementById('hamburgerBtn').addEventListener('click', () => {
  document.getElementById('navDrawer').classList.add('open');
  document.getElementById('navOverlay').classList.add('open');
  document.body.style.overflow='hidden';
});
function closeNav() {
  document.getElementById('navDrawer').classList.remove('open');
  document.getElementById('navOverlay').classList.remove('open');
  document.body.style.overflow='';
}

/* ══════════════════
   SEARCH
══════════════════ */
document.getElementById('searchToggleBtn').addEventListener('click', () => {
  const bar = document.getElementById('searchBar');
  bar.classList.toggle('open');
  if(bar.classList.contains('open')) document.getElementById('searchInput').focus();
});
document.getElementById('searchInput').addEventListener('keydown', e => {
  if(e.key==='Enter') performSearch();
});
function performSearch() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  if(!q) return;
  const results = state.products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.shortDesc.toLowerCase().includes(q)
  );
  document.getElementById('searchResultTitle').textContent = `Results for "${q}" (${results.length})`;
  renderProducts('searchGrid', results);
  showPage('search');
  document.getElementById('searchBar').classList.remove('open');
}

/* ══════════════════
   HERO SLIDER
══════════════════ */
function renderHeroDots() {
  const dotsWrap = document.getElementById('heroDots');
  const slides = document.querySelectorAll('.slide');
  dotsWrap.innerHTML = '';
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'hero-dot' + (i===0?' active':'');
    d.onclick = () => goToSlide(i);
    dotsWrap.appendChild(d);
  });
}
function heroSlide(dir) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.hero-dot');
  slides[state.heroIndex].classList.remove('active');
  dots[state.heroIndex].classList.remove('active');
  state.heroIndex = (state.heroIndex + dir + slides.length) % slides.length;
  slides[state.heroIndex].classList.add('active');
  dots[state.heroIndex].classList.add('active');
  resetHeroTimer();
}
function goToSlide(i) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.hero-dot');
  slides[state.heroIndex].classList.remove('active');
  dots[state.heroIndex].classList.remove('active');
  state.heroIndex = i;
  slides[i].classList.add('active');
  dots[i].classList.add('active');
  resetHeroTimer();
}
function startHeroTimer() {
  state.heroTimer = setInterval(() => heroSlide(1), 5000);
}
function resetHeroTimer() {
  clearInterval(state.heroTimer);
  startHeroTimer();
}

/* ══════════════════
   PRODUCT RENDERING
══════════════════ */
function renderProducts(containerId, products) {
  const container = document.getElementById(containerId);
  if(!container) return;
  if(!products.length) {
    container.innerHTML = '<div class="empty-state"><p>No products found.</p></div>';
    return;
  }
  container.innerHTML = products.map(p => productCardHTML(p)).join('');
}

function productCardHTML(p) {
  const soldOut = p.stock === 0;
  const lowStock = p.stock > 0 && p.stock <= 5;
  const badge = soldOut ? 'SOLD OUT' : p.badge;
  const badgeClass = soldOut ? 'card-badge sold-out' : 'card-badge';
  const wishlisted = state.wishlist.includes(p.id);
  const imgs = p.images && p.images.length ? p.images : null;
  const emoji = PRODUCT_EMOJIS[p.category] || '📦';

  let imgTrack = '';
  if(imgs && imgs.length) {
    imgTrack = `<div class="card-img-track" id="track_${p.id}">${imgs.map(src=>`<img class="card-img" src="${src}" alt="${p.name}" loading="lazy"/>`).join('')}</div>`;
  } else {
    imgTrack = `<div class="card-img-track" id="track_${p.id}"><div class="card-img-placeholder"><span class="product-emoji">${emoji}</span></div></div>`;
  }

  const starsHTML = renderStars(p.rating);
  const stockText = soldOut ? '<span class="out-stock">● Out of Stock</span>' : lowStock ? `<span class="low-stock">● Only ${p.stock} left</span>` : '<span class="in-stock">● In Stock</span>';
  const hasMultiImg = imgs && imgs.length > 1;

  return `
  <div class="product-card" data-id="${p.id}">
    <div class="card-img-wrap" onclick="openProductDetail('${p.id}')">
      ${imgTrack}
      ${hasMultiImg ? `<button class="card-arrow card-prev" onclick="event.stopPropagation();cardSlide('${p.id}',-1)">&#8592;</button><button class="card-arrow card-next" onclick="event.stopPropagation();cardSlide('${p.id}',1)">&#8594;</button>` : ''}
      ${badge ? `<span class="${badgeClass}">${badge}</span>` : ''}
      <div class="card-actions-top">
        <button class="card-action-btn ${wishlisted?'wishlisted':''}" title="Wishlist" onclick="event.stopPropagation();toggleWishlist('${p.id}',this)">♡</button>
        <button class="card-action-btn" title="Quick View" onclick="event.stopPropagation();openQuickView('${p.id}')">👁</button>
      </div>
    </div>
    <div class="card-body">
      <h3>${p.name}</h3>
      <div class="card-price">PKR ${p.price.toLocaleString()}</div>
      <div class="card-desc">${p.shortDesc}</div>
      <div class="card-rating">
        <span class="stars">${starsHTML}</span>
        <span class="rating-count">(${p.reviews})</span>
      </div>
      <div class="stock-status">${stockText}</div>
      <div class="card-footer">
        <button class="btn-buy" ${soldOut?'disabled':''} onclick="event.stopPropagation();buyNow('${p.id}')">${soldOut?'Sold Out':'Buy Now'}</button>
        <button class="btn-review" onclick="event.stopPropagation();openReviewForm('${p.id}')">Review</button>
      </div>
    </div>
  </div>`;
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let s = '';
  for(let i=0;i<5;i++) {
    if(i<full) s+='★';
    else if(i===full && half) s+='½';
    else s+='☆';
  }
  return s;
}

/* Card image slider */
const cardSlideIndex = {};
function cardSlide(pid, dir) {
  const product = state.products.find(p=>p.id===pid);
  if(!product || !product.images || product.images.length<2) return;
  if(!cardSlideIndex[pid]) cardSlideIndex[pid] = 0;
  const total = product.images.length;
  cardSlideIndex[pid] = (cardSlideIndex[pid] + dir + total) % total;
  const track = document.getElementById('track_'+pid);
  if(track) track.style.transform = `translateX(-${cardSlideIndex[pid]*100}%)`;
}

/* Filter tabs */
function filterProducts(cat, btn) {
  document.querySelectorAll('.filter-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = cat==='all' ? state.products : state.products.filter(p=>p.category===cat);
  renderProducts('productsGrid', filtered);
}

/* ══════════════════
   PRODUCT DETAIL
══════════════════ */
function openProductDetail(pid) {
  const p = state.products.find(pr=>pr.id===pid);
  if(!p) return;
  state.currentProductId = pid;
  const soldOut = p.stock===0;
  const emoji = PRODUCT_EMOJIS[p.category] || '📦';
  const productReviews = state.reviews.filter(r=>r.productId===pid).reverse();

  let galleryHTML = '';
  if(p.images && p.images.length) {
    galleryHTML = `<div class="main-img-wrap"><img class="main-img" id="mainImg" src="${p.images[0]}" alt="${p.name}"/></div>
    <div class="thumb-list">${p.images.map((src,i)=>`<img class="thumb ${i===0?'active':''}" src="${src}" onclick="setMainImg(this,'${src}')"/>`).join('')}</div>`;
  } else {
    galleryHTML = `<div class="main-img-wrap"><div class="main-img-placeholder">${emoji}</div></div>
    <div class="thumb-list"><div class="thumb-placeholder active">${emoji}</div></div>`;
  }

  const sizesForCat = p.category==='shoes' ? ['7','8','9','10','11'] : ['S','M','L','XL','XXL'];

  const reviewsHTML = productReviews.length
    ? productReviews.map(r=>`
      <div class="review-card">
        <div class="review-card-header">
          <span class="review-card-name">${escHTML(r.name)}</span>
          <span class="review-card-date">${r.date}</span>
        </div>
        <div class="stars">${renderStars(r.rating)}</div>
        <p class="review-card-text">${escHTML(r.text)}</p>
      </div>`).join('')
    : '<p style="color:var(--white-muted);font-size:0.85rem">No reviews yet. Be the first!</p>';

  const related = state.products.filter(pr=>pr.category===p.category && pr.id!==pid).slice(0,4);

  document.getElementById('productDetailContent').innerHTML = `
  <div class="detail-page">
    <div class="detail-breadcrumb">
      <a onclick="showPage('home')">Home</a> / 
      <a onclick="navGo('${p.category}')">${capitalize(p.category)}</a> / ${p.name}
    </div>
    <div class="detail-layout">
      <div class="detail-gallery">${galleryHTML}</div>
      <div class="detail-info">
        <div class="detail-cat">${capitalize(p.category)}</div>
        <h1 class="detail-name">${p.name}</h1>
        <div class="detail-price">PKR ${p.price.toLocaleString()}</div>
        <div class="detail-rating">
          <span class="stars" style="font-size:1rem">${renderStars(p.rating)}</span>
          <span style="font-size:0.8rem;color:var(--white-muted)">(${p.reviews} reviews)</span>
        </div>
        <p class="detail-desc">${p.desc}</p>
        ${p.specs ? `
          <table class="spec-table">
            ${Object.entries(p.specs).map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
          </table>
        ` : ''}
        <div class="option-label">Select Size</div>
        <div class="size-grid">${sizesForCat.map(s=>`<button class="size-btn" onclick="selectSize(this,'${s}')">${s}</button>`).join('')}</div>
        ${p.colors && p.colors.length ? `
          <div class="option-label">Color</div>
          <div class="color-grid">${p.colors.map((c,i)=>`<button class="color-btn" style="background:${colorHex(c)}" title="${c}" onclick="selectColor(this)"></button>`).join('')}</div>
        ` : ''}
        <div class="detail-actions">
          <button class="btn-gold" ${soldOut?'disabled':''} onclick="buyNow('${p.id}')">${soldOut?'Sold Out':'Buy Now'}</button>
          <button class="btn-outline" ${soldOut?'disabled':''} onclick="addToCart('${p.id}')">Add to Cart</button>
          <button class="btn-outline" onclick="toggleWishlist('${p.id}')">♡ Wishlist</button>
        </div>
      </div>
    </div>
    <div class="reviews-section">
      <h3>Customer Reviews</h3>
      <div class="review-form-wrap">
        <h4>Write a Review</h4>
        <div class="form-grid">
          <div class="form-group full"><label>Your Name</label><input type="text" id="drev_name" placeholder="Your name"/></div>
          <div class="form-group full"><label>Review</label><textarea id="drev_text" rows="3" placeholder="Share your experience…"></textarea></div>
          <div class="form-group full">
            <label>Rating</label>
            <div class="star-picker" id="dStarPicker">
              <span onclick="setDetailRating(1)">★</span><span onclick="setDetailRating(2)">★</span>
              <span onclick="setDetailRating(3)">★</span><span onclick="setDetailRating(4)">★</span>
              <span onclick="setDetailRating(5)">★</span>
            </div>
          </div>
        </div>
        <button class="btn-gold" style="margin-top:1rem" onclick="submitReview('${p.id}')">Submit Review</button>
      </div>
      <div id="productReviews">${reviewsHTML}</div>
    </div>
    ${related.length ? `
    <div class="related-section">
      <h3>You May Also Like</h3>
      <div class="related-grid">${related.map(r=>smallCardHTML(r)).join('')}</div>
    </div>` : ''}
  </div>`;

  showPage('product-detail');
}

function setMainImg(el, src) {
  document.querySelectorAll('.thumb').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  const main = document.getElementById('mainImg');
  if(main) main.src = src;
}
function selectSize(btn, s) {
  document.querySelectorAll('.size-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
}
function selectColor(btn) {
  document.querySelectorAll('.color-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
}

function smallCardHTML(p) {
  const emoji = PRODUCT_EMOJIS[p.category] || '📦';
  const img = p.images && p.images.length ? `<img src="${p.images[0]}" alt="${p.name}" style="width:100%;height:200px;object-fit:cover"/>` : `<div style="width:100%;height:200px;background:var(--black3);display:flex;align-items:center;justify-content:center;font-size:4rem;opacity:0.4">${emoji}</div>`;
  return `<div class="product-card" style="cursor:pointer" onclick="openProductDetail('${p.id}')">
    <div class="card-img-wrap">${img}</div>
    <div class="card-body">
      <h3 style="font-size:0.85rem">${p.name}</h3>
      <div class="card-price" style="font-size:0.85rem">PKR ${p.price.toLocaleString()}</div>
    </div>
  </div>`;
}

function colorHex(name) {
  const map = {Black:'#1a1a1a',White:'#f5f5f5',Gold:'#D4AF37',Silver:'#C0C0C0',Navy:'#1a237e',Charcoal:'#36454F',Beige:'#F5F5DC',Burgundy:'#800020','Dark Brown':'#5C4033','Midnight Black':'#0d0d0d','Deep Burgundy':'#5C0120','Black/Gold':'#1a1a1a','White/Black':'#f5f5f5'};
  return map[name] || '#555';
}

/* Quick View */
function openQuickView(pid) {
  const p = state.products.find(pr=>pr.id===pid);
  if(!p) return;
  const emoji = PRODUCT_EMOJIS[p.category] || '📦';
  const img = p.images && p.images.length ? `<img src="${p.images[0]}" alt="${p.name}" style="width:100%;height:250px;object-fit:cover;border-radius:4px"/>` : `<div style="width:100%;height:220px;background:var(--black3);display:flex;align-items:center;justify-content:center;font-size:5rem;opacity:0.35;border-radius:4px">${emoji}</div>`;
  document.getElementById('productModalContent').innerHTML = `
    ${img}
    <div style="margin-top:1rem">
      <p style="font-size:0.65rem;letter-spacing:0.2em;color:var(--gold);font-weight:700;text-transform:uppercase">${p.category}</p>
      <h3>${p.name}</h3>
      <div style="color:var(--gold);font-weight:700;font-size:1.1rem;margin:0.5rem 0">PKR ${p.price.toLocaleString()}</div>
      <p style="font-size:0.8rem;color:var(--white-muted);margin-bottom:1rem">${p.shortDesc}</p>
      <div style="display:flex;gap:0.75rem">
        <button class="btn-gold" onclick="closeProductModal();buyNow('${p.id}')">Buy Now</button>
        <button class="btn-outline" onclick="closeProductModal();openProductDetail('${p.id}')">View Details</button>
      </div>
    </div>`;
  document.getElementById('productModal').classList.add('open');
}
function closeProductModal(e) {
  if(e && e.target !== document.getElementById('productModal')) return;
  document.getElementById('productModal').classList.remove('open');
}

/* ══════════════════
   CART
══════════════════ */
function addToCart(pid, qty=1, size='') {
  const existing = state.cart.find(i=>i.pid===pid && i.size===size);
  if(existing) existing.qty += qty;
  else state.cart.push({pid, qty, size});
  saveState(); updateBadges();
  showToast('Added to cart ✓');
}
function removeFromCart(idx) {
  state.cart.splice(idx,1);
  saveState(); updateBadges(); renderCart();
}
function updateCartQty(idx, delta) {
  state.cart[idx].qty = Math.max(1, state.cart[idx].qty + delta);
  saveState(); renderCart();
}
function renderCart() {
  const wrap = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if(!wrap) return;
  if(!state.cart.length) {
    wrap.innerHTML = '<div class="empty-state"><p>Your cart is empty.</p><button class="btn-gold" onclick="navGo(\'shop\')">Shop Now</button></div>';
    footer.innerHTML=''; return;
  }
  let total=0;
  wrap.innerHTML = state.cart.map((item,i)=>{
    const p = state.products.find(pr=>pr.id===item.pid);
    if(!p) return '';
    const sub = p.price * item.qty; total+=sub;
    const emoji = PRODUCT_EMOJIS[p.category] || '📦';
    const img = p.images && p.images.length ? `<img class="cart-item-img" src="${p.images[0]}" alt="${p.name}"/>` : `<div class="cart-item-img">${emoji}</div>`;
    return `<div class="cart-item">
      ${img}
      <div class="cart-item-info">
        <h4>${p.name}</h4>
        <p>${item.size ? 'Size: '+item.size+' · ' : ''}PKR ${p.price.toLocaleString()}</p>
        <div class="qty-control" style="max-width:120px;margin-top:0.5rem">
          <button onclick="updateCartQty(${i},-1)">−</button>
          <span>${item.qty}</span>
          <button onclick="updateCartQty(${i},1)">+</button>
        </div>
      </div>
      <div class="cart-item-price">PKR ${sub.toLocaleString()}</div>
      <button class="cart-item-remove" onclick="removeFromCart(${i})">✕</button>
    </div>`;
  }).join('');
  footer.innerHTML = `
    <div class="cart-total">Total: <span>PKR ${total.toLocaleString()}</span></div>
    <button class="btn-gold" onclick="checkoutCart()">Checkout</button>`;
}
function checkoutCart() {
  if(!state.cart.length){showToast('Cart is empty');return;}
  const first = state.cart[0];
  state.orderProductId = first.pid;
  state.orderQty = first.qty;
  setupOrderPage(first.pid);
  showPage('order');
}
function updateBadges() {
  const cartCount = state.cart.reduce((s,i)=>s+i.qty,0);
  const wishCount = state.wishlist.length;
  document.getElementById('cartBadge').textContent = cartCount;
  document.getElementById('wishlistBadge').textContent = wishCount;
}

/* ══════════════════
   WISHLIST
══════════════════ */
function toggleWishlist(pid, btn) {
  const idx = state.wishlist.indexOf(pid);
  if(idx>-1) { state.wishlist.splice(idx,1); showToast('Removed from wishlist'); }
  else { state.wishlist.push(pid); showToast('Added to wishlist ♡'); }
  saveState(); updateBadges();
  if(btn) btn.classList.toggle('wishlisted', state.wishlist.includes(pid));
}
function renderWishlist() {
  const grid = document.getElementById('wishlistGrid');
  if(!grid) return;
  const items = state.products.filter(p=>state.wishlist.includes(p.id));
  if(!items.length) {
    grid.innerHTML='<div class="empty-state"><p>Your wishlist is empty.</p><button class="btn-gold" onclick="navGo(\'shop\')">Shop Now</button></div>';
    return;
  }
  renderProducts('wishlistGrid', items);
}

/* ══════════════════
   ORDER
══════════════════ */
function buyNow(pid) {
  state.orderProductId = pid;
  state.orderQty = 1;
  setupOrderPage(pid);
  showPage('order');
}
function setupOrderPage(pid) {
  const p = state.products.find(pr=>pr.id===pid);
  if(!p) return;
  const emoji = PRODUCT_EMOJIS[p.category] || '📦';
  document.getElementById('orderProductSummary').innerHTML = `
    <div style="display:flex;gap:1rem;align-items:center">
      <div style="font-size:2.5rem">${emoji}</div>
      <div>
        <strong>${p.name}</strong>
        <div style="color:var(--gold);font-weight:700">PKR ${p.price.toLocaleString()}</div>
        <div style="font-size:0.75rem;color:var(--white-muted)">${capitalize(p.category)}</div>
      </div>
    </div>`;
  const sizes = p.category==='shoes' ? ['7','8','9','10','11'] : ['S','M','L','XL','XXL'];
  const sel = document.getElementById('ord_size');
  sel.innerHTML = '<option value="">Select Size</option>' + sizes.map(s=>`<option value="${s}">${s}</option>`).join('');
  document.getElementById('orderQty').textContent = 1;
  updateOrderTotal();
}
function orderQtyChange(delta) {
  const p = state.products.find(pr=>pr.id===state.orderProductId);
  const max = p ? p.stock : 99;
  state.orderQty = Math.max(1, Math.min(state.orderQty + delta, max));
  document.getElementById('orderQty').textContent = state.orderQty;
  updateOrderTotal();
}
function updateOrderTotal() {
  const p = state.products.find(pr=>pr.id===state.orderProductId);
  if(!p) return;
  document.getElementById('orderTotal').textContent = `PKR ${(p.price * state.orderQty).toLocaleString()}`;
}
function confirmOrder() {
  const name = document.getElementById('ord_name').value.trim();
  const phone = document.getElementById('ord_phone').value.trim();
  const email = document.getElementById('ord_email').value.trim();
  const country = document.getElementById('ord_country').value;
  const city = document.getElementById('ord_city').value.trim();
  const address = document.getElementById('ord_address').value.trim();
  const size = document.getElementById('ord_size').value;
  if(!name||!phone||!email||!country||!city||!address||!size) { showToast('Please fill all required fields'); return; }
  const p = state.products.find(pr=>pr.id===state.orderProductId);
  if(!p) return;
  const orderId = 'ORD-' + Date.now().toString().slice(-5);
  const order = {
    id: orderId,
    productId: p.id,
    productName: p.name,
    price: p.price,
    qty: state.orderQty,
    total: p.price * state.orderQty,
    size,
    customer: {
      name, age: document.getElementById('ord_age').value,
      phone, whatsapp: document.getElementById('ord_whatsapp').value,
      email, country, city, address,
      postal: document.getElementById('ord_postal').value
    },
    status: 'pending',
    date: new Date().toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'numeric'})
  };
  state.orders.unshift(order);
  if(p.stock>0) p.stock -= state.orderQty;
  if(p.stock===0) { p.badge='SOLD OUT'; }
  saveState();
  // Show success
  document.querySelector('.order-page').innerHTML = `
    <div style="text-align:center;padding:4rem 1rem">
      <div style="font-size:4rem;margin-bottom:1rem">✓</div>
      <h2 style="font-family:var(--font-display);font-weight:300;font-size:2.2rem;margin-bottom:0.5rem">Order Confirmed!</h2>
      <p style="color:var(--white-muted);margin-bottom:1.5rem">Thank you <strong>${name}</strong>. Your order has been placed successfully.</p>
      <div class="success-banner" style="display:inline-block">
        Order ID: <span class="order-id-display">${orderId}</span>
      </div>
      <p style="color:var(--white-muted);font-size:0.8rem;margin-top:1rem">Save this ID to track your order.</p>
      <div style="display:flex;gap:1rem;justify-content:center;margin-top:2rem;flex-wrap:wrap">
        <button class="btn-gold" onclick="navGo('home')">Continue Shopping</button>
        <button class="btn-outline" onclick="navGo('track-order')">Track Order</button>
      </div>
    </div>`;
}

/* ══════════════════
   TRACK ORDER
══════════════════ */
function trackOrder() {
  const id = document.getElementById('trackOrderId').value.trim().toUpperCase();
  const order = state.orders.find(o=>o.id===id);
  const result = document.getElementById('trackResult');
  if(!order) {
    result.innerHTML = `<div style="color:#e53e3e;margin-top:1rem;padding:1rem;background:rgba(229,62,62,0.08);border-radius:4px">Order not found. Check your Order ID and try again.</div>`;
    return;
  }
  result.innerHTML = `
    <div class="track-result">
      <strong>Order: ${order.id}</strong>
      <div class="status-badge status-${order.status}">${capitalize(order.status)}</div>
      <table style="margin-top:1rem;font-size:0.85rem;width:100%;border-collapse:collapse">
        <tr><td style="color:var(--white-muted);padding:0.4rem 0;width:40%">Product</td><td>${order.productName}</td></tr>
        <tr><td style="color:var(--white-muted);padding:0.4rem 0">Customer</td><td>${order.customer.name}</td></tr>
        <tr><td style="color:var(--white-muted);padding:0.4rem 0">Quantity</td><td>${order.qty}</td></tr>
        <tr><td style="color:var(--white-muted);padding:0.4rem 0">Total</td><td style="color:var(--gold);font-weight:700">PKR ${order.total.toLocaleString()}</td></tr>
        <tr><td style="color:var(--white-muted);padding:0.4rem 0">Date</td><td>${order.date}</td></tr>
      </table>
    </div>`;
}

/* ══════════════════
   REVIEWS
══════════════════ */
let detailRating = 0;
function setRating(n) {
  state.selectedRating = n;
  const stars = document.querySelectorAll('#starPicker span');
  stars.forEach((s,i)=>s.classList.toggle('lit',i<n));
}
function setDetailRating(n) {
  detailRating = n;
  const stars = document.querySelectorAll('#dStarPicker span');
  stars.forEach((s,i)=>s.classList.toggle('lit',i<n));
}
function submitReview(pid) {
  const isDetail = pid !== null;
  const nameEl = document.getElementById(isDetail?'drev_name':'rev_name');
  const textEl = document.getElementById(isDetail?'drev_text':'rev_text');
  const rating = isDetail ? detailRating : state.selectedRating;
  const name = nameEl.value.trim();
  const text = textEl.value.trim();
  if(!name||!text||!rating) { showToast('Please fill in all review fields and select a rating.'); return; }
  const review = {
    id: 'rev'+Date.now(), productId: pid, name, text, rating,
    date: new Date().toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'numeric'}),
    approved: true
  };
  state.reviews.unshift(review);
  if(pid) {
    const p = state.products.find(pr=>pr.id===pid);
    if(p) { p.reviews++; }
  }
  saveState();
  nameEl.value=''; textEl.value='';
  if(isDetail) { detailRating=0; document.querySelectorAll('#dStarPicker span').forEach(s=>s.classList.remove('lit')); }
  else { state.selectedRating=0; document.querySelectorAll('#starPicker span').forEach(s=>s.classList.remove('lit')); }
  showToast('Review submitted! Thank you ★');
  if(isDetail) {
    const rev = document.getElementById('productReviews');
    if(rev) rev.innerHTML = `<div class="review-card"><div class="review-card-header"><span class="review-card-name">${escHTML(name)}</span><span class="review-card-date">Just now</span></div><div class="stars">${renderStars(rating)}</div><p class="review-card-text">${escHTML(text)}</p></div>` + rev.innerHTML;
  }
}
function openReviewForm(pid) {
  state.currentProductId = pid;
  navGo('reviews-page');
}
function renderAllReviews() {
  const wrap = document.getElementById('allReviewsList');
  if(!wrap) return;
  const approved = state.reviews.filter(r=>r.approved);
  if(!approved.length) { wrap.innerHTML='<p style="color:var(--white-muted);padding:2rem 0">No reviews yet.</p>'; return; }
  wrap.innerHTML = approved.map(r=>{
    const pName = r.productId ? (state.products.find(p=>p.id===r.productId)||{name:''}).name : 'General';
    return `<div class="review-card" style="margin-bottom:1rem">
      <div class="review-card-header">
        <span class="review-card-name">${escHTML(r.name)}</span>
        <span class="review-card-date">${r.date}</span>
      </div>
      ${pName?`<p style="font-size:0.7rem;color:var(--gold);margin-bottom:0.3rem">${pName}</p>`:''}
      <div class="stars">${renderStars(r.rating)}</div>
      <p class="review-card-text">${escHTML(r.text)}</p>
    </div>`;
  }).join('');
}

/* ══════════════════
   ACCOUNT
══════════════════ */
function renderAccount() {
  const wrap = document.getElementById('myOrdersList');
  if(!wrap) return;
  if(!state.orders.length) { wrap.innerHTML='<p style="color:var(--white-muted)">No orders yet.</p>'; return; }
  wrap.innerHTML = `<table class="admin-table"><thead><tr><th>Order ID</th><th>Product</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>
    ${state.orders.slice(0,10).map(o=>`<tr>
      <td style="color:var(--gold)">${o.id}</td>
      <td>${o.productName}</td>
      <td>PKR ${o.total.toLocaleString()}</td>
      <td><span class="status-badge status-${o.status}">${capitalize(o.status)}</span></td>
      <td>${o.date}</td>
    </tr>`).join('')}
  </tbody></table>`;
}

/* ══════════════════
   ADMIN
══════════════════ */
function adminLogin() {
  const u = document.getElementById('adminUser').value.trim();
  const p = document.getElementById('adminPass').value;
  const err = document.getElementById('adminLoginError');
  if(u==='Sudais' && p===state.adminPassword) {
    state.adminLoggedIn = true;
    err.textContent='';
    showPage('admin');
    renderAdminDashboard();
  } else {
    err.textContent = 'Invalid username or password.';
  }
}
function adminLogout() {
  state.adminLoggedIn = false;
  showPage('home');
}

function adminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.admin-nav-link').forEach(l=>l.classList.remove('active'));
  document.getElementById('admin-tab-'+tab).classList.add('active');
  document.getElementById('atab-'+tab).classList.add('active');
  if(tab==='products') renderAdminProducts();
  if(tab==='orders') renderAdminOrders('all');
  if(tab==='reviews') renderAdminReviews();
  if(tab==='categories') renderCategories();
  if(tab==='banners') renderBanners();
  if(tab==='footer') loadFooterForm();
  if(tab==='dashboard') renderAdminDashboard();
}

function renderAdminDashboard() {
  const total = state.orders.reduce((s,o)=>s+o.total,0);
  const customers = [...new Set(state.orders.map(o=>o.customer.email))].length;
  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card"><div class="stat-num">${state.products.length}</div><div class="stat-label">Products</div></div>
    <div class="stat-card"><div class="stat-num">${state.orders.length}</div><div class="stat-label">Orders</div></div>
    <div class="stat-card"><div class="stat-num">${state.reviews.length}</div><div class="stat-label">Reviews</div></div>
    <div class="stat-card"><div class="stat-num">${customers}</div><div class="stat-label">Customers</div></div>
    <div class="stat-card"><div class="stat-num" style="font-size:1.4rem">PKR ${total.toLocaleString()}</div><div class="stat-label">Revenue</div></div>`;
  const recent = state.orders.slice(0,5);
  document.getElementById('adminRecentOrders').innerHTML = recent.length
    ? `<table class="admin-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Total</th><th>Status</th></tr></thead><tbody>
      ${recent.map(o=>`<tr><td style="color:var(--gold)">${o.id}</td><td>${o.customer.name}</td><td>${o.productName}</td><td>PKR ${o.total.toLocaleString()}</td><td><span class="status-badge status-${o.status}">${capitalize(o.status)}</span></td></tr>`).join('')}
    </tbody></table>`
    : '<p style="color:var(--white-muted)">No orders yet.</p>';
}

function renderAdminProducts() {
  const wrap = document.getElementById('adminProductsList');
  if(!wrap) return;
  wrap.innerHTML = `<table class="admin-table"><thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>
    ${state.products.map(p=>`<tr>
      <td>${p.name}</td>
      <td>${capitalize(p.category)}</td>
      <td>PKR ${p.price.toLocaleString()}</td>
      <td>${p.stock}</td>
      <td>
        <button class="tbl-action tbl-edit" onclick="openEditProduct('${p.id}')">Edit</button>
        <button class="tbl-action tbl-delete" onclick="deleteProduct('${p.id}')">Delete</button>
      </td>
    </tr>`).join('')}
  </tbody></table>`;
}

function renderAdminOrders(filter) {
  const wrap = document.getElementById('adminOrdersList');
  if(!wrap) return;
  const orders = filter==='all' ? state.orders : state.orders.filter(o=>o.status===filter);
  if(!orders.length) { wrap.innerHTML='<p style="color:var(--white-muted);margin-top:1rem">No orders.</p>'; return; }
  wrap.innerHTML = `<table class="admin-table"><thead><tr><th>ID</th><th>Customer</th><th>Product</th><th>Qty</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>
    ${orders.map(o=>`<tr>
      <td style="color:var(--gold)">${o.id}</td>
      <td>${o.customer.name}<br><small style="color:var(--white-muted)">${o.customer.phone}</small></td>
      <td>${o.productName}<br><small>Size: ${o.size}</small></td>
      <td>${o.qty}</td>
      <td>PKR ${o.total.toLocaleString()}</td>
      <td>
        <select class="status-select" onchange="updateOrderStatus('${o.id}',this.value)">
          <option value="pending" ${o.status==='pending'?'selected':''}>Pending</option>
          <option value="processing" ${o.status==='processing'?'selected':''}>Processing</option>
          <option value="completed" ${o.status==='completed'?'selected':''}>Completed</option>
        </select>
      </td>
      <td>${o.date}</td>
    </tr>`).join('')}
  </tbody></table>`;
}
function filterOrders(f, btn) {
  document.querySelectorAll('.order-filter-tabs .filter-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderAdminOrders(f);
}
function updateOrderStatus(oid, status) {
  const o = state.orders.find(o=>o.id===oid);
  if(o) { o.status=status; saveState(); }
}

function renderAdminReviews() {
  const wrap = document.getElementById('adminReviewsList');
  if(!wrap) return;
  if(!state.reviews.length) { wrap.innerHTML='<p style="color:var(--white-muted)">No reviews.</p>'; return; }
  wrap.innerHTML = `<table class="admin-table"><thead><tr><th>Customer</th><th>Product</th><th>Rating</th><th>Review</th><th>Status</th><th>Actions</th></tr></thead><tbody>
    ${state.reviews.map((r,i)=>`<tr>
      <td>${r.name}</td>
      <td>${r.productId?(state.products.find(p=>p.id===r.productId)||{name:'N/A'}).name:'General'}</td>
      <td><span style="color:var(--gold)">${renderStars(r.rating)}</span></td>
      <td style="max-width:200px;font-size:0.78rem">${escHTML(r.text.slice(0,80))}${r.text.length>80?'…':''}</td>
      <td>${r.approved?'<span style="color:#48bb78">Approved</span>':'<span style="color:#ed8936">Pending</span>'}</td>
      <td>
        ${!r.approved?`<button class="tbl-action tbl-approve" onclick="approveReview(${i})">Approve</button>`:''}
        <button class="tbl-action tbl-delete" onclick="deleteReview(${i})">Delete</button>
      </td>
    </tr>`).join('')}
  </tbody></table>`;
}
function approveReview(i) { state.reviews[i].approved=true; saveState(); renderAdminReviews(); }
function deleteReview(i) { if(confirm('Delete this review?')){ state.reviews.splice(i,1); saveState(); renderAdminReviews(); } }

function renderCategories() {
  const wrap = document.getElementById('categoriesList');
  if(!wrap) return;
  wrap.innerHTML = state.categories.map((c,i)=>`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem 1rem;background:var(--black3);border-radius:4px;margin-bottom:0.5rem">
      <span style="font-size:0.9rem">${capitalize(c)}</span>
      <button class="tbl-action tbl-delete" onclick="deleteCategory(${i})">Delete</button>
    </div>`).join('');
}
function addCategory() {
  const name = document.getElementById('newCatName').value.trim().toLowerCase();
  if(!name) return;
  if(!state.categories.includes(name)) { state.categories.push(name); saveState(); renderCategories(); showToast('Category added'); }
  document.getElementById('newCatName').value='';
}
function deleteCategory(i) {
  const name = state.categories[i];
  if(['clothing','shoes','accessories'].includes(name)){showToast('Cannot delete default category');return;}
  if(confirm('Delete category?')){ state.categories.splice(i,1); saveState(); renderCategories(); }
}

/* Add/Edit Product */
function openAddProduct() {
  document.getElementById('editProductId').value='';
  document.getElementById('addProductTitle').textContent='Add New Product';
  ['p_name','p_price','p_short_desc','p_desc','p_stock','p_badge','p_images','p_colors'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('p_category').value='clothing';
  document.getElementById('addProductModal').classList.add('open');
}
function openEditProduct(pid) {
  const p = state.products.find(pr=>pr.id===pid);
  if(!p) return;
  document.getElementById('editProductId').value=pid;
  document.getElementById('addProductTitle').textContent='Edit Product';
  document.getElementById('p_name').value=p.name;
  document.getElementById('p_price').value=p.price;
  document.getElementById('p_category').value=p.category;
  document.getElementById('p_short_desc').value=p.shortDesc;
  document.getElementById('p_desc').value=p.desc;
  document.getElementById('p_stock').value=p.stock;
  document.getElementById('p_badge').value=p.badge;
  document.getElementById('p_images').value=(p.images||[]).join(', ');
  document.getElementById('p_colors').value=(p.colors||[]).join(', ');
  document.getElementById('addProductModal').classList.add('open');
}
function closeAddProductModal(e) {
  if(e && e.target!==document.getElementById('addProductModal')) return;
  document.getElementById('addProductModal').classList.remove('open');
}
function saveProduct() {
  const name=document.getElementById('p_name').value.trim();
  const price=parseInt(document.getElementById('p_price').value)||0;
  const cat=document.getElementById('p_category').value;
  const stock=parseInt(document.getElementById('p_stock').value)||0;
  if(!name||!price||!cat){showToast('Name, price, category required');return;}
  const data = {
    name, price, category:cat,
    shortDesc:document.getElementById('p_short_desc').value.trim(),
    desc:document.getElementById('p_desc').value.trim(),
    stock,
    badge:document.getElementById('p_badge').value.trim(),
    images:document.getElementById('p_images').value.split(',').map(s=>s.trim()).filter(Boolean),
    colors:document.getElementById('p_colors').value.split(',').map(s=>s.trim()).filter(Boolean),
    rating:4.5, reviews:0, isNew:true,
    specs:{}
  };
  const editId=document.getElementById('editProductId').value;
  if(editId) {
    const idx=state.products.findIndex(p=>p.id===editId);
    if(idx>-1) { state.products[idx]={...state.products[idx],...data}; showToast('Product updated'); }
  } else {
    data.id='p'+Date.now();
    state.products.unshift(data);
    showToast('Product added');
  }
  saveState();
  closeAddProductModal({target:document.getElementById('addProductModal')});
  renderAdminProducts();
}
function deleteProduct(pid) {
  if(!confirm('Delete this product?')) return;
  state.products=state.products.filter(p=>p.id!==pid);
  saveState(); renderAdminProducts(); showToast('Product deleted');
}

/* Banners */
function addBanner() {
  const title=document.getElementById('bannerTitle').value.trim();
  const sub=document.getElementById('bannerSub').value.trim();
  if(!title) return;
  state.banners.push({id:'b'+Date.now(),title,sub});
  saveState(); renderBanners();
  document.getElementById('bannerTitle').value='';
  document.getElementById('bannerSub').value='';
}
function renderBanners() {
  const wrap=document.getElementById('bannersList');
  if(!wrap) return;
  if(!state.banners.length){wrap.innerHTML='<p style="color:var(--white-muted)">No banners added.</p>';return;}
  wrap.innerHTML=state.banners.map((b,i)=>`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:1rem;background:var(--black3);border-radius:4px;margin-bottom:0.5rem">
      <div><strong>${b.title}</strong><p style="color:var(--white-muted);font-size:0.8rem;margin:0.2rem 0 0">${b.sub}</p></div>
      <button class="tbl-action tbl-delete" onclick="deleteBanner(${i})">Remove</button>
    </div>`).join('');
}
function deleteBanner(i){state.banners.splice(i,1);saveState();renderBanners();}

/* Footer Settings */
function loadFooterForm() {
  const f=state.footerSettings;
  if(!f) return;
  ['fEmail','fWhatsapp','fPhone','fAddress','fInsta','fFb','fTiktok','fYt','fLi'].forEach(id=>{
    const el=document.getElementById(id);
    if(el && f[id]) el.value=f[id];
  });
}
function saveFooterSettings() {
  ['fEmail','fWhatsapp','fPhone','fAddress','fInsta','fFb','fTiktok','fYt','fLi'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) state.footerSettings[id]=el.value;
  });
  saveState(); showToast('Footer settings saved ✓');
}

/* Password */
function changeAdminPassword() {
  const cur=document.getElementById('curPass').value;
  const nw=document.getElementById('newPass').value;
  const conf=document.getElementById('confPass').value;
  const msg=document.getElementById('pwMsg');
  if(cur!==state.adminPassword){msg.innerHTML='<p style="color:#e53e3e;font-size:0.85rem;margin-top:0.5rem">Current password incorrect.</p>';return;}
  if(nw.length<6){msg.innerHTML='<p style="color:#e53e3e;font-size:0.85rem;margin-top:0.5rem">Password must be at least 6 characters.</p>';return;}
  if(nw!==conf){msg.innerHTML='<p style="color:#e53e3e;font-size:0.85rem;margin-top:0.5rem">Passwords do not match.</p>';return;}
  state.adminPassword=nw;
  saveState();
  msg.innerHTML='<p style="color:#48bb78;font-size:0.85rem;margin-top:0.5rem">Password updated successfully ✓</p>';
  ['curPass','newPass','confPass'].forEach(id=>document.getElementById(id).value='');
}

/* ══════════════════
   TOAST
══════════════════ */
let toastTimer=null;
function showToast(msg) {
  const toast=document.getElementById('toast');
  toast.textContent=msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove('show'),3000);
}

/* ══════════════════
   UTILS
══════════════════ */
function capitalize(s){return s?s.charAt(0).toUpperCase()+s.slice(1):'';}
function escHTML(s){return s?s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'):''; }

/* ══════════════════
   BOOT
══════════════════ */
document.addEventListener('DOMContentLoaded', init);
