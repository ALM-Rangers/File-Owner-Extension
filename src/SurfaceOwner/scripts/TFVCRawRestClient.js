define(["require", "exports"], function (require, exports) {
    //---------------------------------------------------------------------
    // <copyright file="TFVCManager.ts">
    //    This code is licensed under the MIT License.
    //    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
    //    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
    //    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
    //    PARTICULAR PURPOSE AND NONINFRINGEMENT.
    // </copyright>
    // <summary>This class has raw tfvc rest client calls to get all changesets
    // for a tfvc file
    // </summary>
    //---------------------------------------------------------------------
    var TFVCRawRestClient = (function () {
        function TFVCRawRestClient(webContext) {
            this.webContext = webContext;
        }
        TFVCRawRestClient.prototype.getChangesets = function (path) {
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
                    var getUserUrl = self.webContext.collection.uri + "_apis/tfvc/changesets?maxCommentLength=10000&searchCriteria.itemPath="
                        + path + "&api-version=1.0";
                    // rest call to get all changesets for a path
                    $.ajax({
                        type: 'GET',
                        url: getUserUrl,
                        success: function (response) {
                            result.resolve(response.value);
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            //alert("Could not get all the work item types");
                        }
                    });
                });
            });
            return result.promise();
        };
        return TFVCRawRestClient;
    })();
    exports.TFVCRawRestClient = TFVCRawRestClient;
});
//# sourceMappingURL=TFVCRawRestClient.js.map