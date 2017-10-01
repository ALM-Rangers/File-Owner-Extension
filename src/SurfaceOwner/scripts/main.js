//---------------------------------------------------------------------
// <copyright file="main.ts">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary>
// TypeScript class that adds the menu action and shows the dialog.
// </summary>
//---------------------------------------------------------------------
/// <reference path='ref/VSS.d.ts' />
var SurfaceOwnerMenu = (function () {
    function SurfaceOwnerMenu() {
    }
    //---------------------------------------------------------------------
    // Private method the returns the source control type.  Either TFVC
    // or Git
    //---------------------------------------------------------------------
    SurfaceOwnerMenu.prototype.getSourceControlType = function () {
        var sourceControlType = "TFVC";
        if (this.actionContext.gitRepository) {
            sourceControlType = "Git";
        }
        console.log("File Owner - SC type: " + sourceControlType);
        return sourceControlType;
    };
    //------------------------------------------------------------------------
    // This private method launches the surface owner properties dialog
    //------------------------------------------------------------------------
    SurfaceOwnerMenu.prototype.showDialog = function () {
        var _this = this;
        var self = this;
        VSS.getService("ms.vss-web.dialog-service").then(function (dialogSvc) {
            // contribution info
            var extInfo = VSS.getExtensionContext();
            var dialogContributionId = extInfo.publisherId + "." + extInfo.extensionId + "." + "surfaceOwnerPropertiesDialog";
            // variable used to hold the dialog and the options for the dialog box
            var theDialog;
            var dialogOptions = {
                title: "File Owners",
                width: 430,
                height: 476,
                draggable: false,
                modal: true,
                //defaultButton: "close",
                buttons: {
                    "close": {
                        id: "close",
                        text: "Close",
                        click: function () {
                            theDialog.close();
                        }
                    }
                }
            };
            //callback function that will route the browser to a url
            var routeToPage = function (url) {
                theDialog.close();
                window.parent.location.href = url;
            };
            // use the tfvc dialog service to open the dialog box
            dialogSvc.openDialog(dialogContributionId, dialogOptions).then(function (dialog) {
                theDialog = dialog;
                dialog.getContributionInstance("surfaceOwnerPropertiesDialog").then(function (surfaceOwnerPropertiesDialogPresenter) {
                    var path = self.actionContext.item.path;
                    var sourceControlType = _this.getSourceControlType();
                    surfaceOwnerPropertiesDialogPresenter.registerRouteToPage(routeToPage);
                    surfaceOwnerPropertiesDialogPresenter.initializeDialog(path, sourceControlType, self.actionContext);
                });
            });
        });
    };
    //------------------------------------------------------------------------
    // This public method gets called by VSTS when the File owner menu item
    // is clicked
    //------------------------------------------------------------------------
    SurfaceOwnerMenu.prototype.execute = function (actionContext) {
        this.actionContext = actionContext;
        this.showDialog();
    };
    return SurfaceOwnerMenu;
}());
//------------------------------------------------------------------
// Registers this object for the surfaceOwnerProperties
//------------------------------------------------------------------
VSS.register("surfaceOwnerProperties", function (context) {
    console.log("File Owner - register");
    return new SurfaceOwnerMenu();
});
//# sourceMappingURL=main.js.map