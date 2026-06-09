<?php
require_once 'php/config.php';

$slug = sanitize($_GET['slug'] ?? '');
if (!$slug) { header('Location: index.php'); exit; }

$product = get_product_by_slug($slug);
if (!$product) { header('HTTP/1.0 404 Not Found'); include '404.php'; exit; }

$reviews = get_reviews($product['id']);
$related = get_products(4, $product['category_slug'] ?? null);
$related = array_filter($related, fn($p) => $p['id'] != $product['id']);
$related = array_slice($related, 0, 4);

$price_display = $product['sale_price']
    ? '<span class="sale">$' . number_format($product['sale_price'],2) . '</span><span class="original">$' . number_format($product['price'],2) . '</span>'
    : '$' . number_format($product['price'],2);

$active_price = $product['sale_price'] ?? $product['price'];
$is_clothing = ($product['category_slug'] ?? '') === 'clothing';
$is_shoes = ($product['category_slug'] ?? '') === 'shoes';
$settings = get_all_settings();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="<?= htmlspecialchars($product['short_description'] ?? '') ?>">
<title><?= htmlspecialchars($product['name']) ?> — OPAL OUTFITTERS</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Jost:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link rel="stylesheet" href="css/style.css">
<style>
.review-star-input { font-size:28px; color:var(--grey-300); cursor:pointer; transition:color 0.2s; }
.review-star-input.active { color:var(--gold); }
.review-form-card { background:var(--white); border:1px solid var(--grey-200); border-radius:var(--radius-md); padding:32px; margin-bottom:24px; }
.review-list-item { padding:20px 0; border-bottom:1px solid var(--grey-200); }
.review-list-item:last-child { border-bottom:none; }
.review-list-reviewer { font-weight:600; font-size:14px; margin-bottom:4px; }
.review-list-date { font-size:12px; color:var(--grey-500); margin-bottom:8px; }
.review-list-text { font-size:15px; color:var(--grey-700); line-height:1.7; }
.specs-table { width:100%; border-collapse:collapse; }
.specs-table td { padding:10px 0; border-bottom:1px solid var(--grey-200); font-size:14px; }
.specs-table td:first-child { font-weight:600; color:var(--grey-700); width:40%; }
</style>
</head>
<body class="product-detail-page">

<!-- HEADER -->
<header class="site-header" id="siteHeader">
    <div class="header-inner">
        <a href="index.php" class="logo">
            <div class="logo-name">OPAL <span>OUTFITTERS</span></div>
            <div class="logo-tagline">Premium Fashion</div>
        </a>
        <div class="header-actions">
            <button class="header-icon-btn" id="searchToggle"><i class="fas fa-search"></i></button>
            <button class="header-icon-btn" id="cartToggle"><i class="fas fa-shopping-bag"></i><span class="cart-count" style="display:none">0</span></button>
            <button class="header-icon-btn"><i class="far fa-heart"></i><span class="wishlist-count" style="display:none">0</span></button>
            <button class="header-icon-btn"><i class="far fa-user"></i></button>
            <button class="hamburger" id="hamburger"><span></span><span></span><span></span></button>
        </div>
    </div>
</header>
<div class="search-bar" id="searchBar"><div class="search-input-wrap"><input type="text" id="searchInput" placeholder="Search products..."><button class="search-submit"><i class="fas fa-search"></i></button><div class="search-results-dropdown" id="searchResultsDropdown"></div></div></div>
<div class="nav-overlay" id="navOverlay"></div>
<nav class="side-nav" id="sideNav"><div class="side-nav-header"><div class="logo"><div class="logo-name" style="font-size:18px">OPAL <span>OUTFITTERS</span></div></div><button class="side-nav-close"><i class="fas fa-times"></i></button></div><ul><li><a href="index.php"><i class="fas fa-home"></i> Home</a></li><li><a href="shop.php"><i class="fas fa-store"></i> Shop</a></li><li><a href="shop.php?category=shoes"><i class="fas fa-shoe-prints"></i> Shoes</a></li><li><a href="shop.php?category=clothing"><i class="fas fa-tshirt"></i> Clothing</a></li><li><a href="shop.php?category=accessories"><i class="fas fa-gem"></i> Accessories</a></li><li><a href="story.php"><i class="fas fa-book-open"></i> Our Story</a></li><li><a href="admin/login.php"><i class="fas fa-lock"></i> Admin Login</a></li></ul></nav>
<div class="cart-sidebar" id="cartSidebar"><div class="cart-sidebar-header"><span class="cart-sidebar-title">Shopping Cart</span><button class="cart-close" id="cartClose"><i class="fas fa-times"></i></button></div><div class="cart-items" id="cartItems"></div><div class="cart-footer"><div class="cart-subtotal"><span>Subtotal</span><span id="cartSubtotal">$0.00</span></div><a href="checkout.php" class="btn btn-primary btn-full">Checkout</a></div></div>

