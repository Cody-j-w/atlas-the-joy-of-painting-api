CREATE DATABASE IF NOT EXISTS the_joy_of_painting;
USE the_joy_of_painting;
DROP TABLE IF EXISTS colors;
CREATE TABLE colors (
    id INT NOT NULL AUTO_INCREMENT,
    color_name VARCHAR(255) DEFAULT NULL,
    color_hex VARCHAR(6) DEFAULT NULL,
    PRIMARY KEY (id)
);
DROP TABLE IF EXISTS paintings;
CREATE TABLE paintings (
    id INT NOT NULL AUTO_INCREMENT,
    painting_name VARCHAR(255) DEFAULT NULL,
    image_src VARCHAR(255) DEFAULT NULL,
    episode_number INT DEFAULT NULL,
    season INT DEFAULT NULL,
    video VARCHAR(255) DEFAULT NULL,
    month_aired VARCHAR(255) DEFAULT NULL,
    date_aired DATE DEFAULT NULL,
    painting_index INT DEFAULT NULL,
    PRIMARY KEY (id)
);
DROP TABLE IF EXISTS subjects;
CREATE TABLE subjects (
    id INT NOT NULL AUTO_INCREMENT,
    subject_name VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id)
);
DROP TABLE IF EXISTS painting_colors;
CREATE TABLE painting_colors (
    painting_id INT NOT NULL,
    color_id INT NOT NULL,
    PRIMARY KEY (painting_id, color_id)
);
DROP TABLE IF EXISTS painting_subjects;
CREATE TABLE painting_subjects (
    painting_id INT NOT NULL,
    subject_id INT NOT NULL,
    PRIMARY KEY (painting_id, subject_id)
);

INSERT INTO colors (color_name, color_hex)
VALUES ('Black Gesso', '000000'),
('Bright Red', 'DB0000'),
('Burnt Umber', '8A3324'),
('Cadmium Yellow', 'FFEC00'),
('Dark Sienna', '5F2E1F'),
('Indian Red', 'CD5C5C'),
('Indian Yellow', 'FFB800'),
('Liquid Black', '000000'),
('Liquid Clear', 'FFFFFF'),
('Midnight Black', '000000'),
('Phthalo Blue', '0C0040'),
('Phthalo Green', '102E3C'),
('Prussian Blue', '021E44'),
('Sap Green', '0A3410'),
('Titanium White', 'FFFFFF'),
('Van Dyke Brown', '221B15'),
('Yellow Ochre', 'C79B00'),
('Alizarin Crimson', '4E1500');