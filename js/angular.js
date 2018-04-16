//

/**
 *
 * This file contains all angularjs routing and logic for each page in angularjs controllers
 * by Myles Rankin 2017-18
 */
    // init angularjs app
var app = angular.module('app', ['ngRoute']);
/** Routing for the single page application **/

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'templates/main.html',
                controller: 'mainController'
            })
            .when('/register', {
                templateUrl: 'templates/register.html',
                controller: 'registerController'
            })
            .when('/screens', {
                templateUrl: 'templates/screens.html',
                controller: 'screenController'
            })
            .when('/screens/groups', {
                templateUrl: 'templates/screengroups.html',
                controller: 'screengroupsController'
            })
            .when('/screens/groups/:id', {
                templateUrl: 'templates/editscreengroup.html',
                controller: 'editscreengroupController'
            })
            .when('/screens/add', {
                templateUrl: 'templates/addscreen.html',
                controller: 'addscreenController'
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);

app.controller('mainController', function($scope, $route, $http) {

    $scope.username = localStorage.username
    // Footer:Info panel ajax requests
    $scope.$on('$viewContentLoaded', function () {


    });
    /*
    $http({
        url: "http://localhost:3000/echo",
        method: "POST",
        data: {
            "username": "test"
        }
    }).then(function successCallback(res) {
        console.log(res)
        }, function errorCallback(res){
            console.log(res)
        }) */
    // Login logic
    /** Login related user logic **/
    $(document).ready(function() { // When all DOM objects have been loaded
        if(localStorage.authtoken){
            hideLogin();
        }else{
            showLogin();
        }
        try{
            $(document).off('click', '#login-btn').on('click', '#login-btn', function() { // Login process when submit btn is pressed
                if($('#username-login')[0].value && $('#password-login')[0].value){
                    $http({
                        url: "http://localhost:3000/user/login",
                        method: "POST",
                        data: {
                            "username": $('#username-login')[0].value,
                            "password": $('#password-login')[0].value
                        }
                    }).then(function successCallback(res) {
                        alert(res.data.notification)
                        console.log(res.data)
                        localStorage.setItem("authtoken", res.data.authtoken);
                        localStorage.setItem("username", res.data.Username);
                        localStorage.setItem("userid", res.data.ID)
                        $('#username-login')[0].value = ''
                        $('#password-login')[0].value = ''
                        hideLogin()
                    }, function errorCallback(res){
                        alert(res.data)
                    })
                    /*
                    $.ajax({ // attempt login when password and username fields have been filled out
                        url: "http://localhost:3000/login",
                        type: 'POST',
                        data: {
                            username: $('#username-login')[0].value,
                            password: $('#password-login')[0].value
                        },
                        success: function(response){
                            // Recieve authentication token and set cookies in localStorage
                            var t = JSON.parse(response)
                            localStorage.setItem("authtoken", t.authtoken);
                            localStorage.setItem("username", t.username);
                            localStorage.setItem("userid", t.userid)
                            $('#username-login')[0].value = ''
                            $('#password-login')[0].value = ''
                            console.log(localStorage.authtoken);
                            hideLogin() // hide login box
                        },
                        error: function(response){
                            // reject if details provided do not match
                            alert("Invalid username or password");
                        }
                    });*/
                }else{ // validation reject if fields are empty
                    alert("Username or password is missing")
                }
                $scope.username = document.getElementById('username-login').value
                $scope.$apply();
            });
        }catch(err){
            console.log('Hiding login box')
        }

        // For logging out, listen if logout button is pressed
        $(document).off('click', '#logout').on('click', '#logout', function() {
            $http({
                url: "http://localhost:3000/user/logout",
                method: "DELETE",
                headers: {"authtoken":localStorage.authtoken},
                data: {
                    "authtoken": localStorage.authtoken
                }
            }).then(function successCallback(res) {
                // if success then clear localStorage of authtoken and other headers
                alert(res.data)
                localStorage.clear();
                window.location.href = "#/"; // redirect
                showLogin(); // show login form again
            }, function errorCallback(res){
                alert(res.data)
            })

        });

    });



})

app.controller('registerController', function($scope, $route, $http) {
    // when submit button is pressed attempt to register user
    $("#submit-reg")[0].addEventListener('click', function () {
        if ($("#password-confirmation")[0].value) { // client side validation
            if ($("#password-reg")[0].value === $("#password-confirmation")[0].value) { // Checks if confirmation is set
                $http({
                    url: "http://localhost:3000/user",
                    method: "POST",
                    data: {
                        "username": $("#username-reg")[0].value,
                        "password": $("#password-reg")[0].value,
                        "email": $("#email-reg")[0].value
                    }
                }).then(function successCallback(res) {
                    alert('Success! User created. Welcome, ' + $("#username-reg")[0].value)
                    $("#username-reg")[0].value = ''
                    $("#email-reg")[0].value = ''
                    $("#password-reg")[0].value = ''
                    $("#password-confirmation")[0].value = ''
                    window.location.href = "#/"
                    $route.reload();
                }, function errorCallback(res){
                    console.log(res)
                    alert(res.data)
                })
            } else {
                alert('Error: Passwords do not match')
            }
        } else {
            alert('Error: Confirmation password is missing')
        }
    });
})

app.controller('screenController', function($scope, $http, $interval){
    $scope.screenTitle = "Screen Management"

    $scope.refreshData = function(){
        $http({
            url: "http://localhost:3000/screens/user/"+localStorage.username,
            method: "GET",
        }).then(function successCallback(res) {
            // if success then clear localStorage of authtoken and other headers
            $scope.screens = res.data
            for(i=0; i<$scope.screens.length; i++){
                $scope.screenTitle = "Screen Management ("+$scope.screens[i].Owner+")"
                if((( (new Date()) - (new Date($scope.screens[i].Live)) )/1000)/60 > 0.125 ){
                    $scope.screens[i].class = "btn btn-danger btn-xs"
                    $scope.screens[i].Live = "Offline"
                }else{
                    $scope.screens[i].class = "btn btn-success btn-xs"
                    $scope.screens[i].Live = "Online"
                }
            }
            // show login form again
        }, function errorCallback(res){
            alert(res.data)
        })
    }
    $scope.refreshData()

    $interval(function(){
        $scope.refreshData()
    }, 5000)

})

app.controller('screengroupsController', function($scope, $http){
    $scope.screenTitle = "Screen Groups Management ("+localStorage.username+")"
    $http({
        url: "http://localhost:3000/screens/groups/user/"+localStorage.username,
        method: "GET",
    }).then(function successCallback(res) {
        // if success then clear localStorage of authtoken and other headers
        console.log(res.data)
        $scope.screengroups = res.data
        // show login form again
    }, function errorCallback(res){
        alert(res.data)
    })
})

app.controller('editscreengroupController', function($scope, $routeParams, $http){
    $http({
        url: "http://localhost:3000/useradverts/"+localStorage.username,
        method: "GET"
    }).then(function successCallback(res){
        // if success then clear localStorage of authtoken and other headers
        console.log(res.data)
        for(i=0;i<res.data.length;i++){
            res.data[i].Content = JSON.parse(res.data[i].Content)
        }
        $scope.adverts = res.data
        // show login form again
    }, function errorCallback(res){
        console.log(res)
    })

    $scope.save = function(){
        $scope.advertnames = [];
        angular.forEach($scope.adverts, function(advert){
            if (!!advert.Selected) $scope.advertnames.push(advert.ID);
        })
    }
    $scope.calculateChecked = function() {
        var count = 0;

        angular.forEach($scope.adverts, function(value) {
            if(value.checked)
                count++;
        });

        return count;
    };


    document.getElementById('test').addEventListener('click', function(){
        $scope.save()
        $scope.selectednumber = $scope.advertnames.length
        if($scope.advertnames.length<18){
            alert('Select more adverts! Only '+$scope.advertnames.length+'/18 selected')
        }else if($scope.advertnames.length>18){
            alert('Too many adverts selected! Please select only 18 (You selected '+$scope.advertnames.length+'/18')
        }else{
            $http({
                url: "http://localhost:3000/screen/groups/"+$routeParams.id,
                method: "PUT",
                headers: {"authtoken":localStorage.authtoken},
                data: {
                    "Adverts": "("+$scope.advertnames+")"
                }
            }).then(function successCallback(res){
                alert(res.data.status)
            }, function errorCallback(res){
                alert(res.data.status)
            })


        }
        console.log($scope.advertnames.join())
    })


})

app.controller('addscreenController', function($scope, $route, $http) {
    $http({
        url: "http://127.0.0.1:3000/screens/groups/user/"+localStorage.username,
        method: "GET"
    }).then(function successCallback(res){
        $scope.screenGroups = res.data
    }, function errorCallback(res){
        console.log(res.data)
    })
})

function mysqlTimeStampToDate(timestamp) {
    // https://dzone.com/articles/convert-mysql-datetime-js-date
    //function parses mysql datetime string and returns javascript Date object
    //input has to be in this format: 2007-06-05 15:26:02
    var regex=/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
    var parts=timestamp.replace(regex,"$1 $2 $3 $4 $5 $6").split(' ');
    return new Date(parts[0],parts[1]-1,parts[2],parts[3],parts[4],parts[5]);
}

function hideLogin(){
    var v = localStorage.username
    var temp = "<div class='col-md-8 col-md-offset-4' id='reg' style='margin-top: 50px;text-align:right;'> Welcome, " + v + " </div>";
    document.getElementById('welcomeboxContent').innerHTML = temp;
    document.getElementById('welcomebox').style.display = "block";
    document.getElementById('account_options').style.display = "block";
    document.getElementById('loginbox').style.display = "none";
};

function showLogin(){
    document.getElementById('loginbox').style.display = "block";
    document.getElementById('welcomebox').style.display = "none";
    document.getElementById('account_options').style.display = "none";
};