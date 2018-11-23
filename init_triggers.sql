-- Init Triggers

DROP TRIGGER IF EXISTS insert_sponsors;
DROP TRIGGER IF EXISTS update_sponsors;
DROP TRIGGER IF EXISTS insert_students;
DROP TRIGGER IF EXISTS update_students;
DROP TRIGGER IF EXISTS insert_schools;
DROP TRIGGER IF EXISTS update_schools;
DROP TRIGGER IF EXISTS del_schools;
DROP TRIGGER IF EXISTS insert_sd;
DROP TRIGGER IF EXISTS update_sd;
DROP TRIGGER IF EXISTS insert_donations;
DROP TRIGGER IF EXISTS update_donations;

DELIMITER |
CREATE TRIGGER insert_sponsors BEFORE INSERT ON sponsors
FOR EACH ROW BEGIN
	IF (NEW.first_name = '' AND NEW.last_name = '') THEN
		SIGNAL SQLSTATE '10000'
		SET MESSAGE_TEXT = 'Sponsor first and last name cannot be blank';
	END IF;
END;
|

DELIMITER ;

DELIMITER |
CREATE TRIGGER update_sponsors BEFORE UPDATE ON sponsors
FOR EACH ROW BEGIN
	IF (NEW.first_name = '' AND NEW.last_name = '') THEN
		SIGNAL SQLSTATE '10000'
		SET MESSAGE_TEXT = 'Sponsor first and last name cannot be blank';
	END IF;
END;
|

DELIMITER ;


DELIMITER |
CREATE TRIGGER insert_schools BEFORE INSERT ON schools
FOR EACH ROW BEGIN
	IF (NEW.name != '' AND NEW.is_secondary IS NULL) THEN
		SET NEW.is_secondary = 1;
	ELSEIF (NEW.name = '') THEN
		SIGNAL SQLSTATE '10000'
		SET MESSAGE_TEXT = 'School name cannot be blank';
	END IF;
END;
|

DELIMITER ;


DELIMITER |
CREATE TRIGGER insert_students BEFORE INSERT ON students
FOR EACH ROW BEGIN
	IF (NEW.first_name = '' AND NEW.last_name = '') THEN
		SIGNAL SQLSTATE '10000'
		SET MESSAGE_TEXT = 'Student first and last name cannot be blank';
	END IF;
END;
|

DELIMITER ;

DELIMITER |
CREATE TRIGGER update_students BEFORE UPDATE ON students
FOR EACH ROW BEGIN
	IF (NEW.first_name = '' AND NEW.last_name = '') THEN
		SIGNAL SQLSTATE '10000'
		SET MESSAGE_TEXT = 'Student first and last name cannot be blank';
	END IF;
END;
|

DELIMITER ;


DELIMITER |
CREATE TRIGGER insert_sd BEFORE INSERT ON students_donations
	FOR EACH ROW
	BEGIN
		IF (NEW.student_id IS NOT NULL AND NEW.donation_id IS NOT NULL AND NEW.percent_given IS NULL OR NEW.percent_given = '') THEN
			SET NEW.percent_given = 100;
		ELSEIF (NEW.percent_given IS NULL OR NEW.percent_given = '' OR NEW.percent_given < 0 OR NEW.percent_given > 100) THEN
			SIGNAL SQLSTATE '10000'
				SET MESSAGE_TEXT = 'Check constraint on attribute percent_given; value must be > 0 and <= 100';
		END IF;
END;
|

DELIMITER ;

DELIMITER |
CREATE TRIGGER update_sd BEFORE UPDATE ON students_donations
	FOR EACH ROW
	BEGIN
		IF (NEW.student_id IS NOT NULL AND NEW.donation_id IS NOT NULL AND NEW.percent_given IS NULL OR NEW.percent_given = '') THEN
			SET NEW.percent_given = 100;
		ELSEIF (NEW.percent_given IS NULL OR NEW.percent_given = '' OR NEW.percent_given < 0 OR NEW.percent_given > 100) THEN
			SIGNAL SQLSTATE '10000'
				SET MESSAGE_TEXT = 'Check constraint on attribute percent_given; value must be > 0 and <= 100';
		END IF;
END;
|

DELIMITER ;


DELIMITER |
CREATE TRIGGER insert_donations BEFORE INSERT ON donations
	FOR EACH ROW
	BEGIN
		IF (NEW.sponsor_id IS NOT NULL AND NEW.is_grant IS NULL) THEN
			SET NEW.is_grant = 0;
		END IF;
END;
|

DELIMITER ;

DELIMITER |
CREATE TRIGGER update_donations BEFORE UPDATE ON donations
	FOR EACH ROW
	BEGIN
		IF (NEW.sponsor_id IS NOT NULL AND NEW.is_grant IS NULL) THEN
			SET NEW.is_grant = 0;
		END IF;
END;
|

DELIMITER ;