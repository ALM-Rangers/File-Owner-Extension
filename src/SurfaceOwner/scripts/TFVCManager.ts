//---------------------------------------------------------------------
 // <copyright file="TFVCManager.ts">
 //    This code is licensed under the MIT License.
 //    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
 //    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
 //    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
 //    PARTICULAR PURPOSE AND NONINFRINGEMENT.
 // </copyright>
 // <summary>This class Is the VC manager used to calculate all the file
 //          owner information for the TFVC version control in VSTS
 // </summary>
 //---------------------------------------------------------------------
import TFVCRawRestClient = require("Scripts/TFVCRawRestClient");

export class TFVCManager implements IVCManager {
    private dateOption = {
        weekday: "long", year: "numeric", month: "short",
        day: "numeric", hour: "2-digit", minute: "2-digit"
    };
    

    //----------------------------------------------------
    // Instantiates a TFVC Manager object
    //----------------------------------------------------
    constructor(public webContext: WebContext) {
        
    }

    private findLatestReviewedAsync(key, counter: number, changesets) {
        var self = this;

        if (changesets.length !== counter) {
            // pop off first
            var latestChangeset = changesets[counter++];
            VSS.require(["VSS/Service", "TFS/VersionControl/TfvcRestClient", "TFS/VersionControl/Contracts"], (Service, RestClient, Contracts) => {
                // get the tfvc rest client and get the work items associated with the changeset
                var tfvcClient = Service.getClient(RestClient.TfvcHttpClient);
                tfvcClient.getChangesetWorkItems(latestChangeset.changesetId).then(function (associatedWorkItems) {
                    // look for Code Review Request work items
                    var workItem;
                    var foundReview;
                    for (var i = 0; i < associatedWorkItems.length; i++) {
                        workItem = associatedWorkItems[i];
                        if (workItem.workItemType === "Code Review Request") {
                            foundReview = true;
                            break;
                        }
                    }

                    // found review
                    if (foundReview) {
                        // get history for work item
                        VSS.require("TFS/WorkItemTracking/RestClient", function (WitRestClient) {
                            var client = WitRestClient.getClient();
                            client.getHistory(workItem.id).then(function (historyList) {
                                // get the last history item and see who did it
                                var lastHistory = historyList[historyList.length - 1];
                                var rawClient = new UsersRawRestClient(self.webContext);
                                rawClient.getUser(lastHistory.revisedBy.id).then(function (user) {
                                    var reviewer: any = {};
                                    reviewer.displayName =  user.displayName;
                                    reviewer.emailAddress = user.emailAddress;
                                    // need to find reviewer image url
                                    self.getUserImageUrl(lastHistory.revisedBy.id).then(function (imageUrl) {
                                        reviewer.imageUrl = imageUrl;
                                       
                                        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (dataService: any) {
                                            // persist in project store scoped across the collection
                                            dataService.setValue(key, reviewer).then(function (value) {
                                                console.log("key value is " + value);
                                            });
                                        });
                                    });

                                });

                            });
                        });

                    }
                    // did not find review, go to next changeset
                    else {
                        self.findLatestReviewedAsync(key, counter,changesets);
                    }
                });


            });
        }
    }

    //---------------------------------------------------------------
    // Based on a list of all the changeset, this method finds the latest reviewd 
    //---------------------------------------------------------------
    private findLatestReviewed(path: string, changesets, processObj: ProcessFileValues, promise) {
        var self = this;

        // see if there is a tfvc reviewer already set
        var key = "review"+path;
        key = key.replace(/\//g, "_");
        key = key.replace(/\./g, "_");
        var hasher = new MD5Hasher();
        key = hasher.Hash(key);
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (dataService: any) {
            // Get value in user scope
            dataService.getValue(key).then(function (value: any) {
                if ((value !== undefined) && (value !== null)) {
                    processObj.hasReviewer = true;
                    processObj.reviewedName = value.displayName;
                    processObj.reviewedEmail = value.emailAddress;
                    processObj.reviewedImageUrl = value.imageUrl;
                    
                }
                else {
                    processObj.hasReviewer = false;
                }
                promise.resolve(processObj);
            });
        });
        
        self.findLatestReviewedAsync(key, 0, changesets);
        
    }

    //------------------------------------------------------------------------
    // Private method that asynchronously uses the VSTS rest api to get 
    // the image url of a user
    //------------------------------------------------------------------------
    private getUserImageUrl(userId: string): IPromise<string> {
        var result = $.Deferred<string>();
        var self = this;

        VSS.require("TFS/Core/RestClient", function (CoreRestClient) {
            var client = CoreRestClient.getClient();
            client.getTeamMembers(self.webContext.project.id, self.webContext.team.id, undefined, undefined).then(function (teamMembers) {
                var imageUrl = "/images/logo_small.png";
                for (var i = 0; i < teamMembers.length; i++) {
                    if (userId === teamMembers[i].id) {
                        imageUrl = teamMembers[i].imageUrl;
                        break;
                    }
                }

                result.resolve(imageUrl);

            });


        });
        return result.promise();
    }


    //------------------------------------------------------------------------
    // Public method that calculates all the owners given the path to a file
    //------------------------------------------------------------------------
    public calculateOwners(path: string, parentFolder: string): IPromise<ProcessFileValues> {
        var self = this;

        
 //TEST CODE BEGIN
        //var tfvcRawRestClient = new TFVCRawRestClient.TFVCRawRestClient(this.webContext);
        //tfvcRawRestClient.getChangesets(path).then((changesets) => {
        //    alert("Got here");
        //});

//TEST CODE END

        var result = $.Deferred<ProcessFileValues>();

        VSS.require(["VSS/Service", "TFS/VersionControl/TfvcRestClient", "TFS/VersionControl/Contracts"], (Service, RestClient, Contracts) => {
            // get the tfvc rest client
            var tfvcClient = Service.getClient(RestClient.TfvcHttpClient);
            
            // get changesets for this item
            var searchCriteria: any = {};
            searchCriteria.itemPath = path;

//            tfvcClient.getChangesets(self.webContext.project.name, undefined, true, true, undefined, true, undefined, undefined, undefined, searchCriteria).then(
//                (changesetRefs) => {

            var tfvcRawRestClient = new TFVCRawRestClient.TFVCRawRestClient(this.webContext);
            tfvcRawRestClient.getChangesets(path).then((changesetRefs) => {
                    var processObj = new ProcessFileValues();
                    
                    // get latest changeset
                    var latestChangeset = changesetRefs[0];
                    var rawRestClient = new UsersRawRestClient(self.webContext);
                    rawRestClient.getUser(latestChangeset.author.id).then(function (user) {
                        processObj.latestName = latestChangeset.author.displayName;
                        processObj.latestImageUrl = latestChangeset.author.imageUrl;
                        processObj.latestEmail = user.emailAddress;
                        processObj.latestChangesetId = latestChangeset.changesetId;
                        processObj.latestChangesetComment = latestChangeset.comment;
                        processObj.latestChangesetUrl = latestChangeset.url;
                        // processObj.latestDate = latestChangeset.createdDate.toLocaleTimeString("en-us", self.dateOption);
                        processObj.latestDate = (new Date(latestChangeset.createdDate)).toLocaleTimeString("en-us", self.dateOption);
                        processObj.lastModifiedByChangesetUrl = self.webContext.collection.uri + self.webContext.project.name + "/_versionControl/changeset/" + latestChangeset.changesetId;

                        // get first changeset
                        var firstChangeset = changesetRefs[changesetRefs.length - 1];
                        rawRestClient.getUser(firstChangeset.author.id).then(function (user) {
                            processObj.firstName = firstChangeset.author.displayName;
                            processObj.firstImageUrl = firstChangeset.author.imageUrl;
                            processObj.firstEmail = user.emailAddress;
                            processObj.firstChangesetId = firstChangeset.changesetId;
                            processObj.firstChangesetComment = firstChangeset.comment;
                            processObj.firstChangesetUrl = firstChangeset.url;
                            //processObj.firstDate = firstChangeset.createdDate.toLocaleTimeString("en-us", self.dateOption);
                            processObj.firstDate = (new Date(firstChangeset.createdDate)).toLocaleTimeString("en-us", self.dateOption);
                            processObj.createdByChangesetUrl = self.webContext.collection.uri + self.webContext.project.name + "/_versionControl/changeset/" + firstChangeset.changesetId;

                            //get most contributed
                            var totalList = new OwnerTotalList(self.webContext);
                            for (var i = 0; i < changesetRefs.length; i++) {
                                totalList.addUser(changesetRefs[i].author.displayName, changesetRefs[i].author.id, changesetRefs[i].author.imageUrl);
                            }
                            totalList.getMostContributionOwner().then(function (mostContributed) {
                                processObj.mostContributedName = mostContributed.name;
                                processObj.mostContributedEmail = mostContributed.email;
                                processObj.mostContributedImageUrl = mostContributed.imageUrl;

                                // get parent most contributed
                                searchCriteria.itemPath = parentFolder;
                                //tfvcClient.getChangesets(undefined, undefined, true, true, undefined, undefined, undefined, undefined, undefined, searchCriteria).then(
                                //    function (parentChanges) {
                                tfvcRawRestClient.getChangesets(parentFolder)
                                    .then((parentChanges) => {
                                        var parentList = new OwnerTotalList(self.webContext);
                                        for (var i = 0; i < parentChanges.length; i++) {
                                            parentList.addUser(parentChanges[i].author.displayName, parentChanges[i].author.id, parentChanges[i].author.imageUrl);
                                        }

                                        parentList.getMostContributionOwner().then(function (mostContributedParent) {
                                            processObj.mostContributedParentName = mostContributedParent.name;
                                            processObj.mostContributedParentEmail = mostContributedParent.email;
                                            processObj.mostContributedParentImageUrl = mostContributedParent.imageUrl;

                                            // get latest reviewed
                                            self.findLatestReviewed(path, changesetRefs, processObj, result);
                                        });
                                    }
                                );
                            });
                        });
                    });
                }
            );
        });
            
        return result.promise();
    }

    //----------------------------------------------------------------
    // Async method that downloads a file using the VSTS REST api and 
    // calculates the file length
    //----------------------------------------------------------------
    public calculateFileLength(path: string): IPromise<string> {
        var self = this;
        var result = $.Deferred<string>();

        VSS.require(["VSS/Service", "TFS/VersionControl/TfvcRestClient", "TFS/VersionControl/Contracts"], (Service, RestClient, Contracts) => {
            var gitClient = RestClient.getClient();
            gitClient.getItemContent(path, undefined, undefined, true, undefined, undefined, undefined).then((arrayBuffer) => {
                var sizeInBytes = arrayBuffer.byteLength;
                var sizeInKB = (sizeInBytes / 1024.0).toFixed(2);
                result.resolve(sizeInKB);
            });

        });

        return result.promise();
    }
    
}