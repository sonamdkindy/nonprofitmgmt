module.exports = function() {
	const express = require('express');
	const router = express.Router();
	const pugTemplate = 'pages/sponsors';

	function getSponsors(res, mysql, context, complete) {
		const query = "SELECT id, first_name, last_name, street_address, city, state, zip_code, date_started FROM sponsors ORDER BY last_name";
		mysql.pool.query(query, function(error, results, fields) {
			if(error) {
				return res.send(JSON.stringify(error));
			}
			context.sponsors  = results;
			complete();
		});
	}

	function getSponsor(res, mysql, context, id, complete) {
		const query = "SELECT id, first_name, last_name, street_address, city, state, zip_code, date_started FROM sponsors WHERE id = ?";
		const inserts = [id];
		mysql.pool.query(query, inserts, function(error, results, fields) {
			if(error){
				return res.send(JSON.stringify(error));
			}
			const student = results[0];
			for(key in results[0]) {
				context[key] = student[key];
			}
			if(context.date_started) {
				let jsDate = new Date(context.date_started);
				context.date_started = jsDate.toISOString().substr(0, 10);
			}
			complete();
		});
	}

	// ==================
	// SPONSORS ROUTES
	// ==================

	/*Display all sponsors. Requires web based javascript to delete users with AJAX*/
	router.get('/', function(req, res) {
		let callbackCount = 0;
		let context = {};
		const dbName = req._parsedOriginalUrl.path.replace('/', '').replace('/', '');
		context.dbName = dbName;
		context.title = "Chenrezig Fund";
		context.jsScripts = ["deleteSponsor.js"];
		const mysql = req.app.get('mysql');
		getSponsors(res, mysql, context, complete);
		function complete() {
			res.render(pugTemplate, context);
		}
	});

	/* Adds a sponsor, redirects to the sponsors page after adding */
	router.post('/', function(req, res) {
		const mysql = req.app.get('mysql');
		let sql = `	INSERT INTO sponsors(first_name, last_name, street_address, city, state, zip_code, date_started) 
					VALUES (?,?,?,?,?,?,?)`;
		const inserts = [	
							req.body.first_name, 
							req.body.last_name, 
							req.body.street_address,
							req.body.city, 
							req.body.state,
							req.body.zip_code,
							req.body.date_started
						];
		sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
			if(error) {
				return res.status(400).send(JSON.stringify(error));
			}
			res.redirect('/sponsors');
		});
	});

	/* Display one sponsor for the specific purpose of updating sponsor */
	router.get('/:id', function(req, res) {
		callbackCount = 0;
		let context = {};
		context.isUpdate = true;
		context.jsScripts = ["updateSponsor.js"];
		const mysql = req.app.get('mysql');
		getSponsor(res, mysql, context, req.params.id, complete);
		function complete() {
			res.render(pugTemplate, context);
		}
	});

	/* The URI that update data is sent to in order to update a sponsor */
	router.put('/:id', function(req, res) {
		const mysql = req.app.get('mysql');
		let sql = "SELECT id, first_name, last_name, street_address, city, state, zip_code, date_started FROM sponsors WHERE id = ?";
		const id = [req.params.id];
		sql = mysql.pool.query(sql, id, function(err, result) {
			if(err) {
				return res.status(400).send(JSON.stringify(err));
			}
			if(result.length === 1) {
				const sponsor = result[0];

				const updateQuery = `	UPDATE sponsors SET first_name=?, last_name=?, street_address=?, city=?, state=?, zip_code=?, date_started=? 
										WHERE id=?`;
				const updateValues = [	
										req.body.first_name || sponsor.first_name, 
										req.body.last_name || sponsor.last_name, 
										req.body.street_address || null,
										req.body.city || null, 
										req.body.state || null,
										req.body.zip_code || null,
										req.body.date_started || null,
										req.params.id
									];
				sql = mysql.pool.query(updateQuery, updateValues, function(error, results, fields) {
					if(error) {
						return res.send(JSON.stringify(error));
					}
					res.status(200).end();
				});
			}
		});
	});

	/* Route to delete a sponsor, simply returns a 200 upon success. Ajax will handle this. */
	router.delete('/:id', function(req, res) {
		const mysql = req.app.get('mysql');
		let sql = "DELETE FROM sponsors WHERE id = ?";
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