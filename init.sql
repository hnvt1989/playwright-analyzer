
USE Members;

-- Address table
CREATE TABLE IF NOT EXISTS Address (
  id INT AUTO_INCREMENT PRIMARY KEY,
  street VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  country VARCHAR(100)
);

-- Membership table
CREATE TABLE IF NOT EXISTS Membership (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT,
  membership_type VARCHAR(50),
  start_date DATE,
  end_date DATE,
  status VARCHAR(50)
);

-- Credential table
CREATE TABLE IF NOT EXISTS Credential (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO Address (street, city, state, zip, country) VALUES
  ('123 Maple St', 'Springfield', 'IL', '62701', 'USA'),
  ('456 Oak Ave', 'Columbus', 'OH', '43004', 'USA');

INSERT INTO Membership (member_id, membership_type, start_date, end_date, status) VALUES
  (1, 'Gold', '2023-01-01', '2024-01-01', 'active'),
  (2, 'Silver', '2023-06-01', '2024-06-01', 'inactive');

INSERT INTO Credential (member_id, email, password_hash) VALUES
  (1, '1@test.com', 'test1'),
  (2, 'user2@example.com', 'hashed_password_2');
