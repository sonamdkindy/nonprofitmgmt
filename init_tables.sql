SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `sponsors`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `students_sponsors`;
DROP TABLE IF EXISTS `schools`;
DROP TABLE IF EXISTS `donations`;
DROP TABLE IF EXISTS `students_donations`;
SET FOREIGN_KEY_CHECKS = 1;

-- I will be making a database to be used for my family's nonprofit organization that provides 
-- financial support to Tibetan students in Wisconsin and Dehradun, India.  The organization has 
-- 24 sponsors and supports 76 students in total.  
-- The entities will be as follows:
-- "	Sponsors - name, address, date started
-- "	Students - name, birthdate, university/school ID (this will also identify those students at TCH India from those in Wisconsin), grad year, DATE started/ended
-- "	Universities/Schools - name, address, type (secondary/primary)
-- "	Donations - sponsor, date, method of payment, amount
-- The relationships will be as follows:
-- "	Students attend a university/school - one-to-many; a student can attend only one university/school but a school can have many students
-- "	Students have sponsors - many-to-many; a student can have many sponsors and many students can have the same sponsor
-- "	Sponsors make donations - many-to-one; a sponsor provides many donations from year-to-year but a donation can only belong to one sponsor
-- "	Tibetan students in Wisconsin receive a sponsor-designated percentage of a grant (large donation from a sponsor) - one-to-many; from year-to-year, students receive a percentage of a grant

-- Create a table called sponsor with the following properties:
-- "	Sponsors - name, address, date started
-- id - an auto incrementing integer which is the primary key
-- first_name - a varchar with a maximum length of 255 characters, cannot be null
-- last_name - a varchar with a maximum length of 255 characters, cannot be null
-- the combination of the first_name and last_name must be unique in this table
CREATE TABLE `sponsors`(
	`id` INT(11) AUTO_INCREMENT PRIMARY KEY,
	`first_name` VARCHAR(255) NOT NULL,
	`last_name` VARCHAR(255) NOT NULL,
	`street_address` VARCHAR(255),
	`city` VARCHAR(255),
	`state` VARCHAR(20),
	`zip_code` INT(11),
	`date_started` DATE,
	CONSTRAINT full_name UNIQUE(`first_name`, `last_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create a table called school with the following properties:
-- "	Universities/Schools - name, type (secondary/primary)
-- id - an auto incrementing integer which is the primary key
-- name - a varchar of maximum length 255, cannot be null
-- the name of the school should be unique in this table
-- NOTE: rows cannot be updated or deleted
CREATE TABLE `schools`(
	`id` INT(11) AUTO_INCREMENT PRIMARY KEY,
	`name` VARCHAR(255) NOT NULL UNIQUE,
	`is_secondary` BOOLEAN
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create a table called student with the following properties:
-- "	Students - name, birthdate, university/school ID (this will also identify those students at TCH India from those in Wisconsin), grad year, DATE started/ended
-- id - an auto incrementing integer which is the primary key
-- first_name - a varchar of maximum length 255, cannot be null
-- last_name - a varchar of maximum length 255, cannot be null
-- dob - a date type 
-- date_started - a date type 
-- date_ended - a date type 
-- the combination of the first_name, last_name must be unique in this table 
CREATE TABLE `students`(
	`id` INT(11) AUTO_INCREMENT PRIMARY KEY,
	`first_name` VARCHAR(255) NOT NULL,
	`last_name` VARCHAR(255) NOT NULL,
	`dob` DATE,
	`in_india` BOOLEAN,
	`school_id` INT(11),
	`grad_year` INT(4),
	`date_started` DATE,
	`date_ended` DATE,
	CONSTRAINT UNIQUE(`first_name`, `last_name`),
	FOREIGN KEY(`school_id`) REFERENCES schools(`id`)
		ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create a table called donations with the following properties:
-- "	Donations - sponsor, date, method of payment, amount, is grant
CREATE TABLE `donations`(
	`id` INT(11) AUTO_INCREMENT PRIMARY KEY,
	`sponsor_id` INT(11) NOT NULL,
	`date` DATE NOT NULL,
	`amount` INT(11) NOT NULL,
	`method` VARCHAR(255),
	`is_grant` BOOLEAN,
	FOREIGN KEY(`sponsor_id`) REFERENCES sponsors(`id`)
		ON DELETE CASCADE
		ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- Create a table called student_donations 
-- originally many to 1 but upon further reflection M:N is more appropriate given that
-- a single donation can benefit more than 1 student and more than one donation can benefit a single student
-- student_id - an integer which is a foreign key reference to student
-- donation_id - an integer which is a foreign key reference to donation
-- percent_given - an integer with a default of 100
-- The primary key is a combination of student_id and donation_id 
CREATE TABLE `students_donations`(
	`student_id` INT(11) NOT NULL,
	`donation_id` INT(11) NOT NULL,
	`percent_given` INT(11) NOT NULL,
	PRIMARY KEY(student_id, donation_id),
	FOREIGN KEY(`student_id`) REFERENCES students(`id`)
		ON DELETE CASCADE
		ON UPDATE CASCADE,
	FOREIGN KEY(`donation_id`) REFERENCES donations(`id`)
		ON DELETE CASCADE
		ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create a table called student_sponsor with the following properties, this is a table representing a many-to-many relationship
-- "	Students have sponsors - many-to-many; a student can have many sponsors and many students can have the same sponsor
CREATE TABLE `students_sponsors`(
	`student_id` INT(11) NOT NULL,
	`sponsor_id` INT(11) NOT NULL,
	`date_started` DATE,
	PRIMARY KEY(student_id, sponsor_id),
	FOREIGN KEY(`student_id`) REFERENCES students(`id`)
		ON DELETE CASCADE
		ON UPDATE CASCADE,
	FOREIGN KEY(`sponsor_id`) REFERENCES sponsors(`id`)
		ON DELETE CASCADE
		ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;