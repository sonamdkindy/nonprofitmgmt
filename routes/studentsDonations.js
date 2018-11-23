module.exports = function() {
	const express = require('express');
	const router = express.Router();
	const pugTemplate = 'pages/studentsDonations';

	function getStudentsDonations(res, mysql, context, complete) {
		const query = `	SELECT donations.id AS donation_id, students.id AS student_id, sponsors.id AS sponsor_id, 
						CONCAT_WS(\" \", sponsors.first_name, sponsors.last_name) AS sponsor_name, 
						CONCAT_WS(\" \", students.first_name, students.last_name) AS student_name, 
						percent_given, donations.date, donations.is_grant, donations.amount FROM students_donations 
						INNER JOIN students ON students.id = students_donations.student_id 
						INNER JOIN donations ON donations.id = students_donations.donation_id 
						INNER JOIN sponsors ON sponsors.id = donations.sponsor_id
						ORDER BY donations.date DESC`;
		mysql.pool.query(query, function(error, results, fields) {
			if(error) {
				return res.status(400).send(JSON.stringify(error));
			}
			context.studentsDonations  = results;
			complete();
		});
	}

	function getFilteredStudentsDonations(res, mysql, context, student_id, complete) {
		const query = `	SELECT donations.id AS donation_id, students.id AS student_id, sponsors.id AS sponsor_id, 
						CONCAT_WS(\" \", sponsors.first_name, sponsors.last_name) AS sponsor_name, 
						CONCAT_WS(\" \", students.first_name, students.last_name) AS student_name, 
						percent_given, donations.date, donations.is_grant, donations.amount FROM students_donations 
						INNER JOIN students ON students.id = students_donations.student_id 
						INNER JOIN donations ON donations.id = students_donations.donation_id 
						INNER JOIN sponsors ON sponsors.id = donations.sponsor_id
						WHERE students_donations.student_id = ?
						ORDER BY donations.date DESC`;
		const id = [student_id];
		mysql.pool.query(query, id, function(error, results, fields) {
			if(error) {
				return res.status(400).send(JSON.stringify(error));
			}
			context.filterBy = student_id;
			context.studentsDonations  = results;
			complete();
		});
	}

	function getSponsors(res, mysql, context, complete) {
		const query = 	"SELECT id, first_name, last_name FROM sponsors";
		mysql.pool.query(query, function(error, results, fields) {
			if(error) {
				return res.status(400).send(JSON.stringify(error));
			}
			context.sponsors  = results;
			complete();
		});
	}

	function getUnaccountedDonations(res, mysql, context, complete) {
		const query = `	SELECT donations.id,  CONCAT_WS(" ", sponsors.first_name, sponsors.last_name) AS sponsor_name, date, amount, method, is_grant, 
						SUM(
							CASE 
								WHEN students_donations.percent_given
								THEN students_donations.percent_given
								ELSE 0
							END
						)  AS total_given
						FROM donations 
						LEFT JOIN students_donations ON donations.id = students_donations.donation_id
						LEFT JOIN sponsors ON donations.sponsor_id = sponsors.id
						LEFT JOIN students ON students_donations.student_id = students.id
						GROUP BY donations.id
						HAVING total_given != 100
						ORDER BY donations.date`;
		mysql.pool.query(query, function(error, results, fields) {
			if(error) {
				res.status(400).send(JSON.stringify(error));
			}
			context.donations  = results;
			complete();
		});
	}

	function getStudents(res, mysql, context, complete) {
		const query = `	SELECT students.id, first_name, last_name, dob, in_india, schools.name AS school_name, grad_year, date_started, date_ended 
						FROM students INNER JOIN schools ON schools.id = students.school_id`;
		mysql.pool.query(query, function(error, results, fields) {
			if(error) {
				return res.status(400).send(JSON.stringify(error));
			}
			context.students  = results;
			complete();
		});
	}

	function getDonations(res, mysql, context, complete) {
		const query = `	SELECT donations.id,  CONCAT_WS(" ", sponsors.first_name, sponsors.last_name) AS sponsor_name, date, amount, method, is_grant, SUM(percent_given) AS total_given
						FROM students_donations
						INNER JOIN donations ON donations.id = students_donations.donation_id
						INNER JOIN sponsors ON donations.sponsor_id = sponsors.id
						INNER JOIN students ON students_donations.student_id = students.id
						GROUP BY donations.id`;
		mysql.pool.query(query, function(error, results, fields) {
			if(error) {
				return res.status(400).send(JSON.stringify(error));
			}
			context.donations  = results;
			complete();
		});
	}

	function getStudentsDonation(res, mysql, context, student_id, donation_id, complete) {
		const query = `	SELECT donations.id AS donation_id, students.id AS student_id, sponsors.id AS sponsor_id, 
						CONCAT_WS(\" \", sponsors.first_name, sponsors.last_name) AS sponsor_name, 
						CONCAT_WS(\" \", students.first_name, students.last_name) AS student_name, 
						percent_given, donations.date, donations.amount FROM students_donations 
						INNER JOIN students ON students.id = students_donations.student_id 
						INNER JOIN donations ON donations.id = students_donations.donation_id 
						INNER JOIN sponsors ON sponsors.id = donations.sponsor_id
						WHERE students_donations.student_id = ? AND students_donations.donation_id = ?`;
		const inserts = [student_id, donation_id];
		mysql.pool.query(query, inserts, function(error, results, fields) {
			if(error) {
				return res.status(400).send(JSON.stringify(error));
			}
			const donation = results[0];
			for(key in results[0]) {
				context[key] = donation[key];
			}
			complete();
		});
	}

	// ==================
	// STUDENTS' DONATIONS ROUTES
	// ==================

	/*Display all students' donations. Requires web based javascript to delete relationships with AJAX*/
	router.get('/', function(req, res) {
		let callbackCount = 0;
		let context = {};
		context.dbName = "Students' Donations";
		context.title = "Chenrezig Fund";
		context.jsScripts = ["deleteRelationship.js"];
		const mysql = req.app.get('mysql');
		getStudentsDonations(res, mysql, context, complete);
		getUnaccountedDonations(res, mysql, context, complete);
		getStudents(res, mysql, context, complete);
		function complete() {
			callbackCount++;
			if(callbackCount >= 3) {
				res.render(pugTemplate, context);
			}
		}
	});

	/* Adds a relationship, redirects to the students' donations page after adding */
	router.post('/', function(req, res) {
		const mysql = req.app.get('mysql');
		let sql = `	SELECT IFNULL(SUM(percent_given),0) AS total_given FROM students_donations 
					WHERE donation_id = ? ORDER BY donation_id`;
		const id = [req.body.donation_id];
		sql = mysql.pool.query(sql, id, function(err, result) {
			if(err) {
				return res.status(400).send(JSON.stringify(err));
			}

			const currentRow = result[0];
			if(	err || 
				currentRow && currentRow.total_given != 0 && Number(currentRow.total_given) + Number(req.body.percent_given) > 100 ||
				Number(req.body.percent_given) > 100 ||
				!req.body.percent_given && currentRow.total_given) {
				if(err) {
					return res.status(400).send(JSON.stringify(err));
				}
				return res.status(400).send(`Percent given must be <= ${currentRow.total_given ? 100 - currentRow.total_given : 100}.`);
			}

			let sql = "INSERT INTO students_donations(student_id, donation_id, percent_given) VALUES(?,?,?)";
			const inserts = [
								req.body.student_id, 
								req.body.donation_id, 
								req.body.percent_given
							];
			sql = mysql.pool.query(sql, inserts, function(err, results, fields) {
				if(err) {
					return res.status(400).send(JSON.stringify(err));
				} 
				res.redirect('/studentsDonations');
			});
		});
	});

	/* Filter results by student */
	router.get('/filter', function(req, res) {
		callbackCount = 0;
		let context = {};
		context.dbName = "Student's Donations";
		context.isFilter = true;
		context.jsScripts = ["deleteRelationship.js"];
		const mysql = req.app.get('mysql');
		getFilteredStudentsDonations(res, mysql, context, req.query.id, complete);
		getUnaccountedDonations(res, mysql, context, complete);
		getStudents(res, mysql, context, complete);
		function complete() {
			callbackCount++;
			if(callbackCount >= 3) {
				res.render(pugTemplate, context);
			}
		}
	});

	/* Display one relationship for the specific purpose of updating relationship */
	router.get('/:student_id/:donation_id', function(req, res) {
		callbackCount = 0;
		let context = {};
		context.isUpdate = true;
		context.jsScripts = ["updateRelationship.js"];
		const mysql = req.app.get('mysql');
		getStudentsDonation(res, mysql, context, req.params.student_id, req.params.donation_id, complete);
		getDonations(res, mysql, context, complete);
		getStudents(res, mysql, context, complete);
		function complete() {
			callbackCount++;
			if(callbackCount >= 3) {
				res.render(pugTemplate, context);
			}
		}
	});

	/* The URI that update data is sent to in order to update a relationship */
	router.put('/:student_id/:donation_id', function(req, res) {
		const mysql = req.app.get('mysql');
		let sql = `	SELECT student_id, donation_id, percent_given FROM students_donations 
					WHERE students_donations.student_id = ? AND students_donations.donation_id = ?`;
		const id = [req.params.student_id, req.params.donation_id];
		sql = mysql.pool.query(sql, id, function(err, result) {
			if(err || !result) {
				return res.status(400).send(err ? JSON.stringify(err) : `Student donation not found.`);
			}
			const currentRow = result[0];
			sql = `	SELECT IFNULL(SUM(percent_given),0) AS total_given FROM students_donations 
					WHERE donation_id = ? AND students_donations.student_id != ? ORDER BY donation_id`;
			const ids = [currentRow.donation_id, req.params.student_id];
			sql = mysql.pool.query(sql, ids, function(err, result) {
				if(err) {
					return res.status(400).send(JSON.stringify(err));
				}

				const currentRow = result[0];
				if(	err || 
					currentRow && currentRow.total_given != 0 && Number(currentRow.total_given) + Number(req.body.percent_given) > 100 ||
					Number(req.body.percent_given) > 100 ||
					!req.body.percent_given && currentRow.total_given) {
					if(err) {
						return res.status(400).send(JSON.stringify(err));
					}
					return res.status(400).send(`Percent given must be <= ${currentRow.total_given ? 100 - currentRow.total_given : 100}.`);
				}

				const updateQuery = `	UPDATE students_donations SET student_id=?, donation_id=?, percent_given=? 
										WHERE student_id = ? AND donation_id = ?`;
				const updateValues = [	
										req.body.student_id || currentRow.student_id, 
										req.body.donation_id || currentRow.donation_id,
										req.body.percent_given || currentRow.percent_given,
										req.params.student_id,
										req.params.donation_id
									];
				sql = mysql.pool.query(updateQuery, updateValues, function(error, results, fields) {
					if(error) {
						return res.status(400).send(JSON.stringify(error));
					}
					res.status(200).end();
				});
			});
		});
	});

	/* Route to delete a relationship, simply returns a 200 upon success. Ajax will handle this. */
	router.delete('/:student_id/:donation_id', function(req, res) {
		const mysql = req.app.get('mysql');
		let sql = "DELETE FROM students_donations WHERE student_id = ? AND donation_id = ?";
		const inserts = [req.params.student_id, req.params.donation_id];
		sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
			if(error) {
				return res.status(400).send(JSON.stringify(error));
			}
			res.status(200).end();
		});
	});

	return router;
}();