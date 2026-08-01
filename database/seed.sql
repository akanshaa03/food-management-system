-- Seed Data for 14-Table Normalized Database Schema

TRUNCATE TABLE audit_logs, feedback, reports, waste_predictions, notifications, pickup_requests, donation_items, donations, inventory, suppliers, inventory_categories, ngos, businesses, users CASCADE;

-- Insert Inventory Categories
INSERT INTO inventory_categories (id, category_name, description, storage_type) VALUES
('11111111-1111-4111-8111-111111111111', 'Bakery & Bread', 'Freshly baked breads, pastries, and baked goods', 'Ambient'),
('22222222-2222-4222-8222-222222222222', 'Fresh Produce', 'Fruits, vegetables, and leafy greens', 'Refrigerated');

-- Insert Users (Password: Password@123)
INSERT INTO users (id, name, email, password_hash, role) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'System Administrator', 'admin@foodsave.org', '$2a$10$wE9K2uP5H9dF/O1L0Y4u9eM5V.5Z8a9T7u1u0V5y0e9X8Z1w0Y4u9', 'SUPER_ADMIN'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Green Grocery Market', 'business@foodsave.org', '$2a$10$wE9K2uP5H9dF/O1L0Y4u9eM5V.5Z8a9T7u1u0V5y0e9X8Z1w0Y4u9', 'BUSINESS'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Hope Shelter & Food Bank', 'ngo@foodsave.org', '$2a$10$wE9K2uP5H9dF/O1L0Y4u9eM5V.5Z8a9T7u1u0V5y0e9X8Z1w0Y4u9', 'NGO');

-- Insert Business Profile
INSERT INTO businesses (id, user_id, business_name, license_number, contact_phone, address) VALUES
('b1111111-1111-4111-8111-111111111111', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Green Grocery Store', 'LIC-2026-8849', '+1-555-0192', '742 Evergreen Terrace, Sector 4');

-- Insert NGO Profile
INSERT INTO ngos (id, user_id, ngo_name, registration_number, contact_phone, address, capacity_description) VALUES
('c1111111-1111-4111-8111-111111111111', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Hope Shelter & Community Kitchen', 'REG-NGO-9921', '+1-555-0144', '120 Market Street, Suite 8', 'Serves up to 500 meals daily with refrigerated storage');

-- Insert Inventory
INSERT INTO inventory (id, business_id, category_id, product_name, category_name, quantity, unit, expiry_date, storage_condition, batch_number, status) VALUES
('i1111111-1111-4111-8111-111111111111', 'b1111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'Sourdough Whole Grain Bread', 'Bakery & Bread', 25.0, 'kg', CURRENT_TIMESTAMP + INTERVAL '2 days', 'Ambient', 'BATCH-2026-07A', 'AVAILABLE');

-- Insert Donation (Status: ACCEPTED)
INSERT INTO donations (id, business_id, ngo_id, inventory_id, title, category, quantity, unit, food_image_url, pickup_time, expiry_date, status, pickup_address, notes) VALUES
('d1111111-1111-4111-8111-111111111111', 'b1111111-1111-4111-8111-111111111111', 'c1111111-1111-4111-8111-111111111111', 'i1111111-1111-4111-8111-111111111111', 'Artisanal Sourdough Loaves', 'Bakery & Bread', 15.0, 'kg', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500', CURRENT_TIMESTAMP + INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '2 days', 'ACCEPTED', '742 Evergreen Terrace, Loading Dock B', 'Refrigerated dispatch ready');

-- Insert Pickup Request (Status: Scheduled)
INSERT INTO pickup_requests (id, donation_id, scheduled_time, vehicle_number, driver_name, driver_phone, status, notes) VALUES
('pr111111-1111-4111-8111-111111111111', 'd1111111-1111-4111-8111-111111111111', CURRENT_TIMESTAMP + INTERVAL '1 day', 'VAN-9082', 'David Miller', '+1-555-0177', 'Scheduled', 'Driver dispatched by Hope Shelter');
