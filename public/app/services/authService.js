angular.module('authService', [])

//================================================
// auth factory to login and get information
// inject $http for communicating with the API
// inject $q to return promise objects
// inject AuthToken to manage tokens
// ===============================================

    .factory('Auth', function ($http, q, AuthToken) {

        // create auth factory object
        var authFactory = {};

        //handle login
        authFactory.login = function (username, password) {

            // return the promise object and it's data
            return $http.post('/api/authenticate', {
                username: username,
                password: password
            })
                .success(function (data) {
                    AuthToken.setToken(data.token);
                    return data;
                });
        }


        //handle logout
        authFactory.logout = function () {

            //clear the token
            AuthToken.setToken();
        }

        //check if user is logged in
        // checks if there is a local token
        authFactory.isLoggedIn = function () {
            if (AuthToken.getToken())
                return true;
            else
                return false;
        }

        // get logged in the user info
        authFactory.getUser = function () {
            if (AuthToken.getToken()) {
                return $http.get('/api/me');
            } else {
                return $q.reject({message: 'User has no token'});
            }
        }

        // return auth factory object
        return authFactory;
    })

//=============================================
// factory for handling the tokens
// inject $window to store token client-side

    .factory('AuthToken', function ($window) {

        var authTokenFactory = {};

        // get the token out of local storage
        authTokenFactory.getToken = function () {
            return $window.localStorage.getItem('token');

        };

        // function to set token or clear token
        // if token is passes, set the token
        // if there is no token, clear it from local storage
        authTokenFactory.setToken = function (token) {
            if (token) {
                $window.localStorage.setItem('token', token);
            } else {
                $window.localStorage.removeItem('token');
            }

            return authTokenFactory;
        }


        return authTokenFactory;
    })

//=====================================
// application configuration to integrate the token into the requests
    .factory('AuthInterceptor', function ($q, $location, AuthToken) {

        var interceptorFactory = {};

        // attach the token to every request every time
        interceptorFactory.request = function (config) {

            //grab the token
            var token = AuthToken.getToken();

            // if the token exists, add it to the header as x-access-token
            if (token)
                config.headers['x-access-token'] = token;

            return config;

        }

        // happens in responce errors
        interceptorFactory.responseError = function (response) {

            // if the server returns a 403
            if (response.status == 403) {
                AuthToken.setToken();
                $location.path('/login');
            }

            //return the errors from the server as a promise
            return $q.reject(response);
        }

        //redirect if a token doesn't authenticate

        return interceptorFactory;

    });

