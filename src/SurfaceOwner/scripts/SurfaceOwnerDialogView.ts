//---------------------------------------------------------------------
 // <copyright file="SurfaceOwner.ts">
 //    This code is licensed under the MIT License.
 //    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
 //    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
 //    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
 //    PARTICULAR PURPOSE AND NONINFRINGEMENT.
 // </copyright>
 // <summary>This class represents the view for the dialog
 // </summary>
 //---------------------------------------------------------------------


/// <reference path="ref/VSS.d.ts" />
/// <reference path="ref/jquery.d.ts" />
/// <reference path="ref/jquery.dd.d.ts" />
export class SurfaceOwnerDialogView implements ISurfaceOwnerDialogView {

    public setOwnerDropDownIndexByValue(value: string) {
        var dropDown = $("#currentOwnerDropDown").msDropDown().data("dd");
        dropDown.setIndexByValue(value);
    }

    public setOwnerDropDown(dropdownVM: any): void {
        var dropdown = $("#currentOwnerDropDown").msDropDown(dropdownVM).data("dd");
    }

    public initializeCurrentOwnerDropDown(): void {
        
        var jsonData = [
            { description: 'Choose your current owner', value: '', text: 'Selected Current Owner' },
            { image: '/images/msdropdown/icons/Amex-56.png', description: 'My life. My card...', value: 'amex', text: 'Amex' },
            { image: '/images/msdropdown/icons/Discover-56.png', description: 'It pays to Discover...', value: 'Discover', text: 'Discover' },
            { image: '/images/msdropdown/icons/Mastercard-56.png', title: 'For everything else...', description: 'For everything else...', value: 'Mastercard', text: 'Mastercard' },
            { image: '/images/msdropdown/icons/Cash-56.png', description: 'Sorry not available...', value: 'cash', text: 'Cash on devlivery', disabled: true },
            { image: '/images/msdropdown/icons/Visa-56.png', description: 'All you need...', value: 'Visa', text: 'Visa' },
            { image: '/images/msdropdown/icons/Paypal-56.png', description: 'Pay and get paid...', value: 'Paypal', text: 'Paypal' }
        ];
        var jsn = $("#currentOwnerDropDown").msDropDown({
            byJson: { data: jsonData, name: 'payments' }
        }).data("dd");
    }


    public setLocation(locationPath: string): void {
        $("#location").text(locationPath);
    }

    public setFileName(fileName: string): void {
        $('#fileName').text(fileName);
    }

    public setChangesetLabel(changesetLabel: string): void {
        $('#changesetLabel').text(changesetLabel);
    }
    public setFileSize(sizeInKB: string): void {
        $('#size').text(sizeInKB + " KB");
    }

    public setFileInfo(values: ProcessFileValues, router) {
        $("#loadingMessage").hide();
        $('#dialogWindow').show();
        $('#createdByImage').attr('src', values.firstImageUrl);
        $('#createdByUser').text(values.firstName);
        $('#createdByDate').text(values.firstDate);
        $('#createdByComment').text(values.firstChangesetComment);
        $('#createdByChangeset').text(values.firstChangesetId);
        $("#createdByUserEmail").attr('href', "mailto:" + values.firstEmail);

        $('#lastModifiedByImage').attr('src', values.latestImageUrl);
        $('#lastModifiedByUser').text(values.latestName);
        $('#lastModifiedByDate').text(values.latestDate);
        $('#lastModifiedComment').text(values.latestChangesetComment);
        $('#lastModifiedByChangeset').text(values.latestChangesetId);
        $("#lastModifiedByEmail").attr('href', "mailto:" + values.latestEmail);

        $('#mostContributedImage').attr('src', values.mostContributedImageUrl);
        $('#mostContributedUser').text(values.mostContributedName);
        $('#mostContributedUserEmail').attr('href', "mailto:" + values.mostContributedEmail);

        $('#mostContributionsToFolderImage').attr('src', values.mostContributedParentImageUrl);
        $('#mostContributionsToFolderUser').text(values.mostContributedParentName);
        $('#mostContributionsToFolderEmail').attr('href', "mailto:" + values.mostContributedParentEmail);

        $('#recentlyReviewedImage').attr('src', values.reviewedImageUrl);

        if (!values.hasReviewer) {
            $("#recentlyReviewed").hide();
        }
        else {
            $("#recentlyReviewed").show();
            $('#recentlyReviewedImage').attr('src', values.reviewedImageUrl);
            $('#recentlyReviewedUser').text(values.reviewedName);
            $('#recentlyReviewedEmail').attr('href', "mailto:" + values.reviewedEmail);

        }

        $("#createdByChangeset").click(function () {
            router(values.createdByChangesetUrl);
        });

        $("#lastModifiedByChangeset").click(function () {
            router(values.lastModifiedByChangesetUrl);
        });

        $("#createdByChangeset").click(function () {
            router(values.createdByChangesetUrl);
        });

        $("#lastModifiedByChangeset").click(function () {
            router(values.lastModifiedByChangesetUrl);
        });
    }
}
