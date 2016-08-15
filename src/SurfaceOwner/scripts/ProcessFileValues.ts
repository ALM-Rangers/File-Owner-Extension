//---------------------------------------------------------------------
 // <copyright file="ProcessFileValues.ts">
 //    This code is licensed under the MIT License.
 //    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
 //    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
 //    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
 //    PARTICULAR PURPOSE AND NONINFRINGEMENT.
 // </copyright>
 // <summary>This class holds all the user owner information for a file
 // </summary>
 //---------------------------------------------------------------------
class ProcessFileValues {
    public latestName: string;
    public latestImageUrl: string;
    public latestEmail: string;
    public latestChangesetId: string;
    public latestChangesetComment: string;
    public latestChangesetUrl: string;
    public latestDate: string;
    public lastModifiedByChangesetUrl: string;

    public firstName: string;
    public firstImageUrl: string;
    public firstEmail: string;
    public firstChangesetId: string;
    public firstChangesetComment: string;
    public firstChangesetUrl: string;
    public firstDate: string;
    public createdByChangesetUrl: string;

    public mostContributedName: string;
    public mostContributedEmail: string;
    public mostContributedImageUrl: string;

    public mostContributedParentName: string;
    public mostContributedParentEmail: string;
    public mostContributedParentImageUrl: string;

    public hasReviewer: boolean = false;
    public reviewedName: string;
    public reviewedEmail: string;
    public reviewedImageUrl: string;

   

}