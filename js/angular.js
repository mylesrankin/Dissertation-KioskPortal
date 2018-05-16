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
            .when('/screens/groups/edit/:id', {
                templateUrl: 'templates/editscreengroup.html',
                controller: 'editscreengroupController'
            })
            .when('/screens/groups/del/:id', {
                templateUrl: 'templates/deletescreengroup.html',
                controller: 'deletescreengroupController'
            })
            .when('/screens/add', {
                templateUrl: 'templates/addscreen.html',
                controller: 'addscreenController'
            })
            .when('/advert/edit/:id', {
                templateUrl: 'templates/editadvert.html',
                controller: 'editadvertController'
            })
            .when('/advert/add', {
                templateUrl: 'templates/addadvert.html',
                controller: 'addadvertController'
            })
            .when('/adverts', {
                templateUrl: 'templates/adverts.html',
                controller: 'advertsController'
            })
            .when('/advert/responses/:id', {
                templateUrl: 'templates/responses.html',
                controller: 'viewresponsesController'
            })
            .when('/advert/del/:id', {
                templateUrl: 'templates/deleteadvert.html',
                controller: 'deleteadvertController'
            })
            .when('/screens/group/add', {
                templateUrl: 'templates/addscreengroup.html',
                controller: 'addscreengroupController'
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);

/** Global Controller ~ On all pages**/
app.controller('mainController', function($scope, $route, $http) {
    $scope.username = localStorage.username
    // Footer:Info panel ajax requests
    $scope.$on('$viewContentLoaded', function () {
    });
    // Login logic
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
/** Contains all logic for registration page **/
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
/** Contains all screen logic **/
app.controller('screenController', function($scope, $http, $interval, $route){
    $scope.screenTitle = "Screen Management"
    $scope.refreshData = function(){ // Refreshes screen data
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
        $scope.refreshData() // Refresh screen data every 5 seconds for live status view
    }, 5000)
    // Delete screen
    $scope.deauth = function(hid){
        if(confirm('Are you sure you want to delete this screen?')) {
            $http({
                url: "http://127.0.0.1:3000/screen/" + hid,
                method: "DELETE",
                headers: {
                    "authtoken": localStorage.authtoken,
                    "username": localStorage.username
                }
            }).then(function successCallback(res) {
                alert(res.data.status)
                window.location.href = "#/screens"
                $route.reload()
            }, function errorCallback(res) {
                console.log(res.data.status)
            })
        }
    }

})
/** Logic for screen groups page **/
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
/** Logic for editing screen groups **/
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
/** logic for adding a new screen **/
app.controller('addscreenController', function($scope, $route, $http) {
    $http({
        url: "http://127.0.0.1:3000/screens/groups/user/"+localStorage.username,
        method: "GET"
    }).then(function successCallback(res){
        $scope.screenGroups = res.data
    }, function errorCallback(res){
        console.log(res.data)
    })

    $http({
        url: "http://127.0.0.1:3000/screen/tokens/user/"+localStorage.username,
        headers: {"authtoken":localStorage.authtoken},
        method: "GET"
    }).then(function successCallback(res){
        $scope.screenTokens = res.data
    }, function errorCallback(res){
        console.log(res.data)
    })

    document.getElementById('gen-token-btn').addEventListener('click', function(){
        console.log(document.getElementById('sg-select').value)
        var token = (document.getElementById('token-p1').value)+ "-" +(document.getElementById('token-p2').value)+ "-" +(document.getElementById('token-p3').value)
        if((document.getElementById('token-p1').value.length)+(document.getElementById('token-p2').value.length)+(document.getElementById('token-p3').value.length)<9){
            alert("Error: Please fill out the token boxes fully! (3 characters each box, 9 total)")
        }else{
            $http({
                url: "http://localhost:3000/screen/token/",
                method: "POST",
                headers: {"authtoken":localStorage.authtoken},
                data: {
                    "Token": token,
                    "Screen_Group": document.getElementById('sg-select').value,
                    "Owner": localStorage.username
                }
            }).then(function successCallback(res){
                alert(res.data.status)
                $route.reload()
            }, function errorCallback(res){
                alert(res.data.status)
            })
        }
    })

    $scope.deleteToken = function(token){
        $http({
            url: "http://127.0.0.1:3000/screen/token/"+token,
            method: "DELETE",
            headers: {
                "authtoken":localStorage.authtoken,
                "username": localStorage.username
            }
        }).then(function successCallback(res){
            alert(res.data.status)
            $route.reload()
        }, function errorCallback(res){
            console.log(res.data.status)
        })
    }
})
/** Logic for adverts page **/
app.controller('advertsController', function($scope, $route, $http, $interval) {
    $scope.screenTitle = "Advert Management ("+localStorage.username+")"

    $scope.refreshData = function(){
        $http({
            url: "http://localhost:3000/useradverts/"+localStorage.username,
            method: "GET",
        }).then(function successCallback(res) {
            // if success then clear localStorage of authtoken and other headers
            for(i=0;i<res.data.length;i++){
                res.data[i].Content = JSON.parse(res.data[i].Content)
            }
            $scope.adverts = res.data
        }, function errorCallback(res){
        })
    }
    $scope.refreshData()

    $interval(function(){
        $scope.refreshData()
    }, 5000)

})
/** Logic for editing an advert **/
app.controller('editadvertController', function($scope, $route, $http, $routeParams) {
    $scope.screenTitle = "Editing Advert ID:'"+$routeParams.id+"'"
    $scope.refreshData = function(){
        $http({
            url: "http://127.0.0.1:3000/screen/advert/"+$routeParams.id,
            method: "GET",
            headers: {
                "authtoken":localStorage.authtoken,
                "username":localStorage.username,
            }
        }).then(function successCallback(res) {
            // if success then clear localStorage of authtoken and other headers
            for(i=0;i<res.data.length;i++){
                res.data[i].Content = JSON.parse(res.data[i].Content)
            }
            $scope.advert = res.data[0]
            console.log($scope.advert)
        }, function errorCallback(res){
            console.log(res.data)
            alert(res.data)
        })
    }
    $scope.refreshData()

    document.getElementById("edit-submit").addEventListener('click', function(){
        console.log($scope.advert)
        $http({
            url: "http://localhost:3000/screen/adverts/"+$scope.advert.ID,
            method: "PUT",
            headers: {
                "authtoken":localStorage.authtoken,
                "username":localStorage.username,
            },
            data: $scope.advert
        }).then(function successCallback(res) {
            alert("Success! Advert updated")
        }, function errorCallback(res){
            alert(res.data)
            })

    })
})
/** Logic for adding an advert **/
app.controller('addadvertController', function($scope, $route, $http) {
    console.log('test')
    $scope.screenTitle = "Create an Advert"
    $scope.advert = {}
    console.log($scope.advert)
    document.getElementById("edit-submit").addEventListener('click', function(){
        console.log($scope.advert)
        $http({
            url: "http://localhost:3000/screen/adverts/",
            method: "POST",
            headers: {
                "authtoken":localStorage.authtoken,
                "username":localStorage.username,
            },
            data: $scope.advert
        }).then(function successCallback(res) {
            alert("Success! Advert created")
            window.location.href = "#/adverts"
            $route.reload();
        }, function errorCallback(res){
            alert(res.data)
        })
    })
})
/** Logic for viewing responses pages **/
app.controller('viewresponsesController', function($scope, $route, $http, $routeParams){
    $scope.screenTitle = "Viewing Responses for advert id:'"+$routeParams.id+"'"
    $scope.refreshData = function(){
        $http({
            url: "http://127.0.0.1:3000/responses/"+$routeParams.id,
            method: "GET",
            headers: {
                "authtoken":localStorage.authtoken,
                "username":localStorage.username,
            }
        }).then(function successCallback(res) {
            console.log(res)
            // if success then clear localStorage of authtoken and other headers
            console.log($scope.responses)
            $scope.responses = res.data
        }, function errorCallback(res){
            console.log(res.data)
            alert(res.data)
        })
    }
    $scope.refreshData()
})
/** Logic for the deletion of adverts **/
app.controller('deleteadvertController', function($scope, $route, $http, $routeParams) {
    $scope.screenTitle = "Deleting Advert ID:'"+$routeParams.id+"'"
    $scope.advertid = $routeParams.id
    document.getElementById("del-advert").addEventListener('click', function(){
        console.log($scope.advert)
        $http({
            url: "http://localhost:3000/screen/adverts/"+$routeParams.id,
            method: "DELETE",
            headers: {
                "authtoken":localStorage.authtoken,
                "username":localStorage.username,
            }
        }).then(function successCallback(res) {
            // if success then clear localStorage of authtoken and other headers
            alert(res.data.status)
            window.location.href = "#/adverts"
            $route.reload();
        }, function errorCallback(res){
            alert(res.data.status)
            window.location.href = "#/adverts"
            $route.reload();
        })

    })
    document.getElementById("cancel").addEventListener('click', function() {
        window.location.href = "#/adverts"
        $route.reload();
    })
})
/** Logic for the deletion of screen groups **/
app.controller('deletescreengroupController', function($scope, $route, $http, $routeParams) {
    $scope.screenTitle = "Deleting Screen Group ID:'"+$routeParams.id+"'"
    $scope.sgid = $routeParams.id
    document.getElementById("del-sg").addEventListener('click', function(){
        console.log($scope.advert)
        $http({
            url: "http://localhost:3000/screen/groups/"+$routeParams.id,
            method: "DELETE",
            headers: {
                "authtoken":localStorage.authtoken,
                "username":localStorage.username
            }
        }).then(function successCallback(res) {
            // if success then clear localStorage of authtoken and other headers
            alert(res.data.status)
            window.location.href = "#/screens/groups"
            $route.reload();
        }, function errorCallback(res){
            alert(res.data.status)
            window.location.href = "#/screens/groups"
            $route.reload();
        })

    })
    document.getElementById("cancel").addEventListener('click', function() {
        window.location.href = "#/adverts"
        $route.reload();
    })
})
/** Logic for adding screen groups **/
app.controller('addscreengroupController', function($scope, $route, $http, $routeParams) {
    var sgname = document.getElementById("sg-name")
    document.getElementById("create-sg-btn").addEventListener('click', function(){
        if(sgname.value){
            $http({
                url: "http://localhost:3000/screen/groups/",
                method: "POST",
                headers: {"authtoken":localStorage.authtoken},
                data: {
                    "Name": sgname.value,
                    "Owners": localStorage.username
                }
            }).then(function successCallback(res){
                alert(res.data.status)
                window.location.href = "#/screens/groups"
                $route.reload()
            }, function errorCallback(res){
                alert(res.data.status)
            })
        }else{
            alert("Screen Group name cannot be empty!")
        }
    })

})


function mysqlTimeStampToDate(timestamp) {
    /* Code snipped from: https://dzone.com/articles/convert-mysql-datetime-js-date All credit to author */
    // function parses mysql datetime string and returns javascript Date object
    //input has to be in this format: 2007-06-05 15:26:02
    var regex=/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
    var parts=timestamp.replace(regex,"$1 $2 $3 $4 $5 $6").split(' ');
    return new Date(parts[0],parts[1]-1,parts[2],parts[3],parts[4],parts[5]);
}

// Hides login box
function hideLogin(){
    var v = localStorage.username
    var temp = "<div class='col-md-8 col-md-offset-4' id='reg' style='margin-top: 50px;text-align:right;'> Welcome, " + v + " </div>";
    document.getElementById('welcomeboxContent').innerHTML = temp;
    document.getElementById('welcomebox').style.display = "block";
    document.getElementById('account_options').style.display = "block";
    document.getElementById('loginbox').style.display = "none";
};
// Shows login box
function showLogin(){
    document.getElementById('loginbox').style.display = "block";
    document.getElementById('welcomebox').style.display = "none";
    document.getElementById('account_options').style.display = "none";
};