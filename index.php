<?php
require_once 'php/config.php';

$banners = get_banners();
$featured = get_products(null, null, true);
$new_arrivals = get_products(8, null, false, true);
$best_sellers = get_products(6, null, false, false, true);
$all_products = get_products();

$settings = get_all_settings();

// Get a sample of homepage reviews
$pdo = db_connect();
$reviews_stmt = $pdo->query("SELECT r.*, p.name as product_name FROM reviews r JOIN products p ON r.product_id = p.id WHERE r.is_approved = 1 ORDER BY r.created_at DESC LIMIT 6");
$homepage_reviews = $reviews_stmt->fetchAll();

function product_card($p, $show_full = true) {
    $images = array_filter(explode('||', $p['images'] ?? ''));
    if (empty($images)) $images = ['https://via.placeholder.com/400x400?text=OPAL'];
    $images = array_values($images);
    $price_html = $p['sale_price']
        ? '<span class="product-price-sale">$' . number_format($p['sale_price'],2) . '</span><span class="product-price-original">$' . number_format($p['price'],2) . '</span>'
        : '<span class="product-price">$' . number_format($p['price'],2) . '</span>';
    $stock_class = $p['stock'] > 10 ? 'in-stock' : ($p['stock'] > 0 ? 'low-stock' : 'out-stock');
    $stock_label = $p['stock'] > 10 ? 'In Stock' : ($p['stock'] > 0 ? 'Only ' . $p['stock'] . ' left' : 'Sold Out');
    $img_tags = '';
    foreach ($images as $i => $img) {
        $img_tags .= '<img class="product-img ' . ($i === 0 ? 'visible' : 'hidden') . '" src="' . htmlspecialchars($img) . '" alt="' . htmlspecialchars($p['name']) . '" loading="lazy">';
    }
    $primary_img = htmlspecialchars($images[0]);
    $buy_disabled = $p['stock'] == 0 ? 'disabled style="opacity:.5;cursor:not-allowed"' : '';
    ob_start(); ?>
    <div class="product-card">
        <div class="product-image-wrap">
            <?php echo $img_tags; ?>
            <div class="product-img-arrows">
                <button class="img-arrow img-arrow-prev" aria-label="Previous image"><i class="fas fa-chevron-left"></i></button>
                <button class="img-arrow img-arrow-next" aria-label="Next image"><i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="product-badges">
                <?php if ($p['is_new_arrival']): ?><span class="badge badge-gold">New</span><?php endif; ?>
                <?php if ($p['is_best_seller']): ?><span class="badge badge-black">Bestseller</span><?php endif; ?>
                <?php if ($p['stock'] == 0): ?><span class="badge badge-sold">Sold Out</span><?php endif; ?>
                <?php if ($p['sale_price']): ?><span class="badge" style="background:#e74c3c;color:#fff">Sale</span><?php endif; ?>
            </div>
            <div class="product-actions">
                <button class="product-action-btn wishlist-btn"
                    data-product-id="<?= $p['id'] ?>"
                    data-product-name="<?= htmlspecialchars($p['name']) ?>"
                    data-product-price="<?= $p['sale_price'] ?? $p['price'] ?>"
                    data-product-image="<?= $primary_img ?>"
                    title="Add to Wishlist">
                    <i class="far fa-heart"></i>
                </button>
                <a href="product.php?slug=<?= urlencode($p['slug']) ?>" class="product-action-btn" title="Quick View">
                    <i class="far fa-eye"></i>
                </a>
            </div>
        </div>
        <div class="product-info">
            <div class="product-category-tag"><?= htmlspecialchars($p['category_name'] ?? '') ?></div>
            <a href="product.php?slug=<?= urlencode($p['slug']) ?>">
                <h3 class="product-name"><?= htmlspecialchars($p['name']) ?></h3>
            </a>
            <p class="product-description"><?= htmlspecialchars($p['short_description'] ?? '') ?></p>
            <div class="product-rating">
                <div class="stars"><?= render_stars($p['rating'] ?? 0) ?></div>
                <span class="rating-count">(<?= $p['review_count'] ?? 0 ?>)</span>
            </div>
            <div class="product-price-row">
                <div><?= $price_html ?></div>
                <span class="stock-badge <?= $stock_class ?>"><?= $stock_label ?></span>
            </div>
            <div class="product-card-btns">
                <button class="btn btn-primary btn-sm buy-now-btn" data-product-slug="<?= htmlspecialchars($p['slug']) ?>" <?= $buy_disabled ?>>
                    <i class="fas fa-bolt"></i> Buy Now
                </button>
                <a href="product.php?slug=<?= urlencode($p['slug']) ?>#reviews" class="btn btn-outline-dark btn-sm">
                    <i class="far fa-star"></i> Reviews
                </a>
            </div>
        </div>
    </div>
    <?php return ob_get_clean();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="OPAL OUTFITTERS - Premium fashion brand offering clothing, shoes & accessories. Shop the latest collections.">
<meta name="keywords" content="fashion, clothing, shoes, accessories, premium, luxury">
<title>OPAL OUTFITTERS — Premium Fashion Store</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Jost:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<!-- HEADER -->
<header class="site-header" id="siteHeader">
    <div class="header-inner">
        <a href="index.php" class="logo">
            <div class="logo-name">OPAL <span>OUTFITTERS</span></div>
            <div class="logo-tagline">Premium Fashion</div>
        </a>
        <div class="header-actions">
            <button class="header-icon-btn" id="searchToggle" title="Search" aria-label="Search">
                <i class="fas fa-search"></i>
            </button>
            <button class="header-icon-btn" id="cartToggle" title="Cart" aria-label="Shopping Cart">
                <i class="fas fa-shopping-bag"></i>
                <span class="cart-count" style="display:none">0</span>
            </button>
            <button class="header-icon-btn" title="Wishlist" aria-label="Wishlist">
                <i class="far fa-heart"></i>
                <span class="wishlist-count" style="display:none">0</span>
            </button>
            <button class="header-icon-btn" title="Account" aria-label="Account">
                <i class="far fa-user"></i>
            </button>
            <button class="hamburger" id="hamburger" aria-label="Menu">
                <span></span><span></span><span></span>
            </button>
        </div>
    </div>
</header>

<!-- SEARCH BAR -->
<div class="search-bar" id="searchBar">
    <div class="search-input-wrap">
        <input type="text" id="searchInput" placeholder="Search products, categories..." autocomplete="off">
        <button class="search-submit"><i class="fas fa-search"></i></button>
        <div class="search-results-dropdown" id="searchResultsDropdown"></div>
    </div>
</div>

<!-- NAV OVERLAY -->
<div class="nav-overlay" id="navOverlay"></div>

<!-- SIDE NAV -->
<nav class="side-nav" id="sideNav" aria-label="Main Navigation">
    <div class="side-nav-header">
        <div class="logo">
            <div class="logo-name" style="font-size:18px">OPAL <span>OUTFITTERS</span></div>
        </div>
        <button class="side-nav-close" aria-label="Close menu"><i class="fas fa-times"></i></button>
    </div>
    <ul>
        <li><a href="index.php"><i class="fas fa-home"></i> Home</a></li>
        <li><a href="shop.php"><i class="fas fa-store"></i> Shop</a></li>
        <li><a href="shop.php"><i class="fas fa-th-large"></i> Categories</a></li>
    </ul>
    <div class="nav-divider"></div>
    <ul>
        <li style="padding:8px 24px 4px"><span style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#666">Collections</span></li>
        <li><a href="shop.php?filter=new"><i class="fas fa-star"></i> New Arrivals</a></li>
        <li><a href="shop.php?filter=best"><i class="fas fa-fire"></i> Best Sellers</a></li>
        <li><a href="shop.php?category=shoes"><i class="fas fa-shoe-prints"></i> Shoes</a></li>
        <li><a href="shop.php?category=clothing"><i class="fas fa-tshirt"></i> Clothing</a></li>
        <li><a href="shop.php?category=accessories"><i class="fas fa-gem"></i> Accessories</a></li>
    </ul>
    <div class="nav-divider"></div>
    <ul>
        <li><a href="track_order.php"><i class="fas fa-truck"></i> Track Order</a></li>
        <li><a href="reviews.php"><i class="fas fa-comments"></i> Reviews</a></li>
        <li><a href="about.php"><i class="fas fa-info-circle"></i> About Us</a></li>
        <li><a href="contact.php"><i class="fas fa-envelope"></i> Contact Us</a></li>
        <li><a href="story.php"><i class="fas fa-book-open"></i> Our Story</a></li>
    </ul>
    <div class="nav-divider"></div>
    <ul>
        <li><a href="admin/login.php"><i class="fas fa-lock"></i> Admin Login</a></li>
    </ul>
</nav>

<!-- CART SIDEBAR -->
<div class="cart-sidebar" id="cartSidebar">
    <div class="cart-sidebar-header">
        <span class="cart-sidebar-title">Shopping Cart</span>
        <button class="cart-close" id="cartClose"><i class="fas fa-times"></i></button>
    </div>
    <div class="cart-items" id="cartItems">
        <div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>Your cart is empty</p></div>
    </div>
    <div class="cart-footer">
        <div class="cart-subtotal">
            <span>Subtotal</span>
            <span id="cartSubtotal">$0.00</span>
        </div>
        <a href="checkout.php" class="btn btn-primary btn-full">Proceed to Checkout <i class="fas fa-arrow-right"></i></a>
    </div>
</div>

<!-- HERO SLIDER -->
<section class="hero" aria-label="Hero Slider">
    <?php foreach ($banners as $i => $banner): ?>
    <div class="hero-slide <?= $i === 0 ? 'active' : '' ?>">
        <img class="hero-bg" src="<?= htmlspecialchars($banner['image_path']) ?>" alt="<?= htmlspecialchars($banner['title']) ?>" loading="<?= $i === 0 ? 'eager' : 'lazy' ?>">
        <div class="hero-overlay"></div>
        <div class="hero-content">
            <div class="hero-content-inner">
                <div class="hero-eyebrow">New Collection 2024</div>
                <h1 class="hero-title"><?= htmlspecialchars($banner['title'] ?? '') ?> <br><em><?= htmlspecialchars($banner['subtitle'] ?? '') ?></em></h1>
                <p class="hero-subtitle">Discover premium fashion crafted for the modern individual. Quality, style, and elegance in every piece.</p>
                <div class="hero-buttons">
                    <a href="<?= htmlspecialchars($banner['button_link'] ?? 'shop.php') ?>" class="btn btn-primary">
                        <i class="fas fa-shopping-bag"></i> <?= htmlspecialchars($banner['button_text'] ?? 'Shop Now') ?>
                    </a>
                    <a href="shop.php?filter=new" class="btn btn-outline">
                        <i class="fas fa-star"></i> New Collection
                    </a>
                </div>
            </div>
        </div>
    </div>
    <?php endforeach; ?>

    <div class="hero-arrows">
        <button class="hero-arrow hero-prev" aria-label="Previous slide"><i class="fas fa-chevron-left"></i></button>
        <button class="hero-arrow hero-next" aria-label="Next slide"><i class="fas fa-chevron-right"></i></button>
    </div>
    <div class="hero-dots">
        <?php foreach ($banners as $i => $b): ?>
        <button class="hero-dot <?= $i === 0 ? 'active' : '' ?>" aria-label="Slide <?= $i+1 ?>"></button>
        <?php endforeach; ?>
    </div>
</section>

<!-- CATEGORIES STRIP -->
<section class="categories-strip">
    <div class="container">
        <div class="section-header">
            <span class="section-eyebrow">Explore</span>
            <h2 class="section-title">Shop by Category</h2>
        </div>
        <div class="categories-grid">
            <a href="shop.php?category=clothing" class="category-card">
                <img src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80" alt="Clothing" loading="lazy">
                <div class="category-card-overlay"></div>
                <div class="category-card-content">
                    <div class="category-card-title">Clothing</div>
                    <div class="category-card-count">Explore Collection</div>
                </div>
            </a>
            <a href="shop.php?category=shoes" class="category-card">
                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80" alt="Shoes" loading="lazy">
                <div class="category-card-overlay"></div>
                <div class="category-card-content">
                    <div class="category-card-title">Shoes</div>
                    <div class="category-card-count">Explore Collection</div>
                </div>
            </a>
            <a href="shop.php?category=accessories" class="category-card">
                <img src="https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?w=600&q=80" alt="Accessories" loading="lazy">
                <div class="category-card-overlay"></div>
                <div class="category-card-content">
                    <div class="category-card-title">Accessories</div>
                    <div class="category-card-count">Explore Collection</div>
                </div>
            </a>
        </div>
    </div>
</section>

<!-- ALL PRODUCTS -->
<section class="section" id="products">
    <div class="container">
        <div class="section-header">
            <span class="section-eyebrow">Our Collection</span>
            <h2 class="section-title">Featured Products</h2>
            <p class="section-subtitle">Handpicked premium pieces for the discerning fashion enthusiast.</p>
        </div>
        <div class="products-grid">
            <?php foreach ($all_products as $p): echo product_card($p); endforeach; ?>
        </div>
    </div>
</section>

<!-- NEW ARRIVALS -->
<?php if (!empty($new_arrivals)): ?>
<section class="section" style="background:var(--grey-100)">
    <div class="container">
        <div class="section-header">
            <span class="section-eyebrow">Just In</span>
            <h2 class="section-title">New Arrivals</h2>
            <p class="section-subtitle">Fresh styles arriving every week. Be the first to wear the latest.</p>
        </div>
        <div class="products-grid">
            <?php foreach ($new_arrivals as $p): echo product_card($p); endforeach; ?>
        </div>
        <div class="text-center" style="margin-top:40px">
            <a href="shop.php?filter=new" class="btn btn-outline-dark">View All New Arrivals <i class="fas fa-arrow-right"></i></a>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- BEST SELLERS -->
<?php if (!empty($best_sellers)): ?>
<section class="section">
    <div class="container">
        <div class="section-header">
            <span class="section-eyebrow">Top Picks</span>
            <h2 class="section-title">Best Sellers</h2>
            <p class="section-subtitle">Our most-loved pieces — proven favourites chosen by thousands of customers.</p>
        </div>
        <div class="products-grid">
            <?php foreach ($best_sellers as $p): echo product_card($p); endforeach; ?>
        </div>
        <div class="text-center" style="margin-top:40px">
            <a href="shop.php?filter=best" class="btn btn-outline-dark">View All Best Sellers <i class="fas fa-arrow-right"></i></a>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- WHY US -->
<section class="section" style="background:var(--black);color:var(--white)">
    <div class="container">
        <div class="section-header">
            <span class="section-eyebrow">Why Choose Us</span>
            <h2 class="section-title" style="color:var(--white)">The OPAL Promise</h2>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px">
            <?php
            $promises = [
                ['icon'=>'fa-gem','title'=>'Premium Quality','desc'=>'Every product is crafted from finest materials for lasting quality and style.'],
                ['icon'=>'fa-truck','title'=>'Fast Delivery','desc'=>'Swift and secure delivery to your doorstep, wherever you are.'],
                ['icon'=>'fa-shield-alt','title'=>'Secure Payment','desc'=>'Your transactions are protected with the highest security standards.'],
                ['icon'=>'fa-undo','title'=>'Easy Returns','desc'=>'30-day hassle-free returns. Your satisfaction is our guarantee.'],
            ];
            foreach ($promises as $pm): ?>
            <div style="text-align:center;padding:32px 20px">
                <div style="width:64px;height:64px;background:rgba(212,175,55,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:24px;color:var(--gold)">
                    <i class="fas <?= $pm['icon'] ?>"></i>
                </div>
                <h3 style="font-family:var(--font-display);font-size:20px;margin-bottom:10px;color:var(--white)"><?= $pm['title'] ?></h3>
                <p style="font-size:14px;color:rgba(255,255,255,0.6);line-height:1.7"><?= $pm['desc'] ?></p>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- REVIEWS -->
<?php if (!empty($homepage_reviews)): ?>
<section class="section reviews-section">
    <div class="container">
        <div class="section-header">
            <span class="section-eyebrow">Testimonials</span>
            <h2 class="section-title" style="color:var(--white)">What Our Customers Say</h2>
        </div>
        <div class="reviews-grid">
            <?php foreach ($homepage_reviews as $r): ?>
            <div class="review-card">
                <div class="review-stars"><?= render_stars($r['rating']) ?></div>
                <p class="review-text">"<?= htmlspecialchars($r['review_text']) ?>"</p>
                <div class="review-author"><?= htmlspecialchars($r['customer_name']) ?></div>
                <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:4px"><?= $r['product_name'] ?></div>
            </div>
            <?php endforeach; ?>
        </div>
        <div class="text-center" style="margin-top:40px">
            <a href="reviews.php" class="btn btn-outline">View All Reviews <i class="fas fa-arrow-right"></i></a>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- FOOTER -->
<?php include 'php/footer.php'; ?>

<div id="toastContainer" class="toast-container"></div>
<script src="js/main.js"></script>
</body>
</html>
