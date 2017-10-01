//---------------------------------------------------------------------
// <copyright file="GitVCManager.ts">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary>This class is a library functional object used to calculate the user
//          that contributed most to a file for the git repo
// </summary>
//---------------------------------------------------------------------
var OwnerTotalListGit = (function () {
    //------------------------------------------------------------------------
    // This constructor instantiates an OwnerTotalListGit object
    //------------------------------------------------------------------------
    function OwnerTotalListGit(webContext, actionContext) {
        this.webContext = webContext;
        this.actionContext = actionContext;
        this.ownerList = {};
    }
    //----------------------------------------------------------------------------
    // This public method adds a user who has touched the file
    //--------------------------------------------------------------------------
    OwnerTotalListGit.prototype.addUser = function (name, commitId, email) {
        var self = this;
        if (!(name in self.ownerList)) {
            self.ownerList[name] = new Owner(name, commitId, email, 0, null);
        }
        self.ownerList[name].contributions = self.ownerList[name].contributions + 1;
    };
    //------------------------------------------------------------------------------
    // This public method calculates who is the owner that contributed the most to 
    // the file.  It then asynchronously returns the user information
    //------------------------------------------------------------------------------
    OwnerTotalListGit.prototype.getMostContributionOwner = function () {
        var self = this;
        var result = $.Deferred();
        var curr;
        var most = undefined;
        for (var key in self.ownerList) {
            curr = self.ownerList[key];
            if (most === undefined) {
                most = curr;
            }
            else if (curr.contributions > most.contributions) {
                most = curr;
            }
        }
        VSS.require(["VSS/Service", "TFS/VersionControl/GitRestClient", "TFS/VersionControl/Contracts"], function (Service, RestClient, Contracts) {
            var gitClient = RestClient.getClient();
            gitClient.getCommit(most.id, self.actionContext.gitRepository.id, undefined, undefined).then(function (gitCommit) {
                most.imageUrl = gitCommit.push.pushedBy.imageUrl;
                result.resolve(most);
            });
        });
        return result.promise();
    };
    return OwnerTotalListGit;
}());
//# sourceMappingURL=OwnerTotalListGit.js.map