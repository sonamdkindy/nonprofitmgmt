module.exports = function() {
	const express = require('express');
	const router = express.Router();
	const pugTemplate = 'pages/schools';

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

	// ==================
	// SCHOOLS ROUTES
	// ==================

	/*Display all schools. Requires web based javascript to delete users with AJAX*/
	router.get('/', function(req, res) {
		let context = {};
		const dbName = req._parsedOriginalUrl.path.replace('/', '');
		context.dbName = dbName;
		context.title = "Chenrezig Fund";
		context.jsScripts = ["deleteSchool.js"];
		const mysql = req.app.get('mysql');
		getSchools(res, mysql, context, complete);
		function complete() {
			res.render(pugTemplate, context);
		}
	});

	/* Adds a school, redirects to the schools page after adding */
	router.post('/', function(req, res) {
		const mysql = req.app.get('mysql');
		let sql = "INSERT INTO schools (name, is_secondary) VALUES (?,?)";
		const inserts = [req.body.name, req.body.is_secondary || 1];
		sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
			if(error) {
				return res.status(400).send(JSON.stringify(error));
			} 
			res.redirect('/schools');
		});
	});

	/* Route to delete a school, simply returns a 200 upon success. Ajax will handle this. */
	router.delete('/:id', function(req, res) {
		const mysql = req.app.get('mysql');
		let sql = "DELETE FROM schools WHERE id = ?";
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