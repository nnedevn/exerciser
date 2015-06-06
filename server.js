// BASE SETUP 
// ================

// CALL THE PACKAGES
var express = require('express'); // call express
var app = express(); //define the app using express
var bodyParser = require('body-parser'); //get the body-parser
var morgan = require('morgan'); // used to see requests
var mongoose = require('mongoose'); // for working with the database
var port = process.env.PORT || 8080; // set the port for the app
var config = require('./config');
var jwt = require('jsonwebtoken'); //for authentication
var path = require('path');
// APP CONFIGURATION =========================

// use the body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// configure the app to handle CORS requests
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET', 'POST');
    res.setHeader('Accedd-Control-Allow-Headers', 'X-Requiested-With, content-type,  Authorization');
    next();
});

// log all requests to the console !!DEV!!
app.use(morgan('dev'));

// DEV connect to the database (in this case located on localhost:27017)
mongoose.connect(config.database);

// set static files location
app.use(express.static(__dirname + '/public'));


// ROUTES FOR THE API
//=============================================================
var apiRoutes = require('./app/routes/api')(app, express);

app.use('/api', apiRoutes);

//MAIN CATCHALL ROUTE
// SEND USERS TO THE FRONTEND---------------
// has to be registered after API ROUTES
app.get('*', function (res, req) {
    req.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});


// START THE SERVER
//======================================
app.listen(port);
console.log('Magic port is ' + port);