<!-- PRODUCT DETAIL -->
<div class="container">
    <div class="product-detail-grid">
        <!-- GALLERY -->
        <div class="product-gallery">
            <div class="gallery-main" id="galleryMainWrap">
                <img class="gallery-main-img" id="galleryMain"
                     src="<?= !empty($product['images']) ? htmlspecialchars($product['images'][0]['image_path']) : 'https://via.placeholder.com/600x600?text=OPAL' ?>"
                     alt="<?= htmlspecialchars($product['name']) ?>">
            </div>
            <?php if (count($product['images']) > 1): ?>
            <div class="gallery-thumbs">
                <?php foreach ($product['images'] as $i => $img): ?>
                <div class="gallery-thumb <?= $i === 0 ? 'active' : '' ?>">
                    <img src="<?= htmlspecialchars($img['image_path']) ?>" alt="<?= htmlspecialchars($product['name']) ?> <?= $i+1 ?>" loading="lazy">
                </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>

        <!-- INFO -->
        <div class="product-detail-info">
            <div class="product-detail-breadcrumb">
                <a href="index.php">Home</a>
                <i class="fas fa-chevron-right" style="font-size:10px"></i>
                <a href="shop.php?category=<?= htmlspecialchars($product['category_slug'] ?? '') ?>"><?= htmlspecialchars($product['category_name'] ?? '') ?></a>
                <i class="fas fa-chevron-right" style="font-size:10px"></i>
                <span><?= htmlspecialchars($product['name']) ?></span>
            </div>

            <h1 class="product-detail-name"><?= htmlspecialchars($product['name']) ?></h1>

            <div class="product-detail-rating">
                <div class="stars"><?= render_stars($product['rating'] ?? 0) ?></div>
                <span style="font-size:14px;color:var(--grey-700)">(<?= count($reviews) ?> reviews)</span>
                <span class="stock-badge <?= $product['stock'] > 0 ? ($product['stock'] > 10 ? 'in-stock' : 'low-stock') : 'out-stock' ?>">
                    <?= $product['stock'] > 10 ? 'In Stock' : ($product['stock'] > 0 ? 'Only '.$product['stock'].' left' : 'Sold Out') ?>
                </span>
            </div>

            <div class="product-detail-price"><?= $price_display ?></div>

            <p class="product-detail-desc"><?= nl2br(htmlspecialchars($product['description'] ?? '')) ?></p>

            <!-- SIZES -->
            <?php if (!empty($product['sizes'])): ?>
            <div id="sizeSection">
                <div class="option-label">Select Size</div>
                <div class="size-options">
                    <?php foreach ($product['sizes'] as $size): ?>
                    <button class="size-btn" data-size="<?= htmlspecialchars($size) ?>"><?= htmlspecialchars($size) ?></button>
                    <?php endforeach; ?>
                </div>
            </div>
            <input type="hidden" id="selectedSize" value="">
            <?php endif; ?>

            <!-- COLORS -->
            <?php if (!empty($product['colors'])): ?>
            <div>
                <div class="option-label">Select Color</div>
                <div class="color-options">
                    <?php
                    $colorMap = ['Black'=>'#1a1a1a','White'=>'#f5f5f5','Navy'=>'#1B2A6B','Beige'=>'#D9C9A3','Olive'=>'#6B7240','Grey'=>'#9E9E9E','Brown'=>'#7B4F2E','Tan'=>'#C19A6B','Ivory'=>'#FFFFF0','Blush'=>'#FFB6C1','Gold'=>'#D4AF37','Silver'=>'#C0C0C0','Rose Gold'=>'#B76E79','Dark Brown'=>'#5C4033','Cognac'=>'#9D4E15','Camel'=>'#C19A6B','Burgundy'=>'#800020','Forest Green'=>'#228B22','Light Blue'=>'#ADD8E6','Dark Blue'=>'#00008B','Red'=>'#E74C3C'];
                    foreach ($product['colors'] as $color):
                        $hex = $colorMap[$color] ?? '#ccc';
                    ?>
                    <button class="color-btn" data-color="<?= htmlspecialchars($color) ?>" title="<?= htmlspecialchars($color) ?>" style="background:<?= $hex ?>;<?= in_array($color,['White','Ivory','Light Blue']) ? 'border:1.5px solid #ddd' : '' ?>"></button>
                    <?php endforeach; ?>
                </div>
            </div>
            <input type="hidden" id="selectedColor" value="">
            <?php endif; ?>

            <!-- SPECS -->
            <?php if (!empty($product['specifications'])): ?>
            <div style="margin-top:24px">
                <div class="option-label">Specifications</div>
                <table class="specs-table">
                    <?php foreach ($product['specifications'] as $key => $val): ?>
                    <tr><td><?= htmlspecialchars($key) ?></td><td><?= htmlspecialchars($val) ?></td></tr>
                    <?php endforeach; ?>
                </table>
            </div>
            <?php endif; ?>

            <!-- ACTIONS -->
            <div class="detail-actions" style="margin-top:32px">
                <?php if ($product['stock'] > 0): ?>
                <a href="order.php?slug=<?= urlencode($product['slug']) ?>" class="btn btn-primary" style="flex:1">
                    <i class="fas fa-bolt"></i> Buy Now
                </a>
                <button class="btn btn-outline-dark add-to-cart-btn" style="flex:1"
                    data-product-id="<?= $product['id'] ?>"
                    data-product-name="<?= htmlspecialchars($product['name']) ?>"
                    data-product-price="<?= $active_price ?>"
                    data-product-image="<?= !empty($product['images']) ? htmlspecialchars($product['images'][0]['image_path']) : '' ?>">
                    <i class="fas fa-shopping-bag"></i> Add to Cart
                </button>
                <?php else: ?>
                <button class="btn btn-dark btn-full" disabled style="opacity:.5">Sold Out</button>
                <?php endif; ?>
                <button class="product-action-btn wishlist-btn"
                    style="width:48px;height:48px;border:1.5px solid var(--grey-300);border-radius:var(--radius-sm)"
                    data-product-id="<?= $product['id'] ?>"
                    data-product-name="<?= htmlspecialchars($product['name']) ?>"
                    data-product-price="<?= $active_price ?>"
                    data-product-image="<?= !empty($product['images']) ? htmlspecialchars($product['images'][0]['image_path']) : '' ?>">
                    <i class="far fa-heart"></i>
                </button>
            </div>

            <!-- TRUST BADGES -->
            <div style="display:flex;gap:20px;margin-top:24px;flex-wrap:wrap">
                <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--grey-700)"><i class="fas fa-lock" style="color:var(--gold)"></i> Secure Checkout</div>
                <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--grey-700)"><i class="fas fa-truck" style="color:var(--gold)"></i> Fast Delivery</div>
                <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--grey-700)"><i class="fas fa-undo" style="color:var(--gold)"></i> Easy Returns</div>
            </div>
        </div>
    </div>
