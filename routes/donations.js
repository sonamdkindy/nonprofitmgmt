module.exports = function() {
	const express = require('express');
	const router = express.Router();
	const pugTemplate = 'pages/donations';

	function getDonations(res, mysql, context, complete) {
		const query = `	SELECT donations.id,  CONCAT_WS(\" \", sponsors.first_name, sponsors.last_name) AS sponsor_name, date, amount, method, is_grant 
						FROM donations INNER JOIN sponsors on donations.sponsor_id = sponsors.id
						ORDER BY donations.date DESC, sponsors.last_name`;
		mysql.pool.query(query, function(error, results, fields) {
			if(error) {
				return res.status(400).send(JSON.stringify(error));
			}
			context.donations  = results;
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

	function getDonation(res, mysql, context, id, complete) {
		const query = 	"SELECT id, sponsor_id, date, amount, method, is_grant FROM donations WHERE id = ?";
		const inserts = [id];
		mysql.pool.query(query, inserts, function(error, results, fields){
			if(error){
				return res.status(400).send(JSON.stringify(error));
			}
			const student = results[0];
			for(key in results[0]) {
				context[key] = student[key];
			}
			if(context.date) {
				let jsDate = new Date(context.date);
				context.date = jsDate.toISOString().substr(0, 10);
			}
			complete();
		});
	}

	// ==================
	// DONATIONS ROUTES
	// ==================

	/*Display all donations. Requires web based javascript to delete users with AJAX*/
	router.get('/', function(req, res) {
		let callbackCount = 0;
		let context = {};
		const dbName = req._parsedOriginalUrl.path.replace('/', '').replace('/', '');
		context.dbName = dbName;
		context.title = "Chenrezig Fund";
		context.jsScripts = ["deleteDonation.js"];
		const mysql = req.app.get('mysql');
		getDonations(res, mysql, context, complete);
		getSponsors(res, mysql, context, complete);
		function complete() {
			callbackCount++;
			if(callbackCount >= 2) {
				res.render(pugTemplate, context);
			}
		}
	});

	/* Adds a donation, redirects to the donations page after adding */
	router.post('/', function(req, res) {
		const mysql = req.app.get('mysql');
		let sql = "INSERT INTO donations (date, sponsor_id, amount, method, is_grant) VALUES (?,?,?,?,?)";
		const inserts = [
							req.body.date, 
							req.body.sponsor_id, 
							req.body.amount, 
							req.body.method, 
							req.body.is_grant
						];
		if(!req.body.is_grant) {
			inserts[inserts.length - 1] = 0;
		}
		sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
			if(error) {
				return res.status(400).send(JSON.stringify(error));
			} 
			res.redirect('/donations');
		});
	});

	/* Display one donation for the specific purpose of updating donation */
	router.get('/:id', function(req, res) {
		callbackCount = 0;
		let context = {};
		context.isUpdate = true;
		context.jsScripts = ["updateDonation.js"];
		const mysql = req.app.get('mysql');
		getDonation(res, mysql, context, req.params.id, complete);
		getSponsors(res, mysql, context, complete);
		function complete() {
			callbackCount++;
			if(callbackCount >= 2) {
				res.render(pugTemplate, context);
			}
		}
	});

	/* The URI that update data is sent to in order to update a donation */
	router.put('/:id', function(req, res) {
		const mysql = req.app.get('mysql');
		let sql = 	"SELECT id, sponsor_id, date, amount, method, is_grant FROM donations WHERE id = ?";
		const id = [req.params.id];
		sql = mysql.pool.query(sql, id, function(err, result) {
			if(err) {
				return res.status(400).send(JSON.stringify(err));
			}
			if(result.length === 1) {
				const donation = result[0];

				const updateQuery = `	UPDATE donations SET sponsor_id=?, date=?, amount=?, method=?, is_grant=? 
										WHERE id=?`;
				const updateValues = [	
										req.body.sponsor_id || donation.sponsor_id, 
										req.body.date || donation.date, 
										req.body.amount || donation.amount, 
										req.body.method || donation.method,
										req.body.is_grant, 
										req.params.id
									];
				sql = mysql.pool.query(updateQuery, updateValues, function(error, results, fields) {
					if(error) {
						return res.status(400).send(JSON.stringify(error));
					}
					res.status(200);
					res.end();
				});
			}
		});
	});

	/* Route to delete a donation, simply returns a 200 upon success. Ajax will handle this. */
	router.delete('/:id', function(req, res) {
		const mysql = req.app.get('mysql');
		let sql = "DELETE FROM donations WHERE id = ?";
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