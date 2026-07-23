-- Database
CREATE DATABASE IF NOT EXISTS mydb;
USE mydb;

-- Table
CREATE TABLE IF NOT EXISTS users (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	email VARCHAR(150) NOT NULL UNIQUE,
	phone VARCHAR(20),
	address VARCHAR(255),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO users (name, email, phone, address) VALUES
	('Juan Dela Cruz', 'juan.delacruz@example.com', '09171234567', 'Brgy. Poblacion, Cebu City'),
	('Maria Santos', 'maria.santos@example.com', '09182345678', '12 Mabini St., Manila'),
	('Jose Rizal', 'jose.rizal@example.com', '09193456789', 'Calamba, Laguna'),
	('Andres Bonifacio', 'andres.bonifacio@example.com', '09204567890', 'Tondo, Manila'),
	('Gabriela Silang', 'gabriela.silang@example.com', '09215678901', 'Vigan, Ilocos Sur'),
	('Apolinario Mabini', 'apolinario.mabini@example.com', '09226789012', 'Tanauan, Batangas'),
	('Melchora Aquino', 'melchora.aquino@example.com', '09237890123', 'Caloocan City'),
	('Emilio Aguinaldo', 'emilio.aguinaldo@example.com', '09248901234', 'Kawit, Cavite'),
	('Antonio Luna', 'antonio.luna@example.com', '09259012345', 'Binondo, Manila'),
	('Marcelo del Pilar', 'marcelo.delpilar@example.com', '09260123456', 'Bulacan, Bulacan');