</div>

<!-- REVIEWS SECTION -->
<section class="section" id="reviews" style="background:var(--grey-100)">
    <div class="container">
        <div class="section-header">
            <span class="section-eyebrow">Customer Feedback</span>
            <h2 class="section-title">Reviews & Ratings</h2>
        </div>

        <!-- Write Review -->
        <div style="max-width:700px;margin:0 auto 48px">
            <div class="review-form-card">
                <h3 style="font-family:var(--font-display);font-size:22px;margin-bottom:24px">Write a Review</h3>
                <form id="reviewForm">
                    <input type="hidden" name="product_id" value="<?= $product['id'] ?>">
                    <input type="hidden" id="ratingValue" name="rating" value="0">
                    <div class="form-group">
                        <label>Your Name</label>
                        <input type="text" name="customer_name" placeholder="Enter your name" required>
                    </div>
                    <div class="form-group">
                        <label>Your Rating</label>
                        <div style="display:flex;gap:6px">
                            <?php for ($i = 1; $i <= 5; $i++): ?>
                            <button type="button" class="review-star-input" data-value="<?= $i ?>">
                                <i class="fas fa-star"></i>
                            </button>
                            <?php endfor; ?>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Your Review</label>
                        <textarea name="review_text" rows="4" placeholder="Share your experience with this product..." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Submit Review</button>
                </form>
            </div>
        </div>

        <!-- Reviews List -->
        <div style="max-width:700px;margin:0 auto">
            <?php if (empty($reviews)): ?>
            <p style="text-align:center;color:var(--grey-500)">No reviews yet. Be the first to review this product!</p>
            <?php else: ?>
            <?php foreach ($reviews as $r): ?>
            <div class="review-list-item">
                <div class="review-list-reviewer"><?= htmlspecialchars($r['customer_name']) ?></div>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
                    <div class="stars"><?= render_stars($r['rating']) ?></div>
                    <div class="review-list-date"><?= date('M j, Y', strtotime($r['created_at'])) ?></div>
                </div>
                <p class="review-list-text"><?= nl2br(htmlspecialchars($r['review_text'])) ?></p>
            </div>
            <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</section>

