CREATE DATABASE IF NOT EXISTS college_chatbot;
USE college_chatbot;

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    fee DECIMAL(10,2) NOT NULL,
    duration VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    message TEXT,
    status ENUM('Pending','Contacted','Admitted','Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_enquiry_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_enquiry_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS bot_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    keyword VARCHAR(100) NOT NULL UNIQUE,
    response TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

INSERT IGNORE INTO courses (course_name, description, fee, duration) VALUES
('B.Tech', 'Bachelor of Technology', 85000, '4 Years'),
('MBA', 'Master of Business Administration', 70000, '2 Years'),
('MCA', 'Master of Computer Applications', 60000, '2 Years');

INSERT IGNORE INTO bot_responses (keyword, response) VALUES
('hello', 'Hello! Welcome to ABC College. How can I help you?'),
('hi', 'Hi! Welcome to ABC College. Ask me about courses, fees, admission or timings.'),
('admission', 'For admission details, submit an enquiry form. Our admin team will contact you.'),
('timing', 'College working hours are 9 AM to 4 PM.'),
('thank', 'You are welcome! Feel free to ask another question.');

-- Admin is created securely with a bcrypt password hash:
-- 1) Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env
-- 2) Run: node createAdmin.js from the backend folder.
