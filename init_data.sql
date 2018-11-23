-- insert the following into the sponsors table:

INSERT INTO `sponsors`(`first_name`, `last_name`)
VALUES('Ann', 'Beirmann');

INSERT INTO `sponsors`(`first_name`, `last_name`)
VALUES('Richard', 'Davidson');

INSERT INTO `sponsors`(`first_name`, `last_name`)
VALUES('Gordon', 'Faulkner');

INSERT INTO `sponsors`(`first_name`, `last_name`)
VALUES('Larry', 'Winkler');


-- insert the following into the schools table:

INSERT INTO `schools`(`name`, `is_secondary`)
VALUES("Tibetan Children's Home", 0);

INSERT INTO `schools`(`name`)
VALUES("UW-Madison");

INSERT INTO `schools`(`name`)
VALUES("UW-Edgewood");

INSERT INTO `schools`(`name`)
VALUES("UW-Ripon");


-- insert the following into the students table using subqueries to look up data as needed:

INSERT INTO `students`(`first_name`, `last_name`, `school_id`)
VALUES(
	'Nawang', 
	'Singhe', 
	(SELECT `id` FROM `schools` WHERE `name` = "Tibetan Children's Home")
);

INSERT INTO `students`(`first_name`, `last_name`, `school_id`)
VALUES(
	'Tenzin', 
	'Dolkar', 
	(SELECT `id` FROM `schools` WHERE `name` = "Tibetan Children's Home")
);

INSERT INTO `students`(`first_name`, `last_name`, `school_id`)
VALUES(
	'Tenzin', 
	'Lhamo', 
	(SELECT `id` FROM `schools` WHERE `name` = "UW-Madison")
);

INSERT INTO `students`(`first_name`, `last_name`, `school_id`)
VALUES(
	'Tenzin', 
	'Namdol', 
	(SELECT `id` FROM `schools` WHERE `name` = "UW-Ripon")
);

INSERT INTO `students`(`first_name`, `last_name`, `school_id`)
VALUES(
	'Sonam', 
	'Dolkar', 
	(SELECT `id` FROM `schools` WHERE `name` = "UW-Edgewood")
);


-- insert the following into the students_sponsors table using subqueries to look up data as needed:

INSERT INTO `students_sponsors`(`student_id`, `sponsor_id`, `date_started`)
VALUES(
	(SELECT `id` FROM `students` WHERE `first_name` = 'Sonam' AND `last_name` = 'Dolkar'),
	(SELECT `id` FROM `sponsors` WHERE `first_name` = 'Gordon' AND `last_name` = 'Faulkner'),
	'2018-1-1'
);

INSERT INTO `students_sponsors`(`student_id`, `sponsor_id`, `date_started`)
VALUES(
	(SELECT `id` FROM `students` WHERE `first_name` = 'Tenzin' AND `last_name` = 'Lhamo'),
	(SELECT `id` FROM `sponsors` WHERE `first_name` = 'Gordon' AND `last_name` = 'Faulkner'),
	'2018-1-1'
);

INSERT INTO `students_sponsors`(`student_id`, `sponsor_id`, `date_started`)
VALUES(
	(SELECT `id` FROM `students` WHERE `first_name` = 'Nawang' AND `last_name` = 'Singhe'),
	(SELECT `id` FROM `sponsors` WHERE `first_name` = 'Larry' AND `last_name` = 'Winkler'),
	'2018-3-10'
);

INSERT INTO `students_sponsors`(`student_id`, `sponsor_id`, `date_started`)
VALUES(
	(SELECT `id` FROM `students` WHERE `first_name` = 'Nawang' AND `last_name` = 'Singhe'),
	(SELECT `id` FROM `sponsors` WHERE `first_name` = 'Ann' AND `last_name` = 'Beirmann'),
	'2018-2-14'
);

INSERT INTO `students_sponsors`(`student_id`, `sponsor_id`, `date_started`)
VALUES(
	(SELECT `id` FROM `students` WHERE `first_name` = 'Tenzin' AND `last_name` = 'Dolkar'),
	(SELECT `id` FROM `sponsors` WHERE `first_name` = 'Richard' AND `last_name` = 'Davidson'),
	'2018-1-31'
);


-- insert the following into the donations table using subqueries to look up data as needed:

INSERT INTO `donations`(`sponsor_id`, `date`, `amount`, `method`)
VALUES(
	(SELECT `id` FROM `sponsors` WHERE `first_name` = 'Ann' AND `last_name` = 'Beirmann'),
	'2018-04-06',
	120,
	'check'
);

INSERT INTO `donations`(`sponsor_id`, `date`, `amount`, `method`)
VALUES(
	(SELECT `id` FROM `sponsors` WHERE `first_name` = 'Richard' AND `last_name` = 'Davidson'),
	'2018-04-10',
	305,
	'check'
);

INSERT INTO `donations`(`sponsor_id`, `date`, `amount`, `method`)
VALUES(
	(SELECT `id` FROM `sponsors` WHERE `first_name` = 'Larry' AND `last_name` = 'Winkler'),
	'2018-01-01',
	50,
	'paypal'
);

INSERT INTO `donations`(`sponsor_id`, `date`, `amount`, `method`, `is_grant`)
VALUES(
	(SELECT `id` FROM `sponsors` WHERE `first_name` = 'Gordon' AND `last_name` = 'Faulkner'),
	'2018-04-06',
	20000,
	'direct deposit',
	1
);


-- insert the following into the donations table using subqueries to look up data as needed:

INSERT INTO `students_donations`(`student_id`, `donation_id`, `percent_given`)
VALUES(
	(SELECT `id` FROM `students` WHERE `first_name` = 'Sonam' AND `last_name` = 'Dolkar'),
	(
		SELECT d.id FROM `donations` d
		INNER JOIN sponsors s ON s.id = d.sponsor_id
		WHERE first_name = 'Gordon' AND last_name = 'Faulkner'
	),
	30
);

INSERT INTO `students_donations`(`student_id`, `donation_id`, `percent_given`)
VALUES(
	(SELECT `id` FROM `students` WHERE `first_name` = 'Tenzin' AND `last_name` = 'Lhamo'),
	(
		SELECT d.id FROM `donations` d
		INNER JOIN sponsors s ON s.id = d.sponsor_id
		WHERE first_name = 'Gordon' AND last_name = 'Faulkner'
	),
	30
);

INSERT INTO `students_donations`(`student_id`, `donation_id`)
VALUES(
	(SELECT `id` FROM `students` WHERE `first_name` = 'Nawang' AND `last_name` = 'Singhe'),
	(
		SELECT d.id FROM `donations` d
		INNER JOIN sponsors s ON s.id = d.sponsor_id
		WHERE first_name = 'Larry' AND last_name = 'Winkler'
	)
);

INSERT INTO `students_donations`(`student_id`, `donation_id`)
VALUES(
	(SELECT `id` FROM `students` WHERE `first_name` = 'Nawang' AND `last_name` = 'Singhe'),
	(
		SELECT d.id FROM `donations` d
		INNER JOIN sponsors s ON s.id = d.sponsor_id
		WHERE first_name = 'Ann' AND last_name = 'Beirmann'
	)
);

INSERT INTO `students_donations`(`student_id`, `donation_id`)
VALUES(
	(SELECT `id` FROM `students` WHERE `first_name` = 'Tenzin' AND `last_name` = 'Dolkar'),
	(
		SELECT d.id FROM `donations` d
		INNER JOIN sponsors s ON s.id = d.sponsor_id
		WHERE first_name = 'Richard' AND last_name = 'Davidson'
	)
);