module.exports = function() {
	const express = require('express');
	const router = express.Router();
	const pugTemplate = 'pages/studentsSponsors';

	function getStudentsSponsors(res, mysql, context, complete) {
		const query = `	SELECT students_sponsors.student_id, students_sponsors.sponsor_id, students_sponsors.date_started, 
						CONCAT_WS(\" \", sponsors.first_name, sponsors.last_name) AS sponsor_name,  
						CONCAT_WS(\" \", students.first_name, students.last_name) AS student_name FROM students_sponsors 
						INNER JOIN students ON students.id = students_sponsors.student_id INNER JOIN sponsors ON sponsors.id = students_sponsors.sponsor_id
						ORDER BY students.last_name`;
		mysql.pool.query(query, function(error, results, fields) {
			if(error) {
				return res.status(400).send(JSON.stringify(error));
			}
			context.studentsSponsors  = results;
			complete();
		});
	}

	function getSponsors(res, mysql, context, complete) {
		const query = "SELECT id, first_name, last_name, street_address, city, state, zip_code, date_started FROM sponsors";
		mysql.pool.query(query, function(error, results, fields) {
			if(error) {
				return res.status(400).send(JSON.stringify(error));
			}
			context.sponsors  = results;
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

	function getStudentAndSponsor(res, mysql, context, student_id, sponsor_id, complete) {
		const query = `	SELECT students_sponsors.student_id, students_sponsors.sponsor_id, students_sponsors.date_started, 
						CONCAT_WS(\" \", sponsors.first_name, sponsors.last_name) AS sponsor_name,  
						CONCAT_WS(\" \", students.first_name, students.last_name) AS student_name FROM students_sponsors 
						INNER JOIN students ON students.id = students_sponsors.student_id INNER JOIN sponsors ON sponsors.id = students_sponsors.sponsor_id
						WHERE students_sponsors.student_id = ? AND students_sponsors.sponsor_id = ?`;
		const inserts = [student_id, sponsor_id];
		mysql.pool.query(query, inserts, function(error, results, fields){
			if(error){
				return res.status(400).send(JSON.stringify(error));
			}
			const student = results[0];
			for(key in results[0]) {
				context[key] = student[key];
			}
			if(context.dob) {
				let jsDate = new Date(context.dob);
				context.dob = jsDate.toISOString().substr(0, 10);
			}
			if(context.date_started) {
				let jsDate = new Date(context.date_started);
				context.date_started = jsDate.toISOString().substr(0, 10);
			}
			if(context.date_ended) {
				let jsDate = new Date(context.date_ended);
				context.date_ended = jsDate.toISOString().substr(0, 10);
			}
			complete();
		});
	}

	// ==================
	// STUDENTS' SPONSORS ROUTES
	// ==================

	/*Display all students and their sponsors. Requires web based javascript to delete relationships with AJAX*/
	router.get('/', function(req, res) {
		let callbackCount = 0;
		let context = {};
		context.dbName = "Students and Their Sponsors";
		context.title = "Chenrezig Fund";
		context.jsScripts = ["deleteRelationship.js"];
		const mysql = req.app.get('mysql');
		getStudentsSponsors(res, mysql, context, complete);
		getStudents(res, mysql, context, complete);
		getSponsors(res, mysql, context, complete);
		function complete() {
			callbackCount++;
			if(callbackCount >= 3) {
				res.render(pugTemplate, context);
			}
		}
	});

	/* Adds a relationship, redirects to the relationship's page after adding */
	router.post('/', function(req, res) {
		const mysql = req.app.get('mysql');
		let sql = `	INSERT INTO students_sponsors(student_id, sponsor_id, date_started) 
					VALUES (?,?,?)`;
		const inserts = [	
							req.body.student_id, 
							req.body.sponsor_id, 
							req.body.date_started
						];
		sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
			if(error) {
				return res.status(400).send(JSON.stringify(error));
			}
			res.redirect('/studentsSponsors');
		});
	});

	/* Display one relationship for the specific purpose of updating relationship */
	router.get('/:student_id/:sponsor_id', function(req, res) {
		callbackCount = 0;
		let context = {};
		context.isUpdate = true;
		context.jsScripts = ["updateRelationship.js"];
		const mysql = req.app.get('mysql');
		getSponsors(res, mysql, context, complete);
		getStudents(res, mysql, context, complete);
		getStudentAndSponsor(res, mysql, context, req.params.student_id, req.params.sponsor_id, complete);
		function complete() {
			callbackCount++;
			if(callbackCount >= 3) {
				res.render(pugTemplate, context);
			}
		}
	});

	/* The URI that update data is sent to in order to update a relationship */
	router.put('/:student_id/:sponsor_id', function(req, res) {
		const mysql = req.app.get('mysql');
		let sql = 	"SELECT student_id, sponsor_id, date_started FROM students_sponsors WHERE student_id=? AND sponsor_id=?";
		const ids = [req.params.student_id, req.params.sponsor_id];
		sql = mysql.pool.query(sql, ids, function(err, result) {
			if(err){
				return res.status(400).send(JSON.stringify(err));
			}
			if(result.length === 1) {
				const currentRow = result[0];

				const updateQuery = `	UPDATE students_sponsors SET student_id=?, sponsor_id=?, date_started=? 
										WHERE student_id=? AND sponsor_id=?`;
				const updateValues = [	
										req.body.student_id || currentRow.student_id, 
										req.body.sponsor_id || currentRow.sponsor_id,
										req.body.date_started || currentRow.date_started,
										req.params.student_id,
										req.params.sponsor_id,
									];
				sql = mysql.pool.query(updateQuery, updateValues, function(error, results, fields) {
					if(error) {
						return res.status(400).send(JSON.stringify(error));
					}
					res.status(200).end();
				});
			}
		});
	});

	/* Route to delete a relationship, simply returns a 200 upon success. Ajax will handle this. */
	router.delete('/:student_id/:sponsor_id', function(req, res) {
		const mysql = req.app.get('mysql');
		let sql = "DELETE FROM students_sponsors WHERE student_id = ? AND sponsor_id = ?";
		const inserts = [req.params.student_id, req.params.sponsor_id];
		sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
			if(error) {
				return res.status(400).send(JSON.stringify(error));
			}
			res.status(200).end();
		});
	});

	return router;
}();