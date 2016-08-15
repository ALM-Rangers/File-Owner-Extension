//---------------------------------------------------------------------
// <copyright file="TFVCRawRestClient.ts">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary>This class is an object that makes raw rest api calls to vsts for 
//          member and user information
// </summary>
//---------------------------------------------------------------------
var UsersRawRestClient = (function () {
    //---------------------------------------------------------------------------
    // Constructor that instantiates a UsersRawRestClient object
    //---------------------------------------------------------------------------
    function UsersRawRestClient(webContext) {
        this.webContext = webContext;
    }
    //------------------------------------------------------------------------------
    // private method that checks if a user name is in a list of users
    //------------------------------------------------------------------------------
    UsersRawRestClient.prototype.userExistsInList = function (userList, uniqueName) {
        for (var i = 0; i < userList.length; i++) {
            if (uniqueName === userList[i].value) {
                return true;
            }
        }
        return false;
    };
    //--------------------------------------------------------------------------------
    // Private method given a list of teams will figure out all the users in the team
    // by async calling the VSTS raw rest api
    //--------------------------------------------------------------------------------
    UsersRawRestClient.prototype.getTeamMembers = function (teamList, userList, promise) {
        var self = this;
        if (teamList.length != 0) {
            var team = teamList.shift();
            // get all users in the team
            // get authentication token
            VSS.require(["VSS/Authentication/Services"], function (AuthenticationService) {
                var authTokenManager = AuthenticationService.authTokenManager;
                authTokenManager.getToken().then(function (token) {
                    var header = authTokenManager.getAuthorizationHeader(token);
                    // set up rest api authentication header
                    $.ajaxSetup({
                        headers: {
                            'Authorization': header
                        }
                    });
                    // build out rest api url
                    var getUserUrl = self.webContext.collection.uri +
                        "_apis/projects/" +
                        self.webContext.project.id +
                        "/teams/" +
                        team.id +
                        "/members/?api-version=1.0";
                    // rest call to get all teams for a path
                    $.ajax({
                        type: 'GET',
                        url: getUserUrl,
                        success: function (response) {
                            for (var i = 0; i < response.value.length; i++) {
                                if (!self.userExistsInList(userList, response.value[i].uniqueName)) {
                                    userList.push(new User("", response.value[i].uniqueName, response.value[i].displayName, response.value[i].imageUrl));
                                }
                            }
                            self.getTeamMembers(teamList, userList, promise);
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            //alert("Could not get all the work item types");
                        }
                    });
                });
            });
        }
        else {
            promise.resolve(userList);
        }
    };
    //------------------------------------------------------------------------------
    // public method that will asyncronously find all team members in a team project
    // by getting the teams in a team project, then iterating each user in the teams
    //------------------------------------------------------------------------------
    UsersRawRestClient.prototype.processTeamMembers = function () {
        var self = this;
        var result = $.Deferred();
        // get authentication token
        VSS.require(["VSS/Authentication/Services"], function (AuthenticationService) {
            var authTokenManager = AuthenticationService.authTokenManager;
            authTokenManager.getToken().then(function (token) {
                var header = authTokenManager.getAuthorizationHeader(token);
                // set up rest api authentication header
                $.ajaxSetup({
                    headers: {
                        'Authorization': header
                    }
                });
                // build out rest api url
                var getTeamUrl = self.webContext.collection.uri +
                    "_apis/projects/" +
                    self.webContext.project.id +
                    "/teams?api-version=1.0";
                // rest call to get all teams for a path
                $.ajax({
                    type: 'GET',
                    url: getTeamUrl,
                    success: function (response) {
                        self.teamsCount = response.value.length;
                        var userArray = [];
                        userArray.push(new User("Choose the current owner", "", "Unassigned &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;   ", ""));
                        self.getTeamMembers(response.value, userArray, result);
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        alert("Could not get all the teams");
                    }
                });
            });
        });
        return result.promise();
    };
    UsersRawRestClient.prototype.getUser = function (userId) {
        var self = this;
        var result = $.Deferred();
        // get authentication token
        VSS.require(["VSS/Authentication/Services"], function (AuthenticationService) {
            var authTokenManager = AuthenticationService.authTokenManager;
            authTokenManager.getToken().then(function (token) {
                var header = authTokenManager.getAuthorizationHeader(token);
                // set up rest api authentication header
                $.ajaxSetup({
                    headers: {
                        'Authorization': header
                    }
                });
                // build out rest api url
                var getUserUrl = "https://" +
                    self.webContext.account.name +
                    ".vssps.visualstudio.com/_apis/profile/profiles/" +
                    userId;
                // rest call to get all changesets for a path
                $.ajax({
                    type: 'GET',
                    url: getUserUrl,
                    success: function (response) {
                        result.resolve(response);
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        //alert("Could not get all the work item types");
                    }
                });
            });
        });
        return result.promise();
    };
    return UsersRawRestClient;
})();
//# sourceMappingURL=UsersRawRestClient.js.map