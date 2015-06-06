var User = require('../models/user');
var jwt = require('jsonwebtoken');
var config = require('../../config');

//super secret for creating tokens
var superSecret = config.secret;

module.exports = function (app, express) {

    var apiRouter = express.Router();

    //route to authenticate a user (POST)
    apiRouter.post('/authenticate', function (req, res) {
        console.log(req.body.username);

        // find the user
        // select the password explicitly since mongoose is not returning it by default
        User.findOne({
            username: req.body.username
        }).select('password').exec(function (err, user) {
            if (err) throw err;

            // no user with that username was found

            if (!user) {
                res.json({
                    success: false,
                    message: 'Authentication failed. User not found.'
                });
            } else if (user) {
                // check if the password matches
                var validPassword = user.comparePassword(req.body.password);
                if (!validPassword) {
                    res.json({
                        success: false,
                        message: 'Authentication failed. Incorect password.'
                    });
                } else {
                    // if user is found and the password matches
                    // create a token
                    var token = jwt.sign(user, superSecret, {expiresInMinutes: 1400});
                    res.json({
                        success: true,
                        messahe: 'Here comes Token!',
                        token: token
                    });
                }
            }
        });
    });

    //route middleware to verify token
    apiRouter.use(function (req, res, next) {

        //do logging
        console.log('Hey, someone came to the app!');

        //check header or url parameters or post parameters for the token
        var token = req.body.token || req.param('token') || req.headers['x-access-token'];

        //decode the token
        if (token) {

            //verify the secret and chech the expiration
            jtw.verify(token, superSecret, function (err, decoded) {
                if (err) {
                    return res.json({
                        success: false,
                        message: 'Failed to authenticate token.'
                    });
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;

                    next(); // continue to the next middleware
                }
            });
        } else {
            // if there is no token
            // return a 403 and an error message
            return res.status(403).send({
                success: false,
                message: ' No token provided'
            });
        }
    });

    //test the route to make sure everything is working
    // acced at GET http://localhost:8080/api
    apiRouter.get('/', function (req, res) {
        res.json({
            message: 'Huray! API is online!'
        });
    });

    // on routes that end in /users
    //------------------------------------------------

    apiRouter.route('/users')

        // create a user (accessed at POST http://localhost:8080/users
        .post(function (req, res) {
            var users = new User(); // create a new user from the User model
            user.name = req.body.name; //set the user's name (comes from the request)
            user.username = req.body.username; // set the user's username (comes from the request)
            user.password = req.body.password; // set the user's password (comes from the request)

            user.save(function (err) {
                if (err) {
                    // duplicate entry
                    if (err.code == 11000)
                        return res.json({
                            success: false, message: 'A user with that username already exists. '
                        });
                    else
                        return res.send(err);
                }

                //return a message
                res.json({message: 'User Created!'});
            });
        })

        // get all the users (accessed at GET http://localhost:8080/api/users

        .get(function (req, res) {
            User.find(function (err, users) {
                if (err) res.send(err);

                //return the users
                res.json(users);
            });
        });

    // on routes that end in users/:user_id
    apiRouter.route('/users/:user_id')

        //get the user with that id
        .get(function (req, res) {
            User.findById(req.params.user_id, function (err, user) {
                if (err) res.send(err);

                //return the user
                res.json(user);
            });
        })

        // update the user with this id
        .put(function (req, res) {
            User.findByTheId(req.params.user_id, function (err, user) {
                if (err) res.send(err);

                // set the new user information if it exists in the request

                if (req.body.name) user.name = req.body.name;
                if (req.body.username) user.username = req.body.username;
                if (req.body.password) user.password = req.body.password;

                //save the user
                user.save(function (err) {
                    if (err) res.send(err);

                    // return a message
                    res.json({message: 'User information has been updated'});
                });
            });
        })

        // delete the user with this id
        .delete(function (req, res) {
            User.remove({
                    _id: req.params.user_id
                },
                function (err, user) {
                    if (err) res.send(err);
                    res.json({message: 'User has been succesfully deleted'});
                });
        });

    return apiRouter;

};