<!-- RELATED PRODUCTS -->
<?php if (!empty($related)): ?>
<section class="section">
    <div class="container">
        <div class="section-header">
            <span class="section-eyebrow">You May Also Like</span>
            <h2 class="section-title">Related Products</h2>
        </div>
        <div class="products-grid">
            <?php foreach ($related as $rp):
                $r_images = array_filter(explode('||', $rp['images'] ?? ''));
                if (empty($r_images)) $r_images = ['https://via.placeholder.com/400x400?text=OPAL'];
                $r_images = array_values($r_images);
                $r_price = $rp['sale_price']
                    ? '<span class="product-price-sale">$'.number_format($rp['sale_price'],2).'</span><span class="product-price-original">$'.number_format($rp['price'],2).'</span>'
                    : '<span class="product-price">$'.number_format($rp['price'],2).'</span>';
            ?>
            <div class="product-card">
                <div class="product-image-wrap">
                    <?php foreach ($r_images as $ri => $rimg): ?>
                    <img class="product-img <?= $ri===0 ? 'visible':'hidden' ?>" src="<?= htmlspecialchars($rimg) ?>" alt="<?= htmlspecialchars($rp['name']) ?>" loading="lazy">
                    <?php endforeach; ?>
                    <?php if (count($r_images) > 1): ?>
                    <div class="product-img-arrows">
                        <button class="img-arrow img-arrow-prev"><i class="fas fa-chevron-left"></i></button>
                        <button class="img-arrow img-arrow-next"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    <?php endif; ?>
                    <?php if ($rp['stock'] == 0): ?><div class="product-badges"><span class="badge badge-sold">Sold Out</span></div><?php endif; ?>
                </div>
                <div class="product-info">
                    <a href="product.php?slug=<?= urlencode($rp['slug']) ?>">
                        <h3 class="product-name"><?= htmlspecialchars($rp['name']) ?></h3>
                    </a>
                    <div class="product-price-row"><div><?= $r_price ?></div></div>
                    <div class="product-card-btns">
                        <a href="order.php?slug=<?= urlencode($rp['slug']) ?>" class="btn btn-primary btn-sm <?= $rp['stock']==0?'disabled':'' ?>"><i class="fas fa-bolt"></i> Buy Now</a>
                        <a href="product.php?slug=<?= urlencode($rp['slug']) ?>" class="btn btn-outline-dark btn-sm">View Details</a>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<?php include 'php/footer.php'; ?>
<div id="toastContainer" class="toast-container"></div>
<script src="js/main.js"></script>
</body>
</html>
