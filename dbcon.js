const mysql = require('mysql');

const osu = {
	connectionLimit : 10,
	host            : 'classmysql.engr.oregonstate.edu',
	user            : 'cs340_kindys',
	password        : '3206',
	database        : 'cs340_kindys'
};

const pool = mysql.createPool(osu);

module.exports.pool = pool;
