//---------------------------------------------------------------------
// <copyright file="TFVCManager.ts">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary>This class is used to calculate the owner of a file that contributed
// most to a file
// </summary>
//---------------------------------------------------------------------//-------------------------------------------------------------------------
var OwnerTotalList = (function () {
    //---------------------------------------------------
    // Constructor that creates a OwnerTotalList object
    //---------------------------------------------------
    function OwnerTotalList(webContext) {
        this.ownerList = {};
        this.webContext = webContext;
    }
    //-------------------------------------------------------------
    // this method adds a new user who has updated the file
    //-------------------------------------------------------------
    OwnerTotalList.prototype.addUser = function (name, id, imageUrl) {
        var self = this;
        if (!(name in self.ownerList)) {
            self.ownerList[name] = new Owner(name, id, null, 0, imageUrl);
        }
        self.ownerList[name].contributions = self.ownerList[name].contributions + 1;
    };
    //-------------------------------------------------------------
    // This method asynchronously gets the owner that contributed
    // the most to a file
    //-------------------------------------------------------------
    OwnerTotalList.prototype.getMostContributionOwner = function () {
        var result = $.Deferred();
        var self = this;
        var most = undefined;
        var curr;
        for (var key in self.ownerList) {
            curr = self.ownerList[key];
            if (most === undefined) {
                most = curr;
            }
            else if (curr.contributions > most.contributions) {
                most = curr;
            }
        }
        var rawRestClient = new UsersRawRestClient(self.webContext);
        rawRestClient.getUser(most.id).then(function (user) {
            most.email = user.emailAddress;
            result.resolve(most);
        });
        return result.promise();
    };
    return OwnerTotalList;
}());
//# sourceMappingURL=OwnerTotalList.js.map