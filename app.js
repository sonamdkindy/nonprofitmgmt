const PORT = process.env.PORT || 5710;
const express = require('express');
const mysql = require('./dbcon.js');
const path = require('path');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const app = express();

const schoolsRoutes = require(path.join(__dirname, "routes/schools")); 
const studentsRoutes = require(path.join(__dirname, "routes/students"));
const sponsorsRoutes = require(path.join(__dirname, "routes/sponsors"));
const donationsRoutes = require(path.join(__dirname, "routes/donations"));
const studentsDonationsRoutes = require(path.join(__dirname, "routes/studentsDonations"));
const studentsSponsorsRoutes = require(path.join(__dirname, "routes/studentsSponsors"));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, 'public/favicon.ico')));

app.set('view engine', 'pug');
app.set('port', PORT);
app.set('mysql', mysql);

app.get('/', (req, res) => {
	res.render('pages/home', {title: 'Chenrezig Fund Database'});
});

app.use('/schools', schoolsRoutes);
app.use('/students', studentsRoutes);
app.use('/sponsors', sponsorsRoutes);
app.use('/donations', donationsRoutes);
app.use('/studentsDonations', studentsDonationsRoutes);
app.use('/studentsSponsors', studentsSponsorsRoutes);

app.use((req,res) => {
	res.status(404);
	res.render('pages/404');
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500);
	res.render('pages/500');
});

app.listen(app.get('port'), () => {
	console.log(`Express started on http://localhost:${app.get('port')}; press Ctrl-C to terminate.`);
});
