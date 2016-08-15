//---------------------------------------------------------------------
// <copyright file="dialog.ts">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary>This class represents the dialog presenter and has all the logic associated
//          to the dialog box.</summary>
//---------------------------------------------------------------------
import surfaceOwner = require("Scripts/SurfaceOwnerDialogView");
import tfvcMgr = require("Scripts/TFVCManager");
import gitvcMgr = require("Scripts/GitVCManager");
import AI = require("Scripts/TelemetryClient");

class SurfaceOwnerDialogPresenter {
    private versionControlType: string;
    private path: string;
    private size: string;
    private view: ISurfaceOwnerDialogView;
    private vcManager: IVCManager;
    private homePageRouter;
    private webContext: WebContext;
    private actionContext;
    private ownerDropDownVM: any;
    private telemetryClient: AI.TelemetryClient;
   

    //----------------------------------------------------------------------------------
    // This method is the constructor for the dialog object
    //----------------------------------------------------------------------------------
    constructor() {
        this.view = new surfaceOwner.SurfaceOwnerDialogView();
    }

    //---------------------------------------------------------------------------------
    // This private method gets all the team members for a team project using VSTS REST
    // api's, then populates the view with all the team project users
    //---------------------------------------------------------------------------------
    private getTeamMembers(): void {
        var self = this;
        var rawRestClient = new UsersRawRestClient(self.webContext);
        rawRestClient.processTeamMembers().then((result) => {

            // create drop down view model based on list of users
            self.ownerDropDownVM = {
                byJson: { data: result, name: 'payments' },
                on: {
                    change: self.selectedNewUser,
                    webContext: self.webContext,
                    actionContext: self.actionContext,
                    path: self.path,
                    versionControlType: self.versionControlType
                }

            };

            // set the view model the the drop down in the view
            self.view.setOwnerDropDown(self.ownerDropDownVM);

            // see if there is a an owner already set
            // Get data service
            var key = "";
            if (self.versionControlType === "TFVC") {
                key = self.path;
            }
            else {
                key = self.actionContext.gitRepository.name + self.path;
            }
            key = key.replace(/\//g, "_");
            key = key.replace(/\./g, "_");
            var hasher = new MD5Hasher();
            key = hasher.Hash(key);
            VSS.getService(VSS.ServiceIds.ExtensionData).then(function (dataService: any) {
                // Get value in user scope
                dataService.getValue(key).then(function (value) {
                    console.log("key value is " + value);
                    self.view.setOwnerDropDownIndexByValue(value);
                });
            });
        });
    }

    //---------------------------------------------------------------------------------
    // This private method takes the selected file and processes it to get the file 
    // name, the location, the suggested owners and the file size and sets it 
    // in the view
    //---------------------------------------------------------------------------------
    private processFile(properties:any): void {
        var self = this


        // set up telemetry
        var timerStart = new Date().getTime();
        var metrics = {};
        

        // get file name and location and update form
        var fileName = self.path.replace(/^.*[\\\/]/, '');
        var location = self.path.replace(/[^\/]*$/, '');
        self.view.setLocation(location);
        self.view.setFileName(fileName);

        // get file object from VC
        self.vcManager.calculateOwners(self.path, location).then((processFileValues) => {
            var timerStopCalculateOwners = new Date().getTime();
            var diff = timerStopCalculateOwners - timerStart;
            metrics["Processing Time"] = diff.toString();
            self.telemetryClient.trackEvent("Calculate_File_Owners", properties, metrics);
            
            self.view.setFileInfo(processFileValues, self.homePageRouter);
        });
        self.vcManager.calculateFileLength(self.path).then((sizeInKB) => {
            var timerStopFileLength = new Date().getTime();
            var diff = timerStopFileLength - timerStart;
            metrics["Processing Time"] = diff.toString();
            self.telemetryClient.trackEvent("Calculate_File_Length", properties, metrics);

            self.view.setFileSize(sizeInKB);
        });
    }

    //---------------------------------------------------------------------------------
    // This public method is a call back used when the user selects an owner for a file
    // using the drop down.  This method then saves the selected user in the vsts data
    // service
    //---------------------------------------------------------------------------------
    public selectedNewUser(data): void {
        // this returns back a reference to the on object in the ownerDropDownVM
        var self = this;

        // Get data service
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (dataService: any) {
            var key = "";
            if (self.versionControlType === "TFVC") {
                key = self.path;
            }
            else {
                key = self.actionContext.gitRepository.name + self.path;
            }
            key = key.replace(/\//g, "_");
            key = key.replace(/\./g, "_");
            var hasher = new MD5Hasher();
            key = hasher.Hash(key);
            // persist in project store scoped across the collection
            dataService.setValue(key, data.value).then(function (value) {
                console.log("key value is " + value);
            });
        });
    }

   
    //-----------------------------------------------------------------------------------
    // This public method is used by the framework to initialize and start everything.
    // This is called by SurfaceOwnerMenu.
    //-----------------------------------------------------------------------------------
    public initializeDialog(path: string, versionControl: string, actionContext) {
        var self = this;
        self.actionContext = actionContext;
        self.telemetryClient = AI.TelemetryClient.getClient();

        // get initial values
        self.webContext = VSS.getWebContext();
        self.path = path;
        self.versionControlType = versionControl;
        
        // build out team member drop down, taking this out until we can get a real
        // identity control in
        //self.getTeamMembers();

        // used to track telemetry
        var properties = {};
        properties["Path"] = path;
        properties["Collection URL"] = self.webContext.collection.uri;
        properties["User"] = self.webContext.user.name;

        // based on version control type, create VCManager 
        if (self.versionControlType === "TFVC") {
            // track telemetry
            properties["Repository Type"] = "TFVC";
            
            self.vcManager = new tfvcMgr.TFVCManager(self.webContext);
            self.view.setChangesetLabel("Changeset:");
        }
        else {
            // track telemetry
            properties["Repository Type"] = "Git";
            
            // create a git manager
            self.vcManager = new gitvcMgr.GitVCManager(self.webContext, self.actionContext, self.telemetryClient);
            self.view.setChangesetLabel("Commit:");
        }

        // track telemetry for getting file owner for a file
        self.telemetryClient.trackEvent("Surface_File_Owner_Called", properties);

        // get form values
        self.processFile(properties);

    }

    //-----------------------------------------------------------------------------------
    // This public method is used to register the home page router from main.ts which is 
    // then used to redirect the browser page to other pages
    //-----------------------------------------------------------------------------------
    public registerRouteToPage(router) {
        var self = this;

        self.homePageRouter = router;
    }
}


VSS.register("surfaceOwnerPropertiesDialog", function (context) {
    return new SurfaceOwnerDialogPresenter();
});

VSS.notifyLoadSucceeded();