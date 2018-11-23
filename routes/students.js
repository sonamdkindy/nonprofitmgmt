module.exports = function() {
	const express = require('express');
	const router = express.Router();
	const pugTemplate = 'pages/students';

	function getSchools(res, mysql, context, complete) {
		const query = "SELECT id, name, is_secondary FROM schools ORDER BY name";
		mysql.pool.query(query, function(error, results, fields) {
			if(error) {
				return res.status(400).send(JSON.stringify(error));
			}
			context.schools  = results;
			complete();
		});
	}
	
	function getStudents(res, mysql, context, complete) {
		const query = `	SELECT students.id, schools.is_secondary, first_name, last_name, dob, in_india, schools.name AS school_name, grad_year, date_started, date_ended 
						FROM students LEFT JOIN schools ON schools.id = students.school_id ORDER BY last_name`;
		mysql.pool.query(query, function(error, results, fields) {
			if(error) {
				return res.status(400).send(JSON.stringify(error));
			}
			context.students  = results;
			complete();
		});
	}

	function getStudent(res, mysql, context, id, complete) {
		const query = `	SELECT students.id, schools.is_secondary, first_name, last_name, dob, in_india, school_id, grad_year, date_started, date_ended FROM students 
						LEFT JOIN schools ON schools.id = students.school_id WHERE students.id = ?`;
		const inserts = [id];
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
	// STUDENTS ROUTES
	// ==================

	/*Display all students. Requires web based javascript to delete users with AJAX*/
	router.get('/', function(req, res) {
		let callbackCount = 0;
		let context = {};
		const dbName = req._parsedOriginalUrl.path.replace('/', '').replace('/', '');
		context.dbName = dbName;
		context.title = "Chenrezig Fund";
		context.jsScripts = ["deleteStudent.js", "updateStudent.js"];
		const mysql = req.app.get('mysql');
		getStudents(res, mysql, context, complete);
		getSchools(res, mysql, context, complete);
		function complete() {
			callbackCount++;
			if(callbackCount >= 2) {
				res.render(pugTemplate, context);
			}
		}
	});

	/* Display one student for the specific purpose of updating student */
	router.get('/:id', function(req, res) {
		callbackCount = 0;
		let context = {};
		context.isUpdate = true;
		context.jsScripts = ["updateStudent.js"];
		const mysql = req.app.get('mysql');
		getStudent(res, mysql, context, req.params.id, complete);
		getSchools(res, mysql, context, complete);
		function complete() {
			callbackCount++;
			if(callbackCount >= 2) {
				res.render(pugTemplate, context);
			}
		}
	});

	/* Adds a student, redirects to the students page after adding */
	router.post('/', function(req, res) {
		const mysql = req.app.get('mysql');
		let sql = `	INSERT INTO students(first_name, last_name, dob, in_india, school_id, grad_year, date_started, date_ended) 
					VALUES (?,?,?,?,?,?,?,?)`;
		const inserts = [	
							req.body.first_name, 
							req.body.last_name, 
							req.body.dob || null, 
							req.body.in_india,
							req.body.school_id, 
							req.body.grad_year || null,
							req.body.date_started || null,
							req.body.date_ended || null
						];
		sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
			if(error) {
				return res.status(400).send(JSON.stringify(error));
			}
			res.redirect('/students');
		});
	});

	/* The URI that update data is sent to in order to update a student */
	router.put('/:id', function(req, res) {
		const mysql = req.app.get('mysql');
		let sql = 	"SELECT first_name, last_name, dob, in_india, school_id, grad_year, date_started, date_ended FROM students WHERE id=?";
		const id = [req.params.id];
		sql = mysql.pool.query(sql, id, function(err, result) {
			if(err) {
				return res.status(400).send(JSON.stringify(err));
			}
			if(result.length === 1) {
				const student = result[0];

				const updateQuery = `	UPDATE students SET first_name=?, last_name=?, dob=?, in_india=?, school_id=?, grad_year=?, date_started=?, date_ended=? 
										WHERE id=?`;
				const updateValues = [	
										req.body.first_name || student.first_name, 
										req.body.last_name || student.last_name, 
										req.body.dob || null, 
										req.body.in_india || 0,
										req.body.school_id || null, 
										req.body.grad_year || null,
										req.body.date_started || null,
										req.body.date_ended || null,
										req.params.id
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

	/* Route to delete a student, simply returns a 200 upon success. Ajax will handle this. */
	router.delete('/:id', function(req, res) {
		const mysql = req.app.get('mysql');
		let sql = "DELETE FROM students WHERE id = ?";
		const inserts = [req.params.id];
		sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
			if(error) {
				return res.status(400).send(JSON.stringify(error));
			}
			res.status(200).end();
		});
	});

	return router;
}();