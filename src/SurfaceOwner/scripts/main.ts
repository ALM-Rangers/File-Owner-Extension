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

class SurfaceOwnerMenu {
    private actionContext;

    //---------------------------------------------------------------------
    // Private method the returns the source control type.  Either TFVC
    // or Git
    //---------------------------------------------------------------------
    private getSourceControlType(): string {
        var sourceControlType = "TFVC";

        if (this.actionContext.gitRepository) {
            sourceControlType = "Git";
        }

        console.log("File Owner - SC type: " + sourceControlType);

        return sourceControlType;
    }

    //------------------------------------------------------------------------
    // This private method launches the surface owner properties dialog
    //------------------------------------------------------------------------
    private showDialog() {
        var self = this;

        VSS.getService("ms.vss-web.dialog-service").then((dialogSvc: IHostDialogService) => {
            
            // contribution info
            var extInfo = VSS.getExtensionContext();
            var dialogContributionId = extInfo.publisherId + "." + extInfo.extensionId + "." + "surfaceOwnerPropertiesDialog";

            // variable used to hold the dialog and the options for the dialog box
            var theDialog;
            var dialogOptions: IHostDialogOptions = {
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
            var routeToPage = function (url: string) {
                theDialog.close();
                window.parent.location.href = url;
            }

            // use the tfvc dialog service to open the dialog box
            dialogSvc.openDialog(dialogContributionId, dialogOptions).then((dialog) => {
                theDialog = dialog;

                dialog.getContributionInstance("surfaceOwnerPropertiesDialog").then((surfaceOwnerPropertiesDialogPresenter: any) => {
                    var path = self.actionContext.item.path
                    var sourceControlType = this.getSourceControlType();

                    surfaceOwnerPropertiesDialogPresenter.registerRouteToPage(routeToPage);
                    surfaceOwnerPropertiesDialogPresenter.initializeDialog(path, sourceControlType, self.actionContext);

                });
            })
        })
    }

    //------------------------------------------------------------------------
    // This public method gets called by VSTS when the File owner menu item
    // is clicked
    //------------------------------------------------------------------------
    public execute(actionContext) {
        this.actionContext = actionContext;
        this.showDialog();
    }




}


//------------------------------------------------------------------
// Registers this object for the surfaceOwnerProperties
//------------------------------------------------------------------
VSS.register("surfaceOwnerProperties", function (context) {
    console.log("File Owner - register");
    return new SurfaceOwnerMenu();
});
