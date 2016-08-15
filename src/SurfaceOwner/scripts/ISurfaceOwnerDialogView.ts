//---------------------------------------------------------------------
 // <copyright file="ISurfaceOwnerDialogView.ts">
 //    This code is licensed under the MIT License.
 //    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
 //    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
 //    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
 //    PARTICULAR PURPOSE AND NONINFRINGEMENT.
 // </copyright>
 // <summary> This interface defines all the methods used by the 
 //          surface ownder dialog view.
 // </summary>
 //---------------------------------------------------------------------
interface ISurfaceOwnerDialogView {
    initializeCurrentOwnerDropDown(): void;
    setLocation(path: string): void;
    setFileName(fileName: string): void;
    setFileSize(sizeInKB: string): void;
    setFileInfo(values: ProcessFileValues, homepageRouter): void;
    setChangesetLabel(changesetLabel: string): void;
    setOwnerDropDown(dropdownVM: any): void;
    setOwnerDropDownIndexByValue(value: string): void;
}