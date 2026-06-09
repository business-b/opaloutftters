-- OPAL OUTFITTERS Database Schema
-- MySQL 5.7+

CREATE DATABASE IF NOT EXISTS opal_outfitters CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE opal_outfitters;

-- Admin Table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin: Sudais / opal01
INSERT INTO admins (username, password) VALUES
('Sudais', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
-- Note: password hash above is for 'opal01' - regenerate with password_hash('opal01', PASSWORD_DEFAULT)

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name, slug, description) VALUES
('Clothing', 'clothing', 'Premium clothing collection'),
('Shoes', 'shoes', 'Designer footwear collection'),
('Accessories', 'accessories', 'Fashion accessories');

-- Products
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2) DEFAULT NULL,
    category_id INT,
    stock INT DEFAULT 0,
    sizes TEXT COMMENT 'JSON array of available sizes',
    colors TEXT COMMENT 'JSON array of available colors',
    specifications TEXT COMMENT 'JSON object of specs',
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    is_featured TINYINT(1) DEFAULT 0,
    is_new_arrival TINYINT(1) DEFAULT 0,
    is_best_seller TINYINT(1) DEFAULT 0,
    status ENUM('active','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    is_primary TINYINT(1) DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    image_path VARCHAR(255) NOT NULL,
    button_text VARCHAR(100),
    button_link VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample banners (using placeholder images)
INSERT INTO banners (title, subtitle, image_path, button_text, button_link, sort_order) VALUES
('New Collection 2024', 'Discover Premium Fashion', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80', 'Shop Now', 'shop.php', 1),
('Exclusive Footwear', 'Step Into Style', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&q=80', 'Explore Shoes', 'shop.php?category=shoes', 2),
('Premium Accessories', 'Complete Your Look', 'https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?w=1920&q=80', 'Shop Accessories', 'shop.php?category=accessories', 3);

-- Sample Products
INSERT INTO products (name, slug, description, short_description, price, sale_price, category_id, stock, sizes, colors, rating, review_count, is_featured, is_new_arrival, is_best_seller) VALUES
('Classic Black Hoodie', 'classic-black-hoodie', 'Premium quality cotton blend hoodie with a modern fit. Soft interior fleece lining keeps you warm and comfortable. Features a kangaroo pocket and adjustable drawstring hood. Perfect for casual outings or lounging at home.', 'Premium cotton blend hoodie with fleece lining', 89.99, 69.99, 1, 50, '["S","M","L","XL","XXL"]', '["Black","Grey","Navy"]', 4.8, 124, 1, 1, 1),
('Slim Fit Chinos', 'slim-fit-chinos', 'Modern slim-fit chinos crafted from stretch cotton fabric. These versatile trousers work for both casual and smart-casual occasions. Available in multiple classic colors with a comfortable waistband.', 'Stretch cotton slim-fit chinos', 74.99, NULL, 1, 35, '["S","M","L","XL","XXL"]', '["Beige","Navy","Olive","Black"]', 4.6, 89, 1, 0, 1),
('Luxury Silk Blouse', 'luxury-silk-blouse', 'Exquisitely crafted 100% pure silk blouse with a relaxed elegant drape. Features mother-of-pearl buttons and a soft collar. This timeless piece elevates any wardrobe from day to evening effortlessly.', '100% pure silk blouse with pearl buttons', 129.99, NULL, 1, 20, '["S","M","L","XL"]', '["Ivory","Blush","Midnight Blue"]', 4.9, 67, 1, 1, 0),
('Designer Leather Sneakers', 'designer-leather-sneakers', 'Hand-crafted genuine leather sneakers with cushioned insole and durable rubber outsole. The minimalist design pairs perfectly with both casual and semi-formal outfits. Premium quality stitching for long-lasting wear.', 'Hand-crafted genuine leather sneakers', 159.99, 139.99, 2, 30, '["7","8","9","10","11"]', '["White","Black","Tan"]', 4.7, 203, 1, 1, 1),
('Classic Oxford Shoes', 'classic-oxford-shoes', 'Timeless Oxford shoes crafted from full-grain calfskin leather. Features Goodyear welt construction for durability and resolability. The leather lining provides breathability and comfort for all-day wear.', 'Full-grain calfskin leather Oxford shoes', 219.99, NULL, 2, 25, '["7","8","9","10","11"]', '["Black","Dark Brown","Cognac"]', 4.8, 156, 1, 0, 1),
('Running Performance Shoes', 'running-performance-shoes', 'Engineered for peak performance, these running shoes feature responsive foam cushioning and a breathable mesh upper. The dynamic traction outsole provides grip on multiple surfaces. Lightweight design for maximum speed and agility.', 'Responsive foam cushioning running shoes', 119.99, 99.99, 2, 45, '["7","8","9","10","11"]', '["Black/Red","White/Blue","Grey/Green"]', 4.6, 178, 0, 1, 1),
('Gold Chain Necklace', 'gold-chain-necklace', 'Elegant 18k gold-plated chain necklace with a lustrous finish. The classic cable chain design is versatile enough to wear alone or layered with other necklaces. Hypoallergenic and tarnish-resistant.', '18k gold-plated cable chain necklace', 49.99, NULL, 3, 100, NULL, '["Gold","Silver","Rose Gold"]', 4.7, 234, 1, 1, 0),
('Premium Leather Belt', 'premium-leather-belt', 'Genuine full-grain leather belt with a solid brass buckle. Hand-stitched edges for a refined finish. Available in multiple sizes. This classic belt complements both formal and casual outfits perfectly.', 'Full-grain leather belt with brass buckle', 59.99, NULL, 3, 80, '["S","M","L","XL","XXL"]', '["Black","Brown","Tan"]', 4.5, 145, 0, 0, 1),
('Silk Pocket Square', 'silk-pocket-square', 'Luxurious 100% pure silk pocket square with hand-rolled edges. A distinctive accessory that adds sophistication to any suit or blazer. Each piece features a unique pattern inspired by classic paisley motifs.', '100% pure silk hand-rolled pocket square', 34.99, NULL, 3, 150, NULL, '["Navy/Gold","Burgundy","Forest Green"]', 4.4, 78, 0, 1, 0),
('Oversized Denim Jacket', 'oversized-denim-jacket', 'Trendy oversized denim jacket in authentic stonewash finish. Features classic chest pockets, button-down front and slightly dropped shoulders for a relaxed contemporary silhouette. A wardrobe essential for every season.', 'Stonewash oversized denim jacket', 99.99, 79.99, 1, 40, '["S","M","L","XL","XXL"]', '["Light Blue","Dark Blue","Black"]', 4.6, 112, 1, 1, 1),
('Formal Dress Shirt', 'formal-dress-shirt', 'Premium poplin cotton formal shirt with a spread collar and double-button cuffs. The non-iron fabric maintains a crisp appearance throughout the day. Perfect for business and formal occasions.', 'Non-iron premium cotton formal shirt', 64.99, NULL, 1, 60, '["S","M","L","XL","XXL"]', '["White","Light Blue","Pale Pink"]', 4.7, 198, 0, 0, 1),
('Leather Crossbody Bag', 'leather-crossbody-bag', 'Compact yet spacious genuine leather crossbody bag with multiple compartments. Adjustable strap with gold-tone hardware. The clean minimalist design makes it perfect for both day and evening use.', 'Genuine leather crossbody bag with gold hardware', 139.99, NULL, 3, 35, NULL, '["Black","Camel","Burgundy"]', 4.8, 167, 1, 1, 0);

-- Product Images (using Unsplash URLs)
INSERT INTO product_images (product_id, image_path, is_primary, sort_order) VALUES
(1, 'https://images.unsplash.com/photo-1556821840-3a63f15232d0?w=600&q=80', 1, 1),
(1, 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=600&q=80', 0, 2),
(1, 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80', 0, 3),
(2, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80', 1, 1),
(2, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80', 0, 2),
(3, 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=600&q=80', 1, 1),
(3, 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80', 0, 2),
(4, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', 1, 1),
(4, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80', 0, 2),
(4, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80', 0, 3),
(5, 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80', 1, 1),
(5, 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80', 0, 2),
(6, 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80', 1, 1),
(6, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80', 0, 2),
(7, 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80', 1, 1),
(7, 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80', 0, 2),
(8, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', 1, 1),
(8, 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&q=80', 0, 2),
(9, 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80', 1, 1),
(10, 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&q=80', 1, 1),
(10, 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80', 0, 2),
(10, 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600&q=80', 0, 3),
(11, 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80', 1, 1),
(11, 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80', 0, 2),
(12, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', 1, 1),
(12, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80', 0, 2);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_age INT,
    customer_phone VARCHAR(20),
    customer_whatsapp VARCHAR(20),
    customer_email VARCHAR(255),
    customer_country VARCHAR(100),
    customer_city VARCHAR(100),
    customer_address TEXT,
    customer_postal VARCHAR(20),
    product_id INT,
    product_name VARCHAR(255),
    quantity INT DEFAULT 1,
    size VARCHAR(20),
    color VARCHAR(50),
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    status ENUM('pending','processing','shipped','completed','cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    review_text TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    is_approved TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Insert sample reviews
INSERT INTO reviews (product_id, customer_name, review_text, rating, is_approved) VALUES
(1, 'Ahmed K.', 'Absolutely love this hoodie! The quality is exceptional and the fit is perfect. Worth every penny.', 5, 1),
(1, 'Sara M.', 'Great quality and fast delivery. The material feels premium and soft. Highly recommend!', 5, 1),
(4, 'Hamza T.', 'These sneakers are stunning! Comfortable from day one and they look incredibly stylish.', 5, 1),
(4, 'Zaid R.', 'Best sneakers I have purchased. The leather quality is top notch and the design is clean and minimal.', 4, 1),
(7, 'Fatima A.', 'Beautiful necklace, perfect for gifting. The gold plating is bright and has not tarnished at all.', 5, 1),
(10, 'Omar B.', 'This denim jacket is a wardrobe staple. The stonewash finish looks authentic and quality is great.', 4, 1);

-- Site Settings / Footer
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO settings (setting_key, setting_value) VALUES
('business_email', 'hello@opaloutfitters.com'),
('whatsapp_number', '+92-300-0000000'),
('phone_number', '+92-300-0000000'),
('business_address', 'Fashion District, Lahore, Pakistan'),
('working_hours', 'Mon–Sat: 9:00 AM – 9:00 PM'),
('instagram_url', 'https://instagram.com/opaloutfitters'),
('tiktok_url', 'https://tiktok.com/@opaloutfitters'),
('facebook_url', 'https://facebook.com/opaloutfitters'),
('linkedin_url', 'https://linkedin.com/company/opaloutfitters'),
('youtube_url', 'https://youtube.com/@opaloutfitters'),
('whatsapp_url', 'https://wa.me/923000000000');

-- CSRF Tokens table
CREATE TABLE IF NOT EXISTS csrf_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions for admin
CREATE TABLE IF NOT EXISTS admin_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_token VARCHAR(64) NOT NULL UNIQUE,
    admin_id INT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);
