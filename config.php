<?php
// php/config.php - Database Configuration & Core Helpers
define('DB_HOST', 'localhost');
define('DB_USER', 'root');       // Change to your DB username
define('DB_PASS', '');           // Change to your DB password
define('DB_NAME', 'opal_outfitters');
define('SITE_URL', 'http://localhost/opal-outfitters'); // Change to your domain
define('UPLOAD_PATH', __DIR__ . '/../uploads/');
define('UPLOAD_URL', SITE_URL . '/uploads/');

// Security constants
define('CSRF_EXPIRE', 3600); // 1 hour

function db_connect() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            die(json_encode(['error' => 'Database connection failed']));
        }
    }
    return $pdo;
}

function sanitize($input) {
    if (is_array($input)) {
        return array_map('sanitize', $input);
    }
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

function generate_csrf() {
    if (session_status() === PHP_SESSION_NONE) session_start();
    $token = bin2hex(random_bytes(32));
    $_SESSION['csrf_token'] = $token;
    $_SESSION['csrf_expire'] = time() + CSRF_EXPIRE;
    return $token;
}

function verify_csrf($token) {
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (empty($_SESSION['csrf_token']) || empty($_SESSION['csrf_expire'])) return false;
    if (time() > $_SESSION['csrf_expire']) return false;
    return hash_equals($_SESSION['csrf_token'], $token);
}

function is_admin_logged_in() {
    if (session_status() === PHP_SESSION_NONE) session_start();
    return !empty($_SESSION['admin_id']) && !empty($_SESSION['admin_username']);
}

function require_admin() {
    if (!is_admin_logged_in()) {
        header('Location: ' . SITE_URL . '/admin/login.php');
        exit;
    }
}

function generate_order_number() {
    return 'OO-' . strtoupper(substr(uniqid(), -6)) . '-' . date('Ymd');
}

function get_setting($key) {
    $pdo = db_connect();
    $stmt = $pdo->prepare("SELECT setting_value FROM settings WHERE setting_key = ?");
    $stmt->execute([$key]);
    $row = $stmt->fetch();
    return $row ? $row['setting_value'] : '';
}

function get_all_settings() {
    $pdo = db_connect();
    $stmt = $pdo->query("SELECT setting_key, setting_value FROM settings");
    $rows = $stmt->fetchAll();
    $settings = [];
    foreach ($rows as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
    return $settings;
}

function get_products($limit = null, $category = null, $featured = false, $new_arrival = false, $best_seller = false) {
    $pdo = db_connect();
    $sql = "SELECT p.*, c.name as category_name, 
                   GROUP_CONCAT(DISTINCT pi.image_path ORDER BY pi.is_primary DESC, pi.sort_order ASC SEPARATOR '||') as images,
                   (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_images pi ON pi.product_id = p.id
            WHERE p.status = 'active'";
    $params = [];

    if ($category) {
        $sql .= " AND c.slug = ?";
        $params[] = $category;
    }
    if ($featured) {
        $sql .= " AND p.is_featured = 1";
    }
    if ($new_arrival) {
        $sql .= " AND p.is_new_arrival = 1";
    }
    if ($best_seller) {
        $sql .= " AND p.is_best_seller = 1";
    }

    $sql .= " GROUP BY p.id ORDER BY p.created_at DESC";

    if ($limit) {
        $sql .= " LIMIT " . (int)$limit;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

function get_product_by_slug($slug) {
    $pdo = db_connect();
    $stmt = $pdo->prepare(
        "SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.slug = ? AND p.status = 'active'"
    );
    $stmt->execute([$slug]);
    $product = $stmt->fetch();
    if ($product) {
        $img_stmt = $pdo->prepare("SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC");
        $img_stmt->execute([$product['id']]);
        $product['images'] = $img_stmt->fetchAll();
        $product['sizes'] = json_decode($product['sizes'], true) ?? [];
        $product['colors'] = json_decode($product['colors'], true) ?? [];
        $product['specifications'] = json_decode($product['specifications'], true) ?? [];
    }
    return $product;
}

function get_reviews($product_id, $approved_only = true) {
    $pdo = db_connect();
    $sql = "SELECT * FROM reviews WHERE product_id = ?";
    if ($approved_only) $sql .= " AND is_approved = 1";
    $sql .= " ORDER BY created_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$product_id]);
    return $stmt->fetchAll();
}

function get_banners() {
    $pdo = db_connect();
    $stmt = $pdo->query("SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC");
    return $stmt->fetchAll();
}

function search_products($query) {
    $pdo = db_connect();
    $like = "%" . $query . "%";
    $stmt = $pdo->prepare(
        "SELECT p.*, c.name as category_name,
                (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
         FROM products p LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.status = 'active' AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)
         ORDER BY p.name ASC LIMIT 20"
    );
    $stmt->execute([$like, $like, $like]);
    return $stmt->fetchAll();
}

function render_stars($rating) {
    $html = '';
    for ($i = 1; $i <= 5; $i++) {
        if ($i <= $rating) {
            $html .= '<i class="fas fa-star star-filled"></i>';
        } elseif ($i - 0.5 <= $rating) {
            $html .= '<i class="fas fa-star-half-alt star-filled"></i>';
        } else {
            $html .= '<i class="far fa-star star-empty"></i>';
        }
    }
    return $html;
}

function format_price($price) {
    return '$' . number_format($price, 2);
}
