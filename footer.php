<?php
// php/footer.php — reusable footer
if (!function_exists('get_all_settings')) require_once __DIR__ . '/config.php';
$s = get_all_settings();
?>
<footer class="site-footer">
    <div class="container">
        <div class="footer-grid">
            <!-- Brand -->
            <div class="footer-brand">
                <div class="footer-logo-name">OPAL <span>OUTFITTERS</span></div>
                <p class="footer-brand-desc">
                    Premium fashion brand founded in 2018 by Sudais. Delivering quality, style, and affordability to fashion lovers worldwide.
                </p>
                <div class="social-links">
                    <a href="<?= htmlspecialchars($s['instagram_url'] ?? '#') ?>" class="social-link" target="_blank" rel="noopener" title="Instagram"><i class="fab fa-instagram"></i></a>
                    <a href="<?= htmlspecialchars($s['tiktok_url'] ?? '#') ?>" class="social-link" target="_blank" rel="noopener" title="TikTok"><i class="fab fa-tiktok"></i></a>
                    <a href="<?= htmlspecialchars($s['facebook_url'] ?? '#') ?>" class="social-link" target="_blank" rel="noopener" title="Facebook"><i class="fab fa-facebook-f"></i></a>
                    <a href="<?= htmlspecialchars($s['linkedin_url'] ?? '#') ?>" class="social-link" target="_blank" rel="noopener" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                    <a href="<?= htmlspecialchars($s['youtube_url'] ?? '#') ?>" class="social-link" target="_blank" rel="noopener" title="YouTube"><i class="fab fa-youtube"></i></a>
                    <a href="<?= htmlspecialchars($s['whatsapp_url'] ?? '#') ?>" class="social-link" target="_blank" rel="noopener" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                </div>
            </div>
            <!-- Quick Links -->
            <div>
                <div class="footer-col-title">Quick Links</div>
                <div class="footer-links">
                    <a href="index.php"><i class="fas fa-chevron-right" style="font-size:10px;color:var(--gold)"></i> Home</a>
                    <a href="shop.php"><i class="fas fa-chevron-right" style="font-size:10px;color:var(--gold)"></i> Shop</a>
                    <a href="shop.php?filter=new"><i class="fas fa-chevron-right" style="font-size:10px;color:var(--gold)"></i> New Arrivals</a>
                    <a href="shop.php?filter=best"><i class="fas fa-chevron-right" style="font-size:10px;color:var(--gold)"></i> Best Sellers</a>
                    <a href="story.php"><i class="fas fa-chevron-right" style="font-size:10px;color:var(--gold)"></i> Our Story</a>
                    <a href="about.php"><i class="fas fa-chevron-right" style="font-size:10px;color:var(--gold)"></i> About Us</a>
                    <a href="contact.php"><i class="fas fa-chevron-right" style="font-size:10px;color:var(--gold)"></i> Contact</a>
                    <a href="reviews.php"><i class="fas fa-chevron-right" style="font-size:10px;color:var(--gold)"></i> Reviews</a>
                </div>
            </div>
            <!-- Categories -->
            <div>
                <div class="footer-col-title">Categories</div>
                <div class="footer-links">
                    <a href="shop.php?category=clothing"><i class="fas fa-chevron-right" style="font-size:10px;color:var(--gold)"></i> Clothing</a>
                    <a href="shop.php?category=shoes"><i class="fas fa-chevron-right" style="font-size:10px;color:var(--gold)"></i> Shoes</a>
                    <a href="shop.php?category=accessories"><i class="fas fa-chevron-right" style="font-size:10px;color:var(--gold)"></i> Accessories</a>
                    <a href="track_order.php"><i class="fas fa-chevron-right" style="font-size:10px;color:var(--gold)"></i> Track Order</a>
                    <a href="privacy.php"><i class="fas fa-chevron-right" style="font-size:10px;color:var(--gold)"></i> Privacy Policy</a>
                    <a href="terms.php"><i class="fas fa-chevron-right" style="font-size:10px;color:var(--gold)"></i> Terms & Conditions</a>
                    <a href="refund.php"><i class="fas fa-chevron-right" style="font-size:10px;color:var(--gold)"></i> Refund Policy</a>
                    <a href="shipping.php"><i class="fas fa-chevron-right" style="font-size:10px;color:var(--gold)"></i> Shipping Policy</a>
                </div>
            </div>
            <!-- Contact -->
            <div>
                <div class="footer-col-title">Contact Us</div>
                <div class="footer-contact-item">
                    <i class="fas fa-envelope"></i>
                    <span><a href="mailto:<?= htmlspecialchars($s['business_email'] ?? '') ?>" style="color:rgba(255,255,255,0.6)"><?= htmlspecialchars($s['business_email'] ?? 'hello@opaloutfitters.com') ?></a></span>
                </div>
                <div class="footer-contact-item">
                    <i class="fab fa-whatsapp"></i>
                    <span><?= htmlspecialchars($s['whatsapp_number'] ?? '+92-300-0000000') ?></span>
                </div>
                <div class="footer-contact-item">
                    <i class="fas fa-phone"></i>
                    <span><?= htmlspecialchars($s['phone_number'] ?? '+92-300-0000000') ?></span>
                </div>
                <div class="footer-contact-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span><?= htmlspecialchars($s['business_address'] ?? 'Fashion District, Pakistan') ?></span>
                </div>
                <div class="footer-contact-item">
                    <i class="fas fa-clock"></i>
                    <span><?= htmlspecialchars($s['working_hours'] ?? 'Mon–Sat: 9AM – 9PM') ?></span>
                </div>
            </div>
        </div>
    </div>
    <div class="container">
        <div class="footer-bottom">
            <div class="footer-copyright">
                &copy; <?= date('Y') ?> OPAL OUTFITTERS. All Rights Reserved. Founded by Sudais.
            </div>
            <div class="footer-policies">
                <a href="privacy.php">Privacy Policy</a>
                <a href="terms.php">Terms & Conditions</a>
                <a href="refund.php">Refund Policy</a>
                <a href="shipping.php">Shipping Policy</a>
            </div>
        </div>
    </div>
</footer>
