define(["require", "exports"], function (require, exports) {
    var GitVCManager = (function () {
        //-----------------------------------------------------------------------------
        // Constructor which creates a GitVCManager object
        //-----------------------------------------------------------------------------
        function GitVCManager(webContext, actionContext, telemetryClient) {
            this.webContext = webContext;
            this.actionContext = actionContext;
            this.telemetryClient = telemetryClient;
            this.dateOption = {
                weekday: "long", year: "numeric", month: "short",
                day: "numeric", hour: "2-digit", minute: "2-digit"
            };
        }
        //-----------------------------------------------------------------------------
        // Private method that asynchronously gets the latest reviewed object and then 
        // gets the reviewer information
        //-----------------------------------------------------------------------------
        GitVCManager.prototype.findLatestReviewed = function (processObj, commits) {
            var self = this;
            var result = $.Deferred();
            VSS.require(["VSS/Service", "TFS/VersionControl/GitRestClient", "TFS/VersionControl/Contracts"], function (Service, RestClient, Contracts) {
                var gitClient = RestClient.getClient();
                // get all pull requests for this branch of code
                var searchCriteria = {
                    includeLinks: true,
                    repositoryId: self.actionContext.gitRepository.id,
                    status: "Completed"
                };
                gitClient.getPullRequests(self.actionContext.gitRepository.id, searchCriteria, undefined, undefined, undefined, undefined).then(function (pullRequests) {
                    // create search criteria for all commits for file
                    var commitsSearchCriteria = {
                        itemPath: self.actionContext.item.path
                    };
                    //gitClient.getCommits(self.actionContext.gitRepository.id, commitsSearchCriteria, undefined, undefined, undefined).then((commits) => {
                    // initialize variables used to find reviewer
                    var pullRequest = null;
                    var pullRequestId = null;
                    var reviewer = null;
                    var reviewerImageUrl = null;
                    var reviewerEmail = null;
                    var lastMergeSourceCommitId = null;
                    var foundFile = false;
                    // loop through all pull request
                    for (var i = 0; i < pullRequests.length; i++) {
                        // grab reviewer information from pull request
                        try {
                            pullRequest = pullRequests[i];
                            pullRequestId = pullRequest.pullRequestId;
                            reviewer = pullRequest.reviewers[0].displayName;
                            reviewerImageUrl = pullRequest.reviewers[0].imageUrl;
                            reviewerEmail = pullRequest.reviewers[0].uniqueName;
                            lastMergeSourceCommitId = pullRequest.lastMergeSourceCommit.commitId;
                            if (self.doesPullRequestInvolveMyFile(lastMergeSourceCommitId, commits)) {
                                foundFile = true;
                                break;
                            }
                        }
                        catch (err) {
                            self.telemetryClient.trackException(err);
                        }
                    }
                    if (foundFile) {
                        processObj.hasReviewer = true;
                        processObj.reviewedEmail = reviewerEmail;
                        processObj.reviewedImageUrl = reviewerImageUrl;
                        processObj.reviewedName = reviewer;
                        result.resolve(true);
                    }
                    result.resolve(false);
                    //}
                    //)
                    //self.processPullRequests(pullRequests, 0, processObj, result);
                });
            });
            return result.promise();
        };
        //-----------------------------------------------------------------------------
        // Private method that looks at a pull request and sees if it involves your file
        // by checking all the commits on the file vs the commit of the pull request
        //-----------------------------------------------------------------------------
        GitVCManager.prototype.doesPullRequestInvolveMyFile = function (sourceCommitId, commits) {
            for (var i = 0; i < commits.length; i++) {
                var commit = commits[i];
                if (commit.commitId === sourceCommitId) {
                    return true;
                }
            }
            return false;
        };
        //----------------------------------------------------------------------------
        // Private method that determines the byte length of a string
        //----------------------------------------------------------------------------
        GitVCManager.prototype.byteLength = function (str) {
            // returns the byte length of an utf8 string
            var s = str.length;
            for (var i = str.length - 1; i >= 0; i--) {
                var code = str.charCodeAt(i);
                if (code > 0x7f && code <= 0x7ff)
                    s++;
                else if (code > 0x7ff && code <= 0xffff)
                    s += 2;
                if (code >= 0xDC00 && code <= 0xDFFF)
                    i--; //trail surrogate
            }
            return s;
        };
        //---------------------------------------------------------------------------------------
        // Public method that given a source control file path and the parent folder, will
        // asyncronously call VSTS REST api's to determine the owner information
        //---------------------------------------------------------------------------------------
        GitVCManager.prototype.calculateOwners = function (path, parentFolder) {
            var self = this;
            var result = $.Deferred();
            VSS.require(["VSS/Service", "TFS/VersionControl/GitRestClient", "TFS/VersionControl/Contracts"], function (Service, RestClient, Contracts) {
                var gitClient = RestClient.getClient();
                // get changesets for this item
                gitClient.getCommits(self.actionContext.gitRepository.id, { itemPath: path }, undefined, undefined, undefined).then(function (gitCommits) {
                    var processObj = new ProcessFileValues();
                    // get latest commit
                    var latestCommit = gitCommits[0];
                    gitClient.getCommit(latestCommit.commitId, self.actionContext.gitRepository.id, undefined, undefined).then(function (gitCommit) {
                        processObj.latestName = gitCommit.push.pushedBy.displayName;
                        ;
                        processObj.latestImageUrl = gitCommit.push.pushedBy.imageUrl;
                        processObj.latestEmail = latestCommit.author.email;
                        processObj.latestChangesetId = latestCommit.commitId;
                        processObj.latestChangesetComment = latestCommit.comment;
                        processObj.latestChangesetUrl = gitCommit.push.url;
                        processObj.latestDate = gitCommit.push.date.toLocaleTimeString("en-us", self.dateOption);
                        //self.lastModifiedByChangesetUrl = self.webContext.collection.uri + self.webContext.project.name + "/_git/" + self.actionContext.gitRepository.name + "/commit/" + latestCommit.commitId;
                        processObj.lastModifiedByChangesetUrl = self.webContext.collection.uri + self.webContext.project.name + "/_git/" + self.actionContext.gitRepository.name + "/commit/" + latestCommit.commitId;
                        // get the first commit
                        var firstCommit = gitCommits[gitCommits.length - 1];
                        gitClient.getCommit(firstCommit.commitId, self.actionContext.gitRepository.id, undefined, undefined).then(function (gitCommit) {
                            processObj.firstName = gitCommit.push.pushedBy.displayName;
                            ;
                            processObj.firstImageUrl = gitCommit.push.pushedBy.imageUrl;
                            processObj.firstEmail = firstCommit.author.email;
                            processObj.firstChangesetId = firstCommit.commitId;
                            processObj.firstChangesetComment = firstCommit.comment;
                            processObj.firstChangesetUrl = gitCommit.push.url;
                            processObj.firstDate = gitCommit.push.date.toLocaleTimeString("en-us", self.dateOption);
                            //self.createdByChangesetUrl = self.webContext.collection.uri + self.webContext.project.name + "/_git/" + self.actionContext.gitRepository.name + "/commit/" + firstCommit.commitId;
                            processObj.createdByChangesetUrl = self.webContext.collection.uri + self.webContext.project.name + "/_git/" + self.actionContext.gitRepository.name + "/commit/" + firstCommit.commitId;
                            // get most contributed
                            var totalList = new OwnerTotalListGit(self.webContext, self.actionContext);
                            var tempCommit;
                            for (var i = 0; i < gitCommits.length; i++) {
                                tempCommit = gitCommits[i];
                                totalList.addUser(tempCommit.author.name, tempCommit.commitId, tempCommit.author.email);
                            }
                            totalList.getMostContributionOwner().then(function (mostContributed) {
                                processObj.mostContributedName = mostContributed.name;
                                processObj.mostContributedEmail = mostContributed.email;
                                processObj.mostContributedImageUrl = mostContributed.imageUrl;
                                // get parent most contributed
                                gitClient.getCommits(self.actionContext.gitRepository.id, { itemPath: parentFolder }, undefined, undefined, undefined).then(function (gitCommits) {
                                    var parentList = new OwnerTotalListGit(self.webContext, self.actionContext);
                                    for (var i = 0; i < gitCommits.length; i++) {
                                        tempCommit = gitCommits[i];
                                        parentList.addUser(tempCommit.author.name, tempCommit.commitId, tempCommit.author.email);
                                    }
                                    parentList.getMostContributionOwner().then(function (mostContributedParent) {
                                        processObj.mostContributedParentName = mostContributedParent.name;
                                        processObj.mostContributedParentEmail = mostContributedParent.email;
                                        processObj.mostContributedParentImageUrl = mostContributedParent.imageUrl;
                                        // get latest reviewed
                                        self.findLatestReviewed(processObj, gitCommits).then(function () {
                                            result.resolve(processObj);
                                            //self.finishProcessCallback(processObj, self.dialogSource)
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
            return result.promise();
        };
        //------------------------------------------------------------------------------------
        // Public method that asyncronously downloads a file from VSTS and determines the 
        // size of the file
        //------------------------------------------------------------------------------------
        GitVCManager.prototype.calculateFileLength = function (path) {
            var self = this;
            var result = $.Deferred();
            VSS.require(["VSS/Service", "TFS/VersionControl/GitRestClient", "TFS/VersionControl/Contracts"], function (Service, RestClient, Contracts) {
                var gitClient = RestClient.getClient();
                gitClient.getItemText(self.actionContext.gitRepository.id, path, undefined, undefined, undefined, undefined, undefined, true, undefined).then(function (stringItem) {
                    var sizeInBytes = self.byteLength(stringItem);
                    var sizeInKB = (sizeInBytes / 1024.0).toFixed(2);
                    result.resolve(sizeInKB);
                });
            });
            return result.promise();
        };
        return GitVCManager;
    })();
    exports.GitVCManager = GitVCManager;
});
//# sourceMappingURL=GitVCManager.js.